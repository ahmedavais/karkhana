# karkhana

Karkhana means factory. This repo holds the shared parts of the checks and automation that keep Ahmed's
projects honest: GitHub workflows that each project calls instead of keeping its own copy.

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

The brief lives here, in `briefs/adversarial-review.md`, read from karkhana's main branch. A pull request can't
rewrite its own review. The project's `AGENTS.md` supplies its checks and conventions, and karkhana's workflows are
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

## Following main

Projects call these workflows at `@main`, so a change here reaches every project at once. Every change is checked
here first: main only takes pull requests, `actionlint` must pass on each one, and the adversarial review asks
whether the change lets any project's checks pass while checking less.
