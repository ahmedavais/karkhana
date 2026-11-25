## MODIFIED Requirements

### Requirement: Lock files are refreshed weekly
Each project's lock files SHALL be regenerated within their declared version ranges once a week, on Mondays, in a pull
request of their own, so fixes in dependencies that no manifest names directly arrive within a week. A refresh SHALL
take only releases at least 14 days old. An npm lock file refresh SHALL merge itself once every check on it passes; a
refresh of any other lock file SHALL come to Ahmed.

#### Scenario: A fix in a transitive dependency
- **WHEN** a dependency that no manifest names directly has a fixed version allowed by its parent's range
- **THEN** the next Monday's lock file refresh moves the project onto the fixed version

#### Scenario: A busy Monday
- **WHEN** the same Monday run also opens the weekly group, a major and a workflow tools update
- **THEN** the lock file refresh opens in that run too, rather than waiting for a slot

#### Scenario: A refresh with every check green
- **WHEN** every check on an npm lock file refresh has passed
- **THEN** it merges itself, and nobody is assigned

#### Scenario: A refresh Renovate can't hold to 14 days
- **WHEN** every check on a refresh of a lock file other than npm's has passed
- **THEN** it stays open, assigned to Ahmed, until he merges it

## ADDED Requirements

### Requirement: A refresh never takes a release younger than 14 days unnoticed
A lock file refresh that locks any release published less than 14 days before the refresh SHALL fail a check naming
the package, its version and its release date, so it does not merge itself and is assigned to Ahmed. A version that a
manifest's range requires, such as a security fix the range was raised to, is not counted.

#### Scenario: A refresh after the age limit was dropped
- **WHEN** a refresh locks a transitive dependency at a version released 3 days earlier
- **THEN** a check fails naming the package, the version and its release date, and the pull request is assigned to
  Ahmed

#### Scenario: A refresh after a security fix
- **WHEN** a manifest's range starts at a security fix released 5 days earlier, and the refresh locks that version
- **THEN** the check does not count that version

#### Scenario: A refresh of releases old enough
- **WHEN** every version a refresh locks was released at least 14 days earlier
- **THEN** the check passes
