function lockedVersion(lock, name) {
  return lock.packages[`node_modules/${name}`]?.version;
}

function releaseParts(version) {
  return version.split('.').map(Number);
}

function isOlder(version, than) {
  const parts = releaseParts(version);
  const thanParts = releaseParts(than);
  const differing = parts.findIndex((part, index) => part !== thanParts[index]);
  return differing !== -1 && parts[differing] < thanParts[differing];
}

export function loweredDependencies(baseLock, headLock) {
  const names = Object.keys(headLock.packages[''].dependencies);
  return names
    .map((name) => ({ name, from: lockedVersion(baseLock, name), to: lockedVersion(headLock, name) }))
    .filter(({ from, to }) => isOlder(to, from));
}
