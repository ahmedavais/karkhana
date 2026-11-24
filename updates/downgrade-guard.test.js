import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loweredDependencies } from './downgrade-guard.js';

function lock(direct, locked = direct) {
  const packages = { '': { dependencies: rangesFor(direct) } };
  for (const [name, version] of Object.entries(locked)) packages[`node_modules/${name}`] = { version };
  return { packages };
}

function rangesFor(versions) {
  return Object.fromEntries(Object.keys(versions).map((name) => [name, '*']));
}

test('a lock file with the same versions lowers nothing', () => {
  const base = lock({ astro: '7.4.7' });

  const lowered = loweredDependencies(base, lock({ astro: '7.4.7' }));

  assert.deepEqual(lowered, []);
});

test('a direct dependency locked to an older version is reported with both versions', () => {
  const base = lock({ astro: '7.4.7' });

  const lowered = loweredDependencies(base, lock({ astro: '7.4.5' }));

  assert.deepEqual(lowered, [{ name: 'astro', from: '7.4.7', to: '7.4.5' }]);
});

test('a direct dependency locked to a newer version is not reported', () => {
  const base = lock({ astro: '7.4.7' });

  const lowered = loweredDependencies(base, lock({ astro: '7.4.8' }));

  assert.deepEqual(lowered, []);
});

test('versions compare by number, not by text', () => {
  const base = lock({ vitest: '1.9.0' });

  const lowered = loweredDependencies(base, lock({ vitest: '1.10.0' }));

  assert.deepEqual(lowered, []);
});
