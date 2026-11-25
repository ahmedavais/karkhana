## Why

Lock file refreshes are most of the update work that reaches Ahmed. Between 2026-10-26 and 2026-11-25 he merged 24
refreshes by hand across five projects, out of 43 Renovate pull requests he merged in all. Each sat green apart from
`renovate/stability-days`, which never passes for a refresh: a refresh has no release date, so Renovate can't tell
whether it waited 14 days, and holds it.

Renovate now passes `--before`, set to 14 days ago, to npm when it regenerates an npm lock file, so npm itself takes
only releases at least 14 days old. The astro incident in `keep-security-fixes` showed that cutoff at work. Renovate's
`minimumReleaseAgePackageManagerSync` flag tells it to trust that and stop holding the refresh.

## What Changes

- The preset turns on `minimumReleaseAgePackageManagerSync`, so an npm lock file refresh no longer waits on
  `renovate/stability-days`
- An npm lock file refresh merges itself once every check passes, like the weekly group. It is assigned to Ahmed only
  when a check fails
- A uv lock file refresh still comes to Ahmed: Renovate doesn't enforce the age for uv, so it would wait forever
- `validate-renovate` moves to Renovate 44.236.0, the first release that knows the flag, and `dependencyDashboard`
  takes the form that release requires
- A new check fails a lock file refresh that locks a release younger than 14 days, covering the case where Renovate
  drops `--before`

## Capabilities

### New Capabilities

### Modified Capabilities

- `dependency-updates`: an npm lock file refresh merges itself, and no refresh takes a release younger than 14 days
  unnoticed

## Impact

- `default.json` (every opted-in project, at once) and `.github/workflows/ci.yml`
- A new reusable check and its script in karkhana, and a call to it in each npm project's CI
- `README.md`

### Related context documents

- `openspec/changes/keep-security-fixes/`: the downgrade guard and the incident that showed the 14-day cutoff
- `openspec/changes/archive/2026-11-09-add-dependency-updates/design.md`: why refreshes came to Ahmed, under Grouping
