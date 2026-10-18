# karkhana

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

Claude Code reviews every pull request from the project's own branches, assuming there is a real problem and
looking for it. It posts inline comments and one summary comment. It only comments; it never blocks a merge.

The brief lives here, in `briefs/adversarial-review.md`, read from karkhana's main branch, so a pull request can't
rewrite it. A pull request can still edit the project's `AGENTS.md`, so the brief treats any rule loosened there as a
finding. The project's `AGENTS.md` supplies its checks and conventions, and karkhana's workflows are
checked out beside the project so the reviewer can see what a calling workflow runs.

The project provides an `AGENTS.md` and a `CLAUDE_CODE_OAUTH_TOKEN` secret, made with `claude setup-token`:

```yaml
name: Adversarial review

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    uses: ahmedavais/karkhana/.github/workflows/adversarial-review.yml@main
    secrets:
      CLAUDE_CODE_OAUTH_TOKEN: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```

## Duplication

Fails when a change adds duplicated code: a pull request is compared with its base branch, a push with the commit
before it. Duplication already there doesn't fail anything; only new clones do. With nothing to compare against,
such as a force push that dropped the commit before it, it fails with jscpd's "git ref not found" rather than
passing unchecked.

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

## Following main

Projects call these workflows at `@main`, so a change here reaches every project at once. Every change is checked
here first: main only takes pull requests, `actionlint` must pass on each one, and the adversarial review asks
whether the change lets any project's checks pass while checking less.
