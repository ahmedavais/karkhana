const LONGEST_MESSAGE = 300;
const USAGE_LIMIT = /\b(?:usage|weekly|session|\d+-hour|opus|sonnet) limit\b|\byou(?:['’]ve| have) hit your limit\b/i;

export function shouldRetryReview(messages) {
  const result = messages.findLast(({ type }) => type === 'result');
  const message = result?.result || '';
  return reviewError(messages) !== null && !USAGE_LIMIT.test(message);
}

export function reviewError(messages) {
  const result = messages.findLast(({ type }) => type === 'result');
  if (result?.subtype !== 'success' || !result.is_error) return null;
  return (result.result || 'no message').slice(0, LONGEST_MESSAGE);
}
