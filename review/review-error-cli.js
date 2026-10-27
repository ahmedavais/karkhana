import { appendFileSync, readFileSync } from 'node:fs';
import { reviewError } from './review-error.js';

const error = reviewError(JSON.parse(readFileSync(process.env.EXECUTION_FILE, 'utf8')));

if (error) console.log(`::warning title=Review errored::${error.replaceAll('\n', ' ')}`);
appendFileSync(process.env.GITHUB_OUTPUT, `retry=${error !== null}\n`);
