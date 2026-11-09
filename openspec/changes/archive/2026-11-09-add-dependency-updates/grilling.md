# Grilling decisions

Decided with Ahmed on 2026-10-19 in a one-question-at-a-time grilling session, before the proposal.

- Build a dependency-updates station for the projects that use karkhana
- Patch and minor updates merge themselves when every check passes; majors wait for Ahmed
- Renovate, with one shared preset in karkhana and a one-line `renovate.json` in each project
- An update Renovate won't merge (failed checks, majors) is assigned to Ahmed, so GitHub emails him. No Dependency
  Dashboard issue. Proven with a planted failing update
- Ordinary releases wait 14 days; security fixes skip the wait, found through OSV
- Proving ground: agile-7.com; then the other projects that call karkhana, and karkhana itself
- Non-major updates come as one grouped pull request per project each Monday; security fixes come as their own
  immediate pull requests
- Merge through pull requests, so CI and the adversarial review see every update
- Custom managers keep the tool versions pinned inside karkhana's workflow commands current (jscpd, actionlint)
- The karkhana git dependency rides the weekly group
- Lock files are refreshed weekly, which is how transitive fixes arrive. Corrected during design: the refresh is its own
  pull request, so a project gets two routine pull requests on Mondays
- Transitive vulnerabilities are fixed by the weekly lock refresh, within a week, not at once: OSV covers direct
  dependencies only, and GitHub's Dependabot alerts stay off (decided during design)
- Commit prefixes follow Ahmed's semantic commits: `ci:` for routine updates, `fix:` for security fixes
