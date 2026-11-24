# Tasks

## Security fixes raise the range

- [ ] Set `rangeStrategy: "bump"` in `default.json`'s `vulnerabilityAlerts`. Correct the README's claim that a lock
  file refresh carries versions of every age. Verify: `validate-renovate` passes; the PR's checks and review pass;
  merged
- [ ] Watch the first security fix for a direct dependency after the merge. Verify: it raises the manifest's range to
  the fixed version, and the next lock file refresh keeps the dependency at or above it. Record what Renovate does if
  that refresh fails with `notarget`

## Downgrade guard

- [ ] Write `updates/downgrade-guard.js` test-first: which direct dependencies a new lock file moves to an older version
- [ ] Write `updates/downgrade-guard-cli.js` test-first against a real temporary git repository: compare each changed
  `package-lock.json` with the base branch, print an error per lowered dependency, and fail
- [ ] Add `.github/workflows/downgrade-guard.yml`, document it in `README.md` and `AGENTS.md`. Verify: a planted
  downgrade on a throwaway branch fails the job naming the dependency and both versions, then the branch is deleted;
  the PR's checks and review pass; merged

## Projects call the guard

- [ ] In each npm project that follows the update policy, add the guard as a CI job and to the failed update alarm's
  `needs`, one PR each. Verify: each PR's checks and review pass; merged
