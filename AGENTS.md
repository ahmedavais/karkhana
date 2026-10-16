# karkhana

Shared GitHub workflows for Ahmed's projects. See `README.md` for what each one does and how a project calls it.

- Public repo: generic machinery only. Never add a project's URLs, content, secrets or anything from a private repo
- Projects call workflows at `@main`, so a broken change breaks every project's runs at once. Keep changes small
- `.github/workflows/ci.yml` lints every workflow with actionlint. Prove a new check by planting a failure first
- The map of which check runs in which project lives in dev-scripts (private), not here
