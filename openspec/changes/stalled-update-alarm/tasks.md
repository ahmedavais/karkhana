# Tasks

## The alarm decides what has stalled

- [ ] Write `updates/stalled-update.js` and its CLI test-first: from `gh pr list --json` output and the time, pick
  Renovate pull requests open more than three days with nobody assigned, and write a comment naming each check that
  has not passed. Verify: tests cover a stalled group with a cancelled check, an assigned one, a young one, a pull
  request by a person, and pending status contexts

## The alarm runs in karkhana

- [ ] Add `.github/workflows/stalled-update-alarm.yml` and a daily caller in karkhana, and document both in
  `README.md` and `AGENTS.md`. Verify: `lint-workflows` and `test` pass; the pull request's review passes; merged
  after Ahmed's approval
- [ ] Prove it with a planted stall: unassign karkhana's open workflow tools update and run the caller with the
  threshold at zero. Verify: the run assigns it to Ahmed and comments with its checks; a second run changes nothing

## Each project picks it up

- [ ] Add the caller to agile-7.com, ahmedavais.com, buzzword-weather and streamdeck-ahmed-toolkit, one pull request
  each. Verify: each pull request's checks and review pass; merged after Ahmed's approval; a manual run in each
  succeeds
