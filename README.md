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

## Following main

Projects call these workflows at `@main`, so a change here reaches every project at once. Every change is checked
here first: `actionlint` lints every workflow on each pull request and push.
