import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('./stalled-update-cli.js', import.meta.url));

function pullRequestsFile(context, pullRequests) {
  const folder = mkdtempSync(join(tmpdir(), 'stalled-update-'));
  context.after(() => rmSync(folder, { recursive: true, force: true }));
  const path = join(folder, 'pull-requests.json');
  writeFileSync(path, JSON.stringify(pullRequests));
  return path;
}

function renovateUpdate(number, createdAt) {
  return { number, createdAt, author: { login: 'app/renovate' }, assignees: [], statusCheckRollup: [] };
}

test('prints the stalled updates among the listed pull requests, judged against the current time', (context) => {
  const path = pullRequestsFile(context, [
    renovateUpdate(156, '2026-01-01T00:00:00Z'),
    renovateUpdate(157, new Date().toISOString()),
  ]);

  const run = spawnSync(process.execPath, [CLI, path], { encoding: 'utf8' });

  assert.equal(run.status, 0);
  assert.deepEqual(JSON.parse(run.stdout).map(({ number }) => number), [156]);
});
