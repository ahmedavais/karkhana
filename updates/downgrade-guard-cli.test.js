import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('./downgrade-guard-cli.js', import.meta.url));

function lockWith(version) {
  return JSON.stringify({ packages: { '': { dependencies: { astro: '^7.4.0' } }, 'node_modules/astro': { version } } });
}

function repository(context) {
  const folder = mkdtempSync(join(tmpdir(), 'downgrade-guard-'));
  context.after(() => rmSync(folder, { recursive: true, force: true }));
  const withoutPersonalConfig = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null' };
  const git = (...args) => execFileSync('git', args, { cwd: folder, env: withoutPersonalConfig });
  git('init', '--quiet', '--initial-branch=main');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'Test');
  const commit = (files) => {
    for (const [path, content] of Object.entries(files)) {
      mkdirSync(dirname(join(folder, path)), { recursive: true });
      writeFileSync(join(folder, path), content);
    }
    git('add', '.');
    git('commit', '--quiet', '--message', 'change');
  };
  return { folder, commit, branch: () => git('switch', '--quiet', '--create', 'update') };
}

function guard(folder, changedFiles, baseRef = 'main') {
  return spawnSync(process.execPath, [CLI], {
    cwd: folder,
    encoding: 'utf8',
    env: { ...process.env, BASE_REF: baseRef, CHANGED_FILES: changedFiles.join('\n') },
  });
}

test('an update that lowers a direct dependency fails naming it and both versions', (context) => {
  const { folder, commit, branch } = repository(context);
  commit({ 'package-lock.json': lockWith('7.4.7') });
  branch();
  commit({ 'package-lock.json': lockWith('7.4.5') });

  const run = guard(folder, ['package-lock.json']);

  assert.equal(run.status, 1);
  assert.match(run.stdout, /::error file=package-lock\.json::astro moved from 7\.4\.7 to 7\.4\.5/);
});

test('an update that only raises versions passes, whatever else it changes', (context) => {
  const { folder, commit, branch } = repository(context);
  commit({ 'package.json': '{}', 'package-lock.json': lockWith('7.4.5') });
  branch();
  commit({ 'package.json': '{"private":true}', 'package-lock.json': lockWith('7.4.7') });

  const run = guard(folder, ['package.json', 'package-lock.json']);

  assert.equal(run.status, 0);
  assert.match(run.stdout, /No direct dependency moved to an older version/);
});

test('a lock file the base branch does not have passes', (context) => {
  const { folder, commit, branch } = repository(context);
  commit({ 'README.md': 'project' });
  branch();
  commit({ 'site/package-lock.json': lockWith('7.4.5') });

  const run = guard(folder, ['site/package-lock.json']);

  assert.equal(run.status, 0);
});

test('a lock file the pull request deletes passes', (context) => {
  const { folder, commit, branch } = repository(context);
  commit({ 'README.md': 'project', 'site/package-lock.json': lockWith('7.4.7') });
  branch();
  rmSync(join(folder, 'site'), { recursive: true });
  commit({});

  const run = guard(folder, ['site/package-lock.json']);

  assert.equal(run.status, 0);
});

test('a base branch that does not exist fails rather than passing unchecked', (context) => {
  const { folder, commit, branch } = repository(context);
  commit({ 'package-lock.json': lockWith('7.4.7') });
  branch();
  commit({ 'package-lock.json': lockWith('7.4.5') });

  const run = guard(folder, ['package-lock.json'], 'origin/main');

  assert.equal(run.status, 1);
  assert.match(run.stdout, /::error::No base branch origin\/main to compare with/);
});
