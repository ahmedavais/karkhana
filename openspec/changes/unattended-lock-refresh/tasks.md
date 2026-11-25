# Tasks

## The validator knows the flag

- [x] Pin `validate-renovate` to Renovate 44.236.0 and write `dependencyDashboard` as `{ "enabled": false }`, with no
  change in behavior. Verify: the preset with the flag fails at 44.206.3, 44.230.0 and 44.235.5 as an unknown option
  and passes at 44.236.0; the old pin rejects the new `dependencyDashboard` form. Result: measured on 2026-11-25, as
  listed; the unchanged preset fails `--strict` at 44.236.0 and later only on the `dependencyDashboard` migration

## npm lock file refreshes merge themselves

- [x] Set `minimumReleaseAgePackageManagerSync: true` and add the `packageRules` entry that merges `npm` lock file
  refreshes. Update the README. Verify: `validate-renovate` passes at 44.236.0. Result: passed on 2026-11-25
- [ ] Merge once 44.236.0 is 14 days old, after 2026-11-26 13:43 UTC. Verify: the pull request's checks and review pass
- [ ] Watch the first Monday after the merge. Verify: in each npm project, the refresh's `renovate/stability-days`
  passes, the refresh merges itself, and its lock file holds no version younger than 14 days at the refresh;
  buzzword-weather's refresh stays open and assigned to Ahmed. If a refresh stays pending, record it and turn the flag
  off

## Fresh-release guard

- [ ] Write the check test-first in `updates/`, next to the downgrade guard: for each `package-lock.json` a lock file
  refresh changes, fail on each newly locked version published less than 14 days before the pull request, naming the
  package, version and date, unless a manifest's range requires that version. Verify: it fails on a planted young
  transitive version and passes a refresh of old enough releases
- [ ] Add it as a reusable workflow and document it in `README.md` and `AGENTS.md`. Verify: `lint-workflows` passes;
  the pull request's checks and review pass; merged
- [ ] In each npm project that follows the update policy, add the check as a CI job and to the failed update alarm's
  `needs`, one pull request each. Verify: each pull request's checks and review pass; merged
