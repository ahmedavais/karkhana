## Why

Dependencies in the projects that use karkhana fall behind silently. On 2026-10-18, `npm audit` showed 6 high-severity
vulnerabilities in one project and 4 in another, all with non-major fixes, and nothing raised them except a manual
install that happened to print them. The factory's rule is that a failed run is the alarm; for dependencies there is no
run at all.

## What Changes

- A shared Renovate preset in karkhana: the update policy every project inherits
- Patch and minor updates arrive as one grouped pull request per project each Monday and merge themselves when every
  check passes
- Security fixes for direct dependencies arrive at once, as their own pull requests, and merge themselves the same way
- Majors, and any update whose checks fail, stay open and are assigned to Ahmed, so GitHub emails him
- Ordinary releases are taken only once they are 14 days old; security fixes skip the wait
- Lock files are refreshed every Monday in a pull request of their own, so fixes in transitive dependencies arrive
  within a week
- The tool versions pinned inside karkhana's workflow commands (jscpd, actionlint) are kept current like any dependency
- Each project opts in with a one-line `renovate.json` that extends the preset; agile-7.com goes first as the proving
  ground

## Capabilities

### New Capabilities

- `dependency-updates`: how dependency updates reach a project that opts into karkhana's preset, when they merge
  themselves, and when they come to Ahmed

### Modified Capabilities

None.

## Impact

- karkhana: a new `renovate.json` preset at the repo root, and a README section on how a project opts in
- Each opted-in project: a `renovate.json`, and a steady stream of Renovate pull requests and commits
- Ahmed: installs the Mend Renovate GitHub App on the opted-in repos, the one step only he can take
- CI minutes: one extra run per project per week, plus one per security fix

## Related context documents

The below related documents should be loaded as part of context related to this proposed change:

- `openspec/changes/add-dependency-updates/grilling.md`: the decisions from the grilling session this change rests on
