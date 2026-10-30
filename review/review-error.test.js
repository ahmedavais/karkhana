import assert from 'node:assert/strict';
import { test } from 'node:test';
import { reviewError, shouldRetryReview } from './review-error.js';

const turn = { type: 'assistant', message: { content: [] } };

test('a server overload retries the review', () => {
  const messages = [{ type: 'result', subtype: 'success', is_error: true, result: 'API Error: 529 overloaded' }];

  assert.equal(shouldRetryReview(messages), true);
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
