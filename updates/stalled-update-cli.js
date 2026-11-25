import { readFileSync } from 'node:fs';
import { stalledUpdates } from './stalled-update.js';

const pullRequests = JSON.parse(readFileSync(process.argv[2], 'utf8'));
console.log(JSON.stringify(stalledUpdates(pullRequests, new Date())));
