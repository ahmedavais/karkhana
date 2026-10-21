## 1. The shared preset in karkhana

- [x] 1.1 Add a `validate-renovate` job to `.github/workflows/ci.yml` running `npx --yes --package renovate@44.133.0 renovate-config-validator --strict default.json renovate.json`. Prove it with a planted unknown key in `default.json` on a throwaway branch: CI fails naming the key. Verify: the plant's run is red, then the branch is deleted (convention: prove a check by planting a failure, karkhana AGENTS.md)
- [x] 1.2 Write `default.json` with the policy in design.md: automerge through pull requests with `platformAutomerge: false`, `assignees`, `dependencyDashboard: false`, Monday schedule in `America/New_York`, `minimumReleaseAge: "14 days"` with `internalChecksFilter: "strict"`, the `weekly updates` group with `ci:`, majors without automerge, `lockFileMaintenance` with `ci:`, OSV alerts with `vulnerabilityAlerts` set to `fix:` and no release age. Add `renovate.json` extending `github>ahmedavais/karkhana`. Verify: `validate-renovate` passes locally and in CI
- [x] 1.3 Add the two regex `customManagers` for `npx --yes <name>@<version>` and `docker run ... <owner>/<image>:<version>` in `.github/workflows/*.yml`. Verify: `npx --yes renovate@44.133.0 --platform=local --dry-run=lookup` in karkhana lists `jscpd` 5.4.0 (from `.github/workflows/duplication.yml:16`) and `rhysd/actionlint` 1.7.12 (from `.github/workflows/ci.yml:16`) among the detected dependencies
- [x] 1.4 Make `validate-renovate` a required check in karkhana's ruleset, and document the preset in `README.md` (what a project adds, what Ahmed sees) and `AGENTS.md`. Verify: the ruleset lists `lint-workflows`, `test` and `validate-renovate`; the PR's review has no findings; merged

## 2. Prove the policy on a throwaway repo

- [ ] 2.1 Ahmed installs the Mend Renovate GitHub App with access to selected repositories only: the throwaway repo and karkhana, whose ruleset requires its checks. Verify: the app's installation lists exactly those repos (`gh api /user/installations`)
- [ ] 2.2 Create a public throwaway repo with `renovate.json` extending the preset, an npm dependency pinned to a release older than 14 days with a newer patch, and a CI workflow that always fails. Verify: Renovate opens the `weekly updates` pull request (triggered from the app's dashboard rather than waiting for Monday, if needed), it does not merge, it is assigned to Ahmed, and Ahmed confirms the assignment email arrived
- [ ] 2.3 In the same repo, switch the CI to always pass. Verify: Renovate merges the pull request on a later run, with a commit message starting `ci:`
- [ ] 2.4 Remove the CI workflow and let Renovate open another update. Verify what Renovate does with no checks at all; if it merges, add the guard Renovate offers for that case to `default.json` (through a karkhana PR, proven the same way) before any other project opts in
- [ ] 2.5 Delete the throwaway repo and remove it from the app's access. Verify: `gh repo view` reports it gone

## 3. agile-7.com opts in

- [ ] 3.1 Ahmed adds agile-7.com to the app's access, after 2.4. Add `renovate.json` extending `github>ahmedavais/karkhana`, and a Dependency updates line in `AGENTS.md`'s checks list. Verify: the PR's checks and review pass; merged
- [ ] 3.2 Watch the first weekly group and lock file refresh. Verify: both pull requests merge themselves on green CI, deploy and production watch pass afterwards, and `npm audit` on main shows fewer high-severity vulnerabilities than before
- [ ] 3.3 Check the karkhana pin moved with the lock refresh. Verify: `package-lock.json` on main resolves karkhana to its current main commit

## 4. The other projects opt in

- [ ] 4.1 Ahmed adds the other projects that call karkhana to the app's access, each with CI on pull requests. Verify: the installation lists them
- [ ] 4.2 Add `renovate.json` and the AGENTS.md line to each of those projects, one PR each. Verify: each PR's checks and review pass; merged
- [ ] 4.3 Record the station in Ahmed's own factory docs, outside this public repo. Verify: Ahmed confirms the docs describe it, and a week later every opted-in project's first group has merged or come to Ahmed
