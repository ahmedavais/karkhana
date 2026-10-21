# karkhana

Shared GitHub workflows for Ahmed's projects. See `README.md` for what each one does and how a project calls it.

- Public repo: generic machinery only. Never add a project's URLs, content, secrets or anything from a private repo
- Projects call workflows at `@main`, so a broken change breaks every project's runs at once. Keep changes small
- main only takes pull requests with actionlint and the package tests passing (ruleset). `.github/workflows/review.yml`
  has karkhana's own pull requests reviewed with the shared adversarial review, which asks whether a change lets any
  project's checks pass while checking less
- `briefs/adversarial-review.md` is the review brief for every project. Keep it generic: a project's own
  conventions belong in its `AGENTS.md`
- karkhana is also a private npm package that projects install from GitHub. `eslint/structural-limits.js` holds the
  shared ESLint limits, and its tests lint snippets exactly at and one past each limit, so changing a limit means
  changing a test. Projects pin a commit in their lock file and take changes with
  `npm install --save-dev github:ahmedavais/karkhana` (`npm update` leaves the pin), not at `@main`.
  In test files, `eslint/lengths-in-test-files.js` holds `describe` callbacks to 100 lines and everything else to 30,
  and `habit-hooks/oversized-describe.md` is the guide projects link for a long `describe`. Both ship through `files`
  in `package.json`; a file left out of it is missing in every project. The rules wrap ESLint's own rule, so `eslint`
  is a peer dependency, and an ESLint upgrade here runs the tests against the new rule
- `default.json` is the Renovate preset every project follows from main, like the workflows. `validate-renovate` checks
  it; a broken preset would stop updates in every project at once
- `.github/workflows/ci.yml` lints every workflow with actionlint and runs `npm test`. Prove a new check by planting a
  failure first
- actionlint checks an action's inputs only for versions in its catalog. Its 1.7.12 catalog has no `@v7` actions,
  so a misspelled input to `actions/setup-node@v7` passes lint (proven with a plant that `@v4` failed on)
- The map of which check runs in which project lives in dev-scripts (private), not here
