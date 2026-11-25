## MODIFIED Requirements

### Requirement: What needs Ahmed comes to Ahmed
An update that will not merge itself SHALL be assigned to Ahmed, so he is notified; one whose check fails SHALL be
assigned as soon as the check fails, and one that stays open past three days without being assigned SHALL be assigned
within a day, with a comment naming each check that has not passed. No standing issue or dashboard SHALL list pending
updates.

#### Scenario: A check fails
- **WHEN** any check on an update pull request fails
- **THEN** the pull request stays open and is assigned to Ahmed within minutes of the failure

#### Scenario: A major release
- **WHEN** a dependency has a new major release
- **THEN** a pull request of its own opens, assigned to Ahmed, and does not merge itself

#### Scenario: An update stalls without failing
- **WHEN** an update pull request that nobody is assigned to has been open more than three days, and one of its
  checks was cancelled
- **THEN** within a day it is assigned to Ahmed, with a comment that names the cancelled check

#### Scenario: A stalled update that already came to Ahmed
- **WHEN** an update pull request open more than three days is already assigned to Ahmed
- **THEN** it is not assigned or commented on again

#### Scenario: An update still within its first three days
- **WHEN** an update pull request has been open less than three days
- **THEN** nobody is assigned to it on account of its age

#### Scenario: Pending updates
- **WHEN** updates are waiting
- **THEN** no issue lists them
