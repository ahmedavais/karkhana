import { appendFileSync } from 'node:fs';
import { isRoutineUpdate } from './routine-update.js';

function lines(text = '') {
  return text.split('\n').filter((line) => line.trim() !== '');
}

function commitFrom(line) {
  const [author, verified] = line.trim().split(/\s+/);
  return { author, verified: verified === 'true' };
}

const routine = isRoutineUpdate({
  author: process.env.PR_AUTHOR,
  commits: lines(process.env.COMMITS).map(commitFrom),
  files: lines(process.env.FILES),
});

console.log(routine ? 'Routine dependency update: skipping the review' : 'Reviewing');
appendFileSync(process.env.GITHUB_OUTPUT, `routine=${routine}\n`);
