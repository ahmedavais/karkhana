## Why

A security fix for a direct dependency merged itself, and the next Monday's lock file refresh moved the dependency back
to the vulnerable version. It happened in two projects, twice in one week. The fix only changed the lock file, so the
manifest's range still allowed the old version, and the refresh took the newest release at least 14 days old. Renovate
reopened the fix each time, and nothing told Ahmed the fix had been undone.

## What Changes

- A security fix for a direct dependency raises the manifest's range to the fixed version, as well as the lock file, so
  no later refresh can resolve below it
- A shared karkhana workflow fails any Renovate pull request that lowers the version a direct dependency is locked to.
  A failed update is already assigned to Ahmed by the failed update alarm, so a downgrade comes to him instead of
  merging quietly
- Each npm project that opts into the update policy calls the new workflow from its CI and lists it in the alarm's
  `needs`
- The README stops claiming a lock file refresh carries versions of every age: observed refreshes took only releases at
  least 14 days old

## Capabilities

### New Capabilities

### Modified Capabilities

- `dependency-updates`: security fixes for direct dependencies stay fixed, and an update that lowers a direct
  dependency fails and comes to Ahmed

## Impact

- `default.json` (every opted-in project, at once)
- A new reusable workflow and its script in karkhana, and a call to it in each npm project's CI
- `README.md` and `AGENTS.md`

### Related context documents

- `openspec/changes/archive/2026-11-09-add-dependency-updates/`: the story that built the update policy
