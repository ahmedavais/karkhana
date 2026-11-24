import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { loweredDependencies } from './downgrade-guard.js';

function gitSucceeds(...args) {
  try {
    execFileSync('git', args, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isOnBase(path) {
  return gitSucceeds('cat-file', '-e', `${process.env.BASE_REF}:${path}`);
}

function baseLock(path) {
  return JSON.parse(execFileSync('git', ['show', `${process.env.BASE_REF}:${path}`], { encoding: 'utf8' }));
}

function loweredIn(path) {
  if (!isOnBase(path) || !existsSync(path)) return [];
  const headLock = JSON.parse(readFileSync(path, 'utf8'));
  return loweredDependencies(baseLock(path), headLock).map((dependency) => ({ path, ...dependency }));
}

if (!gitSucceeds('rev-parse', '--verify', '--quiet', `${process.env.BASE_REF}^{commit}`)) {
  console.log(`::error::No base branch ${process.env.BASE_REF} to compare with`);
  process.exit(1);
}

const isLockFile = (path) => path.split('/').at(-1) === 'package-lock.json';
const lockFiles = process.env.CHANGED_FILES.split('\n').filter(isLockFile);
const lowered = lockFiles.flatMap(loweredIn);

for (const { path, name, from, to } of lowered) {
  console.log(`::error file=${path}::${name} moved from ${from} to ${to}, below the version on the base branch`);
}
if (lowered.length === 0) console.log('No direct dependency moved to an older version');
process.exitCode = lowered.length > 0 ? 1 : 0;
