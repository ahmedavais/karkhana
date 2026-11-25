import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stalledUpdates } from './stalled-update.js';

const NOW = new Date('2026-11-25T12:00:00Z');

test('with no open pull requests nothing has stalled', () => {
  const stalled = stalledUpdates([], NOW);

  assert.deepEqual(stalled, []);
});

function renovateUpdate({ number = 156, createdAt = '2026-11-16T12:00:00Z', assignees = [], checks = [] } = {}) {
  return { number, createdAt, author: { login: 'app/renovate' }, assignees, statusCheckRollup: checks };
}

const checkRun = (name, conclusion, status = 'COMPLETED') => ({ __typename: 'CheckRun', name, status, conclusion });

test('an unassigned Renovate update open more than three days has stalled, naming its cancelled check', () => {
  const update = renovateUpdate({ checks: [checkRun('commit-prefixes', 'CANCELLED')] });

  const stalled = stalledUpdates([update], NOW);

  assert.equal(stalled.length, 1);
  assert.equal(stalled[0].number, 156);
  assert.match(stalled[0].comment, /commit-prefixes: CANCELLED/);
});

test('an update open exactly three days has not stalled yet', () => {
  const update = renovateUpdate({ createdAt: '2026-11-22T12:00:00Z' });

  const stalled = stalledUpdates([update], NOW);

  assert.deepEqual(stalled, []);
});

test('an update already assigned to someone has not stalled, however old', () => {
  const update = renovateUpdate({ assignees: [{ login: 'ahmedavais' }] });

  const stalled = stalledUpdates([update], NOW);

  assert.deepEqual(stalled, []);
});

test('a pull request a person opened is not an update, however old', () => {
  const update = { ...renovateUpdate(), author: { login: 'ahmedavais' } };

  const stalled = stalledUpdates([update], NOW);

  assert.deepEqual(stalled, []);
});

test('the comment names a status context still pending', () => {
  const pending = { __typename: 'StatusContext', context: 'renovate/stability-days', state: 'PENDING' };

  const [{ comment }] = stalledUpdates([renovateUpdate({ checks: [pending] })], NOW);

  assert.match(comment, /renovate\/stability-days: PENDING/);
});

test('the comment names a check run still in progress by its status', () => {
  const running = checkRun('test', '', 'IN_PROGRESS');

  const [{ comment }] = stalledUpdates([renovateUpdate({ checks: [running] })], NOW);

  assert.match(comment, /test: IN_PROGRESS/);
});

test('the comment leaves out checks Renovate reads as green: passed, skipped and neutral', () => {
  const checks = [
    checkRun('lint', 'SUCCESS'),
    checkRun('downgrade-guard', 'SKIPPED'),
    checkRun('advisory', 'NEUTRAL'),
    { __typename: 'StatusContext', context: 'renovate/stability-days', state: 'SUCCESS' },
    checkRun('commit-prefixes', 'CANCELLED'),
  ];

  const [{ comment }] = stalledUpdates([renovateUpdate({ checks })], NOW);

  assert.doesNotMatch(comment, /lint|downgrade-guard|advisory|stability-days/);
  assert.match(comment, /commit-prefixes: CANCELLED/);
});

test('a stalled update whose checks all passed says something other than a check holds it', () => {
  const [{ comment }] = stalledUpdates([renovateUpdate({ checks: [checkRun('lint', 'SUCCESS')] })], NOW);

  assert.match(comment, /every check has passed/i);
});

test('the comment says how long the update has been open and lists the checks holding it', () => {
  const update = renovateUpdate({ checks: [checkRun('commit-prefixes', 'CANCELLED'), checkRun('test', 'FAILURE')] });

  const [{ comment }] = stalledUpdates([update], NOW);

  assert.match(comment, /open 9 days/);
  assert.match(comment, /\n- commit-prefixes: CANCELLED\n- test: FAILURE$/);
});
