## Why

An update meant to merge itself can sit open forever without anyone hearing. On 2026-11-25, ahmedavais.com's weekly
group had been open nine days with every check green: a body edit cancelled one check run on each Renovate push, and
Renovate counts a branch as green only when every check run succeeded, was skipped or was neutral. Nothing failed, so
the failed update alarm never fired. That cause is fixed in the project, but the next stall of its kind would be just
as silent.

## What Changes

- A new reusable workflow, run daily in each project, finds Renovate pull requests that have stayed open past a
  threshold with nobody assigned, assigns them to the repository owner and comments with the checks Renovate is
  waiting on
- Each project that follows the update policy calls it from a scheduled caller of its own, and karkhana calls it too
- `README.md` documents the alarm and its caller

## Capabilities

### New Capabilities

### Modified Capabilities

- `dependency-updates`: an update that stays open without failing comes to Ahmed

## Impact

- A new reusable workflow and its script in `updates/`, read from karkhana's main like the downgrade guard
- A new scheduled caller in karkhana, agile-7.com, ahmedavais.com, buzzword-weather and streamdeck-ahmed-toolkit
- `README.md`, `AGENTS.md`

### Related context documents

- `openspec/changes/archive/2026-11-09-add-dependency-updates/design.md`: why failures are assigned, and why no
  dashboard lists pending updates
