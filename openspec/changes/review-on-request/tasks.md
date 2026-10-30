## Retry policy

- [x] Extract the existing retry decision without changing its behavior; keep diagnostics intact.
- [x] Prove usage-limit errors do not retry, including a limit message after the diagnostic cutoff; preserve transient retries.
- [x] Verify the CLI writes the retry decision and keeps the error warning using real temporary files.

## Review requests

- [x] Update this repository's caller and the README template for non-draft opened, ready_for_review, and review-requested label events.
- [x] Prove an unrelated label and a new push do not request a review; prove the requested label does.
- [x] Run package tests, pinned actionlint, and a planted invalid workflow expression; record results.
- [ ] Open one PR and record its checks and review result. Leave caller rollout for separate PRs after merge.

## Results

- Measured on 2026-10-30: the current callers subscribe to opened, synchronize, and reopened.
- Measured on 2026-10-30: the shared retry currently treats every error result with subtype success as retryable.
- Measured on 2026-10-30: baseline passed 29 tests and actionlint 1.7.12. The retry extraction failed first on the missing export, then on the false decision; all 30 tests passed after extracting the existing policy.
- Measured on 2026-10-30: usage-limit, subscriber-limit, and post-cutoff fixtures each failed before their policy changes. All 36 tests pass, including real-file CLI output, temporary HTTP 429, and server overload cases; actionlint 1.7.12 passes.
- Measured on 2026-10-30: actionlint 1.7.12 rejected a scratch copy of the caller containing the planted undefined variable `review_request_typo`; the real workflow passes. Live event verification remains pending on this PR.
- Measured on 2026-10-30: opening draft PR #33 skipped review run 41059953407. Marking it ready started review run 41060033108. Adding the unrelated `documentation` label skipped review run 41060088091. The initial CI run 41059953084 passed lint-workflows, test, and validate-renovate.
- Measured on 2026-10-30: push `ef46368` produced only CI run 41060277059, which passed. Applying `review-requested` at `0958fbc` started review run 41060508452, which completed; CI run 41060497121 passed at that head. Caller rollout remains outside this PR.
- Measured on 2026-10-30: the ready-for-review run completed and flagged missing rolling-hour and model-specific quota variants. A new fixture failed on `5-hour limit reached`; the expanded classifier passes all 37 tests, including Opus and Sonnet limits. The `review-requested` label was created in this repository before its live request test.
- Waiting on Ahmed: the second review flagged the risk of later pushes changing shared checks without a fresh review. Decide whether this repository keeps `synchronize` reviews as an exception while callers adopt the cheaper schedule. The current PR implements manual re-review for both; it is not ready for merge until this choice is settled.
