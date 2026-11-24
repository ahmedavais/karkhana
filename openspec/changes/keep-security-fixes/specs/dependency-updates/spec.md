## MODIFIED Requirements

### Requirement: Security fixes for direct dependencies arrive at once
An update that fixes a known vulnerability in a dependency a manifest names directly SHALL be proposed as soon as the
fixed version exists, in a pull request of its own, without waiting for Monday or for the 14 days. It SHALL raise the
manifest's version range to the fixed version, so no later update or lock file refresh can resolve a version below it.
A vulnerability in a transitive dependency is fixed by the weekly lock file refresh.

#### Scenario: A vulnerability in a direct dependency, fixed today
- **WHEN** a known vulnerability affects a dependency the project's manifest names, and a fixed version was released
  today
- **THEN** a pull request with only that fix opens without waiting

#### Scenario: A fix the manifest's range already allowed
- **WHEN** the fixed version already satisfies the range the manifest names
- **THEN** the fix still raises the range so that its lowest allowed version is the fixed version

#### Scenario: The next lock file refresh
- **WHEN** a lock file refresh runs after a security fix has merged
- **THEN** the dependency stays at the fixed version or newer

#### Scenario: A vulnerability in a transitive dependency
- **WHEN** a known vulnerability affects a dependency that no manifest names directly
- **THEN** no separate pull request opens, and the next lock file refresh carries the fix if the parent's range allows
  it

## ADDED Requirements

### Requirement: An update never lowers a direct dependency
An update pull request that moves any dependency a manifest names directly to an older locked version SHALL fail a
check naming the dependency and both versions, so it does not merge itself and is assigned to Ahmed. Pull requests
that people open are not checked: a person who lowers a version means to.

#### Scenario: A lock file refresh lowers a direct dependency
- **WHEN** a lock file refresh moves a direct dependency from 7.4.7 to 7.4.5
- **THEN** a check fails naming the dependency, 7.4.7 and 7.4.5, and the pull request is assigned to Ahmed

#### Scenario: An update only raises versions
- **WHEN** an update moves direct dependencies only to newer versions
- **THEN** the check passes

#### Scenario: A transitive dependency moves back
- **WHEN** an update lowers only a dependency that no manifest names directly
- **THEN** the check passes

#### Scenario: A person lowers a version
- **WHEN** Ahmed opens a pull request that lowers a direct dependency
- **THEN** the check does not run
