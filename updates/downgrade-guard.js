import { compareVersions } from './version-order.js';

const DIRECT_DEPENDENCY_KINDS = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];

function directDependencies(lock) {
  const root = lock.packages[''];
  return DIRECT_DEPENDENCY_KINDS.flatMap((kind) => Object.keys(root[kind] ?? {}));
}

function lockedVersion(lock, name) {
  return lock.packages[`node_modules/${name}`]?.version;
}

export function loweredDependencies(baseLock, headLock) {
  return directDependencies(headLock)
    .map((name) => ({ name, from: lockedVersion(baseLock, name), to: lockedVersion(headLock, name) }))
    .filter(({ from, to }) => from && to && compareVersions(to, from) < 0);
}
