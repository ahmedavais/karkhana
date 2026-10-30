import { appendFileSync, readFileSync } from 'node:fs';
import { reviewError, shouldRetryReview } from './review-error.js';

const messages = JSON.parse(readFileSync(process.env.EXECUTION_FILE, 'utf8'));
const error = reviewError(messages);

if (error) console.log(`::warning title=Review errored::${error.replaceAll('\n', ' ')}`);
appendFileSync(process.env.GITHUB_OUTPUT, `retry=${shouldRetryReview(messages)}\n`);
