const RENOVATE = 'renovate[bot]';
const GITHUB_SIGNER = 'web-flow';

const DEPENDENCY_FILES = new Set([
  'package.json',
  'package-lock.json',
  'npm-shrinkwrap.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'pyproject.toml',
  'uv.lock',
  'poetry.lock',
  'Pipfile',
  'Pipfile.lock',
]);

function isDependencyFile(path) {
  return !path.startsWith('.github/') && DEPENDENCY_FILES.has(path.split('/').at(-1));
}

function isRenovateCommit({ author, committer, signature }) {
  return author === RENOVATE && committer === GITHUB_SIGNER && signature === 'valid';
}

export function isRoutineUpdate({ author, commits, files }) {
  return (
    author === RENOVATE &&
    commits.length > 0 &&
    commits.every(isRenovateCommit) &&
    files.length > 0 &&
    files.every(isDependencyFile)
  );
}
