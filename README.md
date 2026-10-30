# karkhana

[![CI](https://github.com/ahmedavais/karkhana/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ahmedavais/karkhana/actions/workflows/ci.yml)

Karkhana means factory. This repo holds the shared parts of the checks and automation that keep my projects
honest: GitHub workflows that each project calls instead of keeping its own copy.

This is my own setup. It's public so my public projects can use it, and it changes whenever they need it to. If
something here is useful to you, copy it into your own repo instead of calling it from here.

Only generic machinery lives here. Anything about a particular project (its URLs, its pages, its checks) stays in
that project and reaches these workflows through its own scripts.

## Watch production

Runs a project's live checks against production. A failed run is the alarm: GitHub emails it.

The project provides `.nvmrc`, `package-lock.json` and an `npm run watch-production` script that fails when
production is wrong. It decides when to watch:

```yaml
name: Watch production

on:
  workflow_run:
    workflows: ["CI / Deploy"]
    types: [completed]
    branches: [main]
  schedule:
    - cron: "23 11 * * *"
  workflow_dispatch:

permissions:
  contents: read

jobs:
  watch:
    if: github.event_name != 'workflow_run' || github.event.workflow_run.conclusion == 'success'
    uses: ahmedavais/karkhana/.github/workflows/watch-production.yml@main
```

## Adversarial review

Claude Code reviews a non-draft pull request from the project's own branches when it opens, becomes ready for
review, or receives the `review-requested` label. A new push or reopening does not request another review. Remove
and reapply the label to review the current head again. Create the label in the repository before using it.
Claude assumes there is a real problem and looks for it. It posts inline comments and one summary comment.
It only comments; it never blocks a merge.
When Claude's run ends in an error rather than a review, the error shows as a warning on the run and the review
tries once more unless the message reports a usage, weekly, session, hourly, or model quota limit. A quota error keeps its warning
and fails without retrying. Setup failures and runs that exhaust their turns also fail without retrying.
It skips a Renovate pull request only when every commit names Renovate as author and GitHub as the signing committer,
and every changed file outside `.github/` is a dependency manifest or lock file (`review/routine-update.js` lists
them): those change versions, not code it can read, and CI judges them. A Renovate pull request that touches a
workflow or any other file, or that someone else pushed a commit to, is reviewed like any other. Manifests are trusted
by name, so the skip doesn't read what changed inside one, and someone with write access could still make a commit
through GitHub's API that names Renovate as author; it guards against mistakes, not against the repo's own writers.

The brief lives here, in `briefs/adversarial-review.md`, read from karkhana's main branch, so a pull request can't
rewrite it. A pull request can still edit the project's `AGENTS.md`, so the brief treats any rule loosened there as a
finding. The project's `AGENTS.md` supplies its checks and conventions, and karkhana's workflows are
checked out beside the project so the reviewer can see what a calling workflow runs.

The project provides an `AGENTS.md` and a `CLAUDE_CODE_OAUTH_TOKEN` secret, made with `claude setup-token`:

```yaml
name: Adversarial review

on:
  pull_request:
    types: [opened, ready_for_review, labeled]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    if: >-
      github.event.pull_request.draft == false &&
      (github.event.action != 'labeled' || github.event.label.name == 'review-requested')
    uses: ahmedavais/karkhana/.github/workflows/adversarial-review.yml@main
    secrets:
      CLAUDE_CODE_OAUTH_TOKEN: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```

Event selection lives in this caller file. Updating the reusable workflow does not change an existing caller's
triggers; copy the event types and job condition above when adopting this schedule.

## Duplication

Fails when a change adds duplicated code: a pull request is compared with its base branch, a push with the commit
before it. Duplication already there doesn't fail anything; only new clones do. With nothing to compare against it
fails rather than passing unchecked: an event with no commit before it, such as a first push to a new branch or a
manual run, fails with an error naming the event, and a force push that dropped the commit before it fails with
jscpd's "git ref not found". So call it only on pull requests and pushes to an existing branch.

It runs [jscpd](https://github.com/kucherenko/jscpd), which reads every language these projects use and respects
`.gitignore`. Tests count too.

The project provides a `.jscpd.json` that skips lock files and anything generated:

```json
{
  "ignore": ["**/package-lock.json", "worker-configuration.d.ts"]
}
```

It's called as a job in the project's own CI:

```yaml
jobs:
  duplication:
    uses: ahmedavais/karkhana/.github/workflows/duplication.yml@main
```

## ESLint limits

Structural limits every TypeScript project shares: more than 3 parameters, nesting deeper than 4 blocks and
complexity over 10 are errors; a function over 30 lines is a warning, so a project with long functions stays green
while Habit Hooks coaches them as they get touched. `eslint/structural-limits.test.js` lints a snippet against each.

In test files (`*.test.*`) a `describe` callback is held to 100 lines instead of 30, in any form that names
`describe`: `.skip`, `.only`, `.each` and Playwright's `test.describe` included. Each test inside is usually
short; the block is long because the module under test has many behaviors, so past 100 lines the warning asks whether
that module does more than one thing. Every other function in a test file, `it` callbacks included, keeps the 30-line
limit. ESLint has no option for this, so `eslint/lengths-in-test-files.js` wraps its own `max-lines-per-function` as
two rules, `karkhana/max-lines-per-function` and `karkhana/max-lines-per-describe`.

A project installs karkhana straight from GitHub and spreads the limits into its `eslint.config.js`:

```sh
npm install --save-dev github:ahmedavais/karkhana
```

```js
import { structuralLimits } from 'karkhana/eslint-limits';

export default tseslint.config(
  // the project's own configs
  structuralLimits,
);
```

Habit Hooks only knows ESLint's own rule names, so a project that uses it routes karkhana's two rules in
`.habit-hooks/config.toml`:

```toml
[smells."karkhana/max-lines-per-function"]
severity = "enforced"
guide = "oversized-function.md"

[smells."karkhana/max-lines-per-describe"]
severity = "enforced"
guide = "oversized-describe.md"
```

and links the describe guide from karkhana, so Claude is pointed at the module rather than told to split the block:

```sh
mkdir -p .habit-hooks/generic/guides
ln -s ../../../node_modules/karkhana/habit-hooks/oversized-describe.md .habit-hooks/generic/guides/oversized-describe.md
```

Unlike the workflows, this doesn't follow `@main`. The project's `package-lock.json` pins the karkhana commit it
installed, and a change here reaches the project when it runs `npm install --save-dev github:ahmedavais/karkhana` and
commits the lock file. `npm update karkhana` leaves a git dependency's pin where it is.

## Dependency updates

`default.json` is the Renovate preset every project follows, so dependencies stay current without anyone running an
update:

- Patch and minor updates arrive as one pull request on Mondays, which merges itself once every check on it passes
- A lock file refresh arrives as a second pull request, assigned to Ahmed to merge once its checks pass: it carries
  versions of every age, since the 14-day wait can't date a refresh
- A release is taken only once it is 14 days old. A fix for a known vulnerability in a direct dependency skips the
  wait and the schedule, in a pull request of its own; transitive fixes arrive with Monday's lock file refresh
- A major release, or an update whose checks fail, stays open and is assigned to Ahmed, so GitHub notifies him.
  Nothing else asks for attention, and no issue lists pending updates
- Tool versions pinned inside workflow commands (`npx --yes <tool>@<version>`, `docker run <image>:<version>`) are
  proposed in a pull request of their own that never merges itself: every project runs these workflows at `@main`
- Commits start with `ci:`, or `fix:` for a security fix

A project opts in only once CI runs on its pull requests: with no checks, Renovate leaves an update open and tells no
one. It adds a
`renovate.json` and gets the Mend Renovate GitHub App installed on its repo:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>ahmedavais/karkhana"]
}
```

Renovate assigns a failed update only on its next run, which can be a day away, and GitHub tells nobody when a run
started by Renovate's bot fails. So the project's CI ends with the failed update alarm, which assigns a Renovate pull
request to the repository owner once every job before it has finished and one has failed:

```yaml
jobs:
  failed-update-alarm:
    needs: [verify, duplication]
    if: failure()
    permissions:
      pull-requests: write
    uses: ahmedavais/karkhana/.github/workflows/failed-update-alarm.yml@main
```

`needs` lists every other job in the workflow.

Renovate reads the preset from karkhana's main, so a policy change reaches every project at once. The
`validate-renovate` job checks the preset on every pull request.

## Following main

Projects call these workflows at `@main`, so a change here reaches every project at once. Every change is checked
here first: main only takes pull requests, `lint-workflows`, `test` and `validate-renovate` must pass on each one,
and the adversarial review asks whether the change lets any project's checks pass while checking less.
