## Retry policy

- [x] Extract the existing retry decision without changing its behavior; keep diagnostics intact.
- [x] Prove usage-limit errors do not retry, including a limit message after the diagnostic cutoff; preserve transient retries.
- [x] Verify the CLI writes the retry decision and keeps the error warning using real temporary files.

## Review requests

- [ ] Update this repository's caller and the README template for non-draft opened, ready_for_review, and review-requested label events.
- [ ] Prove an unrelated label and a new push do not request a review; prove the requested label does.
- [ ] Run package tests, pinned actionlint, and a planted invalid workflow expression; record results.
- [ ] Open one PR and record its checks and review result. Leave caller rollout for separate PRs after merge.

## Results

- Measured on 2026-10-30: the current callers subscribe to opened, synchronize, and reopened.
- Measured on 2026-10-30: the shared retry currently treats every error result with subtype success as retryable.
- Measured on 2026-10-30: baseline passed 29 tests and actionlint 1.7.12. The retry extraction failed first on the missing export, then on the false decision; all 30 tests passed after extracting the existing policy.
- Measured on 2026-10-30: usage-limit, subscriber-limit, and post-cutoff fixtures each failed before their policy changes. All 36 tests pass, including real-file CLI output, temporary HTTP 429, and server overload cases; actionlint 1.7.12 passes.
