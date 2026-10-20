## Context

karkhana already shares two things, each with its own way of reaching projects:

- Workflows, called at `@main` (`.github/workflows/watch-production.yml`, `duplication.yml`, `adversarial-review.yml`),
  so a change reaches every project at once
- The ESLint limits package (`eslint/structural-limits.js`), pinned per project in `package-lock.json`

A Renovate preset is a third. Renovate reads `github>ahmedavais/karkhana` as `default.json` on karkhana's default branch
(Renovate's config-presets docs), so it behaves like the workflows: a policy change reaches every project at once.

Constraints found while surveying:

- Ahmed's account is on GitHub's free plan. Rulesets, and so required checks, are unavailable on private repos (the API
  answers 403), so GitHub's own auto-merge can't be relied on there
- Each project's CI already runs on pull requests: `verify` and `duplication` in `ci.yml`, plus the adversarial review
  in `adversarial-review.yml`. karkhana runs `lint-workflows` and `test` and requires both on main
- Two tool versions sit inside workflow commands, where no Renovate manager looks by default:
  `.github/workflows/duplication.yml:16` (`npx --yes jscpd@5.4.0`) and `.github/workflows/ci.yml:16`
  (`rhysd/actionlint:1.7.12`)
- Renovate's docs: OSV alerts cover direct dependencies only; a lock file refresh always gets its own pull request;
  an automerge pull request is assigned only when its status checks fail (`assignAutomerge` defaults to false)

**Twin audit.** The preset's closest twin is the shared workflows: both are policy that karkhana owns and projects
follow at `@main`. No shared structure to extract; the preset is a JSON file, the workflows YAML. The other twin is the
ESLint limits package, which pins per project; the preset deliberately doesn't, to follow the workflows (spec:
"Projects opt in").

**First-instance audit.** Three firsts: the first third-party GitHub App with write access, the first bot that merges
into Ahmed's repos, and the first custom (regex) Renovate manager. None needs a helper; each is one block of config.
Recorded here so the next bot or regex manager follows these.

## Goals / Non-Goals

**Goals:**

- One preset in karkhana that every opted-in project follows, with a one-line `renovate.json` per project
- Self-merging routine and security updates that are safe without paid branch protection
- A failure or a major reaches Ahmed by assignment, nothing else does

**Non-Goals:**

- GitHub's Dependabot alerts and Renovate's GitHub-alert path (decided during design)
- dev-scripts, and pelican-api, which is being retired
- Branch protection or rulesets on the projects
- Self-merging majors

## Decisions

**The preset is `default.json` at karkhana's root, and every project, karkhana included, has
`renovate.json` = `{ "extends": ["github>ahmedavais/karkhana"] }`.** Renovate's docs deprecate `renovate.json` as a
preset file name, and `default.json` is what `github>owner/repo` resolves to.

**Renovate merges itself, not GitHub.** `automerge: true`, `automergeType: "pr"`, `platformAutomerge: false`. With
platform automerge off, Renovate merges on a later run once it sees the pull request's checks green, which works on a
free-plan private repo with no required checks. Alternative rejected: GitHub's auto-merge, which waits only for
required checks, and the private project can't have any.

**Assignment.** `assignees: ["ahmedavais"]` and the default `assignAutomerge: false`: an automerging pull request is
assigned only when its checks fail; majors get `automerge: false`, so they are assigned at creation. `dependencyDashboard:
false`, so no issue lists pending updates.

**Timing.** `schedule: ["before 9am on monday"]` and `timezone: "America/New_York"` (Ahmed's clock, EDT).
`minimumReleaseAge: "14 days"` with `internalChecksFilter: "strict"`, so a release younger than that opens no pull
request at all rather than a waiting one.

**Grouping.** One `packageRules` entry groups `minor` and `patch` updates as `weekly updates` with
`commitMessagePrefix: "ci:"`. `lockFileMaintenance` is enabled on the same schedule, automerges, and uses `ci:`.

**Security fixes.** `osvVulnerabilityAlerts: true`, and `vulnerabilityAlerts` sets `minimumReleaseAge: null`,
`automerge: true` and `commitMessagePrefix: "fix:"`. Renovate already lets these skip the schedule.

**Pinned tools in workflow commands.** Two `customManagers` of type `regex`, matching `.github/workflows/*.yml`: one for
`npx --yes <name>@<version>` (npm datasource), one for `<owner>/<image>:<version>` in a `docker run` (docker datasource).
They fall under the same 14-day rule and the weekly group.

**The karkhana pin in projects.** Each project's `package.json` names `github:ahmedavais/karkhana` with no ref, so the
lock file pins whatever commit was current. The weekly lock file refresh reinstalls it, which moves the pin to karkhana's
latest main. No separate rule. The 14-day rule doesn't apply, which is fine for karkhana's own code.

**Rollout.** agile-7.com first, proven with a planted failing update; then the remaining projects and karkhana, one
`renovate.json` each.

## Risks / Trade-offs

- [Renovate has write access to the repos] → only the five opted-in repos are granted, and every merge goes through a
  pull request with CI and the adversarial review
- [No checks at all on a pull request, for example a workflow that didn't trigger] → unknown whether Renovate then
  merges. Verified during apply with a plant before any project opts in beyond agile-7.com
- [The adversarial review runs on every update pull request] → two or three runs per project per week on Ahmed's
  Claude subscription. Accepted: it's the point of merging through pull requests
- [An expired review token fails every update's checks] → every update is then assigned to Ahmed, which is loud, and
  the token reminder already exists
- [Lock file refreshes make large diffs] → CI judges them, and a failure comes to Ahmed
- [Whether OSV-based pull requests take the `vulnerabilityAlerts` settings] → inferred from Renovate's docs, verified
  on the first real security fix

## Prerequisite Refactorings

N/A. The twin and first-instance audits above found nothing to extract first.
