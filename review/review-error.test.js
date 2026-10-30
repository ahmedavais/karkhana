import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { reviewError, shouldRetryReview } from './review-error.js';

const turn = { type: 'assistant', message: { content: [] } };

test('a server overload retries the review', () => {
  const messages = [{ type: 'result', subtype: 'success', is_error: true, result: 'API Error: 529 overloaded' }];

  assert.equal(shouldRetryReview(messages), true);
});

test('a usage limit does not retry the review', () => {
  const messages = [{ type: 'result', subtype: 'success', is_error: true, result: 'Usage limit reached · resets tomorrow' }];

  assert.equal(shouldRetryReview(messages), false);
});

test('a subscriber who has hit their limit does not retry the review', () => {
  const messages = [{ type: 'result', subtype: 'success', is_error: true, result: "You've hit your limit · resets tomorrow" }];

  assert.equal(shouldRetryReview(messages), false);
});

test('a usage limit beyond the warning cutoff still prevents a retry', () => {
  const messages = [{ type: 'result', subtype: 'success', is_error: true, result: `${'x'.repeat(300)} Usage limit reached` }];

  assert.equal(shouldRetryReview(messages), false);
  assert.equal(reviewError(messages).length, 300);
});

test('weekly, session, and alternate subscriber limit messages do not retry', () => {
  const limits = ['Weekly limit reached', 'Session limit reached', 'You have hit your limit', 'You’ve hit your limit'];

  for (const result of limits) {
    assert.equal(shouldRetryReview([{ type: 'result', subtype: 'success', is_error: true, result }]), false, result);
  }
});

test('a temporary HTTP 429 remains retryable', () => {
  const messages = [{ type: 'result', subtype: 'success', is_error: true, result: 'API Error: 429 Rate limit exceeded, retry later' }];

  assert.equal(shouldRetryReview(messages), true);
});

test('the CLI keeps a usage-limit warning while writing retry=false', (context) => {
  const folder = mkdtempSync(join(tmpdir(), 'review-error-'));
  context.after(() => rmSync(folder, { recursive: true, force: true }));
  const executionFile = join(folder, 'execution.json');
  const outputFile = join(folder, 'output');
  writeFileSync(executionFile, JSON.stringify([{ type: 'result', subtype: 'success', is_error: true, result: 'Usage limit reached' }]));

  const warning = execFileSync(process.execPath, [fileURLToPath(new URL('./review-error-cli.js', import.meta.url))], {
    encoding: 'utf8',
    env: { ...process.env, EXECUTION_FILE: executionFile, GITHUB_OUTPUT: outputFile },
  });

  assert.match(warning, /::warning title=Review errored::Usage limit reached/);
  assert.equal(readFileSync(outputFile, 'utf8'), 'retry=false\n');
});

test('a run whose result is an error gives back its message', () => {
  const messages = [turn, { type: 'result', subtype: 'success', is_error: true, result: 'API Error: 529 overloaded' }];

  assert.equal(reviewError(messages), 'API Error: 529 overloaded');
});

test('a run that finished is not an error', () => {
  const messages = [turn, { type: 'result', subtype: 'success', is_error: false, result: 'No findings.' }];

  assert.equal(reviewError(messages), null);
});

test('a run that ran out of turns is not an error worth retrying', () => {
  const messages = [turn, { type: 'result', subtype: 'error_max_turns', is_error: true }];

  assert.equal(reviewError(messages), null);
});

test('a run with no result is not an error worth retrying', () => {
  assert.equal(reviewError([turn]), null);
});

test('an error with no message still counts', () => {
  const messages = [{ type: 'result', subtype: 'success', is_error: true }];

  assert.equal(reviewError(messages), 'no message');
});

test('a long message is cut to 300 characters', () => {
  const messages = [{ type: 'result', subtype: 'success', is_error: true, result: 'x'.repeat(400) }];

  assert.equal(reviewError(messages).length, 300);
});
