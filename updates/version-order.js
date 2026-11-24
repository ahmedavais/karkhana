const NUMBER = /^\d+$/;

function compareIdentifiers(identifier, other) {
  const isNumber = NUMBER.test(identifier);
  const otherIsNumber = NUMBER.test(other);
  if (isNumber && otherIsNumber) return Math.sign(Number(identifier) - Number(other));
  if (isNumber !== otherIsNumber) return isNumber ? -1 : 1;
  if (identifier === other) return 0;
  return identifier < other ? -1 : 1;
}

function compareIdentifierLists(identifiers, others) {
  const shared = identifiers.slice(0, others.length);
  const differing = shared.findIndex((identifier, index) => compareIdentifiers(identifier, others[index]) !== 0);
  if (differing === -1) return Math.sign(identifiers.length - others.length);
  return compareIdentifiers(identifiers[differing], others[differing]);
}

function parse(version) {
  const [release, prerelease] = version.split(/-(.*)/s);
  return { release: release.split('.'), prerelease: prerelease?.split('.') };
}

function comparePrereleases(prerelease, other) {
  const isRelease = (identifiers) => Number(identifiers === undefined);
  if (prerelease === undefined || other === undefined) return isRelease(prerelease) - isRelease(other);
  return compareIdentifierLists(prerelease, other);
}

export function compareVersions(version, other) {
  const parsed = parse(version);
  const parsedOther = parse(other);
  return (
    compareIdentifierLists(parsed.release, parsedOther.release) ||
    comparePrereleases(parsed.prerelease, parsedOther.prerelease)
  );
}
