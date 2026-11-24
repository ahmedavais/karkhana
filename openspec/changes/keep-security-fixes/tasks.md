# Tasks

## Security fixes raise the range

- [x] Set `rangeStrategy: "bump"` in `default.json`'s `vulnerabilityAlerts`. Correct the README's claim that a lock
  file refresh carries versions of every age. Verify: `validate-renovate` passes; the PR's checks and review pass;
  merged. Result: a planted `"bumpp"` failed the validator; #51 passed every check with no review findings and merged
  on 2026-11-24
- [ ] Watch the first security fix for a direct dependency after the merge. Verify: it raises the manifest's range to
  the fixed version, and the next lock file refresh keeps the dependency at or above it. Record what Renovate does if
  that refresh fails with `notarget`

## Downgrade guard

- [x] Write `updates/downgrade-guard.js` test-first: which direct dependencies a new lock file moves to an older
  version. Result: 13 tests, with version order in `updates/version-order.js`
- [x] Write `updates/downgrade-guard-cli.js` test-first against a real temporary git repository: compare each changed
  `package-lock.json` with the base branch, print an error per lowered dependency, and fail. Result: 5 tests, including
  a missing base branch failing rather than passing unchecked
- [ ] Add `.github/workflows/downgrade-guard.yml`, document it in `README.md` and `AGENTS.md`. Verify: the CLI fails
  on the real lock file refresh that undid a security fix, naming the dependency and both versions, and passes the
  security fix that followed it; `lint-workflows` passes; the PR's checks and review pass; merged. Result so far: on
  2026-11-24 the CLI failed the refresh with `astro moved from 7.4.7 to 7.4.4` and passed the following fix

## Projects call the guard

- [ ] In each npm project that follows the update policy, add the guard as a CI job and to the failed update alarm's
  `needs`, one PR each. Verify: each PR's checks and review pass; merged
- [ ] Prove the guard end to end: the job runs only on pull requests Renovate opened, so plant a commit lowering a
  direct dependency on an open Renovate pull request in a calling project. Verify: the guard fails naming the
  dependency and both versions, and the alarm assigns Ahmed; then drop the planted commit
