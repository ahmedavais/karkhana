import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isRoutineUpdate } from './routine-update.js';

const renovateCommit = { author: 'renovate[bot]', verified: true };

function update(changes = {}) {
  return { author: 'renovate[bot]', commits: [renovateCommit], files: ['package-lock.json'], ...changes };
}

test('a Renovate pull request changing only lock files and manifests is routine', () => {
  const files = ['package.json', 'package-lock.json', 'site/pnpm-lock.yaml', 'pyproject.toml', 'uv.lock'];

  assert.equal(isRoutineUpdate(update({ files })), true);
});

test('a pull request someone else opened is not routine', () => {
  assert.equal(isRoutineUpdate(update({ author: 'ahmedavais' })), false);
});

test('a Renovate pull request touching a workflow is not routine', () => {
  const files = ['package-lock.json', '.github/workflows/ci.yml'];

  assert.equal(isRoutineUpdate(update({ files })), false);
});

test('a Renovate pull request touching any other file is not routine', () => {
  assert.equal(isRoutineUpdate(update({ files: ['.nvmrc'] })), false);
});

test('a commit someone else pushed onto a Renovate branch makes it not routine', () => {
  const commits = [renovateCommit, { author: 'ahmedavais', verified: true }];

  assert.equal(isRoutineUpdate(update({ commits })), false);
});

test('an unsigned commit claiming to be Renovate makes it not routine', () => {
  const commits = [{ author: 'renovate[bot]', verified: false }];

  assert.equal(isRoutineUpdate(update({ commits })), false);
});

test('a pull request with no changed files listed is not routine', () => {
  assert.equal(isRoutineUpdate(update({ files: [] })), false);
});

test('a pull request with no commits listed is not routine', () => {
  assert.equal(isRoutineUpdate(update({ commits: [] })), false);
});
