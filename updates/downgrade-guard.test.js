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

test('dev, optional and peer dependencies count as direct', () => {
  const root = { devDependencies: { vitest: '*' }, optionalDependencies: { sharp: '*' }, peerDependencies: { eslint: '*' } };
  const withVersions = (version) => ({
    packages: {
      '': root,
      'node_modules/vitest': { version },
      'node_modules/sharp': { version },
      'node_modules/eslint': { version },
    },
  });

  const lowered = loweredDependencies(withVersions('2.0.0'), withVersions('1.0.0'));

  assert.deepEqual(
    lowered.map(({ name }) => name),
    ['vitest', 'sharp', 'eslint'],
  );
});

test('a dependency new in this lock file is not reported', () => {
  const base = lock({ astro: '7.4.7' });

  const lowered = loweredDependencies(base, lock({ astro: '7.4.7', semver: '7.8.6' }));

  assert.deepEqual(lowered, []);
});

test('a transitive dependency locked to an older version is not reported', () => {
  const base = lock({ astro: '7.4.7' }, { astro: '7.4.7', vite: '8.1.0' });

  const lowered = loweredDependencies(base, lock({ astro: '7.4.7' }, { astro: '7.4.7', vite: '8.0.0' }));

  assert.deepEqual(lowered, []);
});

test('a git dependency, which locks a commit instead of a version, is not reported', () => {
  const base = { packages: { '': { devDependencies: { karkhana: 'github:ahmedavais/karkhana' } }, 'node_modules/karkhana': {} } };

  const lowered = loweredDependencies(base, base);

  assert.deepEqual(lowered, []);
});

test('versions compare by number, not by text', () => {
  const base = lock({ vitest: '1.9.0' });

  const lowered = loweredDependencies(base, lock({ vitest: '1.10.0' }));

  assert.deepEqual(lowered, []);
});

test('a prerelease is older than its release', () => {
  const base = lock({ astro: '7.4.7' });

  const lowered = loweredDependencies(base, lock({ astro: '7.4.7-beta.1' }));

  assert.deepEqual(lowered, [{ name: 'astro', from: '7.4.7', to: '7.4.7-beta.1' }]);
});

test('prereleases of one release compare by their numbered parts', () => {
  const base = lock({ astro: '8.0.0-beta.10' });

  const lowered = loweredDependencies(base, lock({ astro: '8.0.0-beta.2' }));

  assert.deepEqual(lowered, [{ name: 'astro', from: '8.0.0-beta.10', to: '8.0.0-beta.2' }]);
});

test('a prerelease with fewer parts is older than one that extends it', () => {
  const base = lock({ astro: '8.0.0-beta.1' });

  const lowered = loweredDependencies(base, lock({ astro: '8.0.0-beta' }));

  assert.deepEqual(lowered, [{ name: 'astro', from: '8.0.0-beta.1', to: '8.0.0-beta' }]);
});
