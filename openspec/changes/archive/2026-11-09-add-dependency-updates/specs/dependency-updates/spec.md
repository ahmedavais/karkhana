## Purpose

Keeps the dependencies of every project that opts into karkhana's update policy current and free of known
vulnerabilities, merging routine updates on its own and bringing to Ahmed only what needs him.

## ADDED Requirements

### Requirement: Projects opt in
A project SHALL receive dependency updates only when it declares that it follows karkhana's shared update policy, and
it SHALL get the policy as karkhana defines it at that moment, without a copy of its own.

#### Scenario: A project that opted in
- **WHEN** a project declares that it follows the shared update policy
- **THEN** it receives updates under that policy

#### Scenario: A project that did not opt in
- **WHEN** a project does not declare the shared update policy
- **THEN** it receives no update pull requests

#### Scenario: The policy changes
- **WHEN** karkhana changes the shared update policy
- **THEN** every opted-in project follows the changed policy without a change of its own

### Requirement: Routine updates arrive as one weekly group
Patch and minor updates to a project's dependencies SHALL arrive together as one pull request per project, opened on
Mondays.

#### Scenario: Several updates in one week
- **WHEN** three dependencies of a project have new patch or minor releases old enough to take
- **THEN** one pull request on Monday updates all three

### Requirement: Lock files are refreshed weekly
Each project's lock files SHALL be regenerated within their declared version ranges once a week, on Mondays, in a pull
request of their own, so fixes in dependencies that no manifest names directly arrive within a week.

#### Scenario: A fix in a transitive dependency
- **WHEN** a dependency that no manifest names directly has a fixed version allowed by its parent's range
- **THEN** the next Monday's lock file refresh moves the project onto the fixed version

#### Scenario: A busy Monday
- **WHEN** the same Monday run also opens the weekly group, a major and a workflow tools update
- **THEN** the lock file refresh opens in that run too, rather than waiting for a slot

#### Scenario: A refresh with every check green
- **WHEN** every check on a lock file refresh has passed
- **THEN** it stays open, assigned to Ahmed, until he merges it

### Requirement: Ordinary releases wait 14 days
An update that is not a security fix SHALL be proposed only once the release is at least 14 days old.

#### Scenario: A release from last week
- **WHEN** a dependency's newest release came out 7 days ago and is not a security fix
- **THEN** no update proposes it yet

#### Scenario: A release from three weeks ago
- **WHEN** a dependency's newest release came out 21 days ago
- **THEN** the next weekly group proposes it

### Requirement: Security fixes for direct dependencies arrive at once
An update that fixes a known vulnerability in a dependency a manifest names directly SHALL be proposed as soon as the
fixed version exists, in a pull request of its own, without waiting for Monday or for the 14 days. A vulnerability in
a transitive dependency is fixed by the weekly lock file refresh.

#### Scenario: A vulnerability in a direct dependency, fixed today
- **WHEN** a known vulnerability affects a dependency the project's manifest names, and a fixed version was released
  today
- **THEN** a pull request with only that fix opens without waiting

#### Scenario: A vulnerability in a transitive dependency
- **WHEN** a known vulnerability affects a dependency that no manifest names directly
- **THEN** no separate pull request opens, and the next lock file refresh carries the fix if the parent's range allows
  it

### Requirement: Updates that pass merge themselves
A patch, minor or security update SHALL merge itself, through its pull request, once every check on that pull request
has passed, and SHALL NOT merge while any check is pending or failing.

#### Scenario: Every check passes
- **WHEN** every check on a patch, minor or security update pull request has passed
- **THEN** the pull request merges without anyone acting

#### Scenario: A check is still running
- **WHEN** any check on the pull request is still running
- **THEN** the pull request stays open

### Requirement: What needs Ahmed comes to Ahmed
An update that will not merge itself SHALL be assigned to Ahmed, so he is notified; one whose check fails SHALL be
assigned as soon as the check fails. No standing issue or dashboard SHALL list pending updates.

#### Scenario: A check fails
- **WHEN** any check on an update pull request fails
- **THEN** the pull request stays open and is assigned to Ahmed within minutes of the failure

#### Scenario: A major release
- **WHEN** a dependency has a new major release
- **THEN** a pull request of its own opens, assigned to Ahmed, and does not merge itself

#### Scenario: Pending updates
- **WHEN** updates are waiting
- **THEN** no issue lists them

### Requirement: Tools pinned in workflow commands are proposed, not merged
A tool version written inside a karkhana workflow command SHALL be proposed under the same 14-day rule as a declared
dependency, in a pull request of its own that SHALL NOT merge itself and SHALL be assigned to Ahmed, because every
project runs karkhana's workflows at `@main`.

#### Scenario: A newer duplication checker
- **WHEN** the duplication checker pinned in karkhana's shared workflow has a release at least 14 days old
- **THEN** a pull request proposes the new version, assigned to Ahmed, and does not merge itself

### Requirement: Update commits follow the semantic prefixes
Commits made by updates SHALL start with `ci:` for routine updates and `fix:` for security fixes.

#### Scenario: A routine group merges
- **WHEN** a weekly group or a lock file refresh merges
- **THEN** its commit message starts with `ci:`

#### Scenario: A security fix merges
- **WHEN** a security fix merges
- **THEN** its commit message starts with `fix:`
