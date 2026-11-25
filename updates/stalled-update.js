const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;
const STALL_AFTER_DAYS = 3;
const GREEN_STATES = new Set(['SUCCESS', 'SKIPPED', 'NEUTRAL']);
const HOW_RENOVATE_MERGES =
  "Renovate merges an update only once every check has passed, been skipped or come back neutral. These haven't:";
const NO_CHECK_HOLDS_IT = 'Every check has passed, so something other than a check holds it.';

function checkFrom(rollupEntry) {
  if (rollupEntry.__typename === 'StatusContext') return { name: rollupEntry.context, state: rollupEntry.state };
  return { name: rollupEntry.name, state: rollupEntry.conclusion || rollupEntry.status };
}

const unpassedChecks = (pullRequest) =>
  pullRequest.statusCheckRollup.map(checkFrom).filter(({ state }) => !GREEN_STATES.has(state));

const daysOpen = (pullRequest, now) => (now - new Date(pullRequest.createdAt)) / DAY_MILLISECONDS;

function whatHoldsIt(unpassed) {
  if (unpassed.length === 0) return NO_CHECK_HOLDS_IT;
  return [HOW_RENOVATE_MERGES, ...unpassed.map(({ name, state }) => `- ${name}: ${state}`)].join('\n');
}

function commentFor(pullRequest, now) {
  const days = Math.floor(daysOpen(pullRequest, now));
  const opening = `This update has been open ${days} days without merging itself or being assigned.`;
  return `${opening}\n\n${whatHoldsIt(unpassedChecks(pullRequest))}`;
}

const isRenovateUpdate = (pullRequest) => pullRequest.author.login === 'app/renovate';

const isUnassigned = (pullRequest) => pullRequest.assignees.length === 0;

function hasStalled(pullRequest, now) {
  return isRenovateUpdate(pullRequest) && isUnassigned(pullRequest) && daysOpen(pullRequest, now) > STALL_AFTER_DAYS;
}

export function stalledUpdates(pullRequests, now) {
  return pullRequests
    .filter((pullRequest) => hasStalled(pullRequest, now))
    .map((pullRequest) => ({ number: pullRequest.number, comment: commentFor(pullRequest, now) }));
}
