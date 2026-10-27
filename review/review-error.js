const LONGEST_MESSAGE = 300;

export function reviewError(messages) {
  const result = messages.findLast(({ type }) => type === 'result');
  if (result?.subtype !== 'success' || !result.is_error) return null;
  return (result.result || 'no message').slice(0, LONGEST_MESSAGE);
}
