# karkhana

Shared GitHub workflows for Ahmed's projects. See `README.md` for what each one does and how a project calls it.

- Public repo: generic machinery only. Never add a project's URLs, content, secrets or anything from a private repo
- Projects call workflows at `@main`, so a broken change breaks every project's runs at once. Keep changes small
- main only takes pull requests with actionlint passing (ruleset). `.github/workflows/review.yml` has karkhana's
  own pull requests reviewed with the shared adversarial review, which asks whether a change lets any project's
  checks pass while checking less
- `briefs/adversarial-review.md` is the review brief for every project. Keep it generic: a project's own
  conventions belong in its `AGENTS.md`
- `.github/workflows/ci.yml` lints every workflow with actionlint. Prove a new check by planting a failure first
- actionlint checks an action's inputs only for versions in its catalog. Its 1.7.12 catalog has no `@v7` actions,
  so a misspelled input to `actions/setup-node@v7` passes lint (proven with a plant that `@v4` failed on)
- The map of which check runs in which project lives in dev-scripts (private), not here
