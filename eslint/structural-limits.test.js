import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Linter } from 'eslint';
import { structuralLimits } from './structural-limits.js';

function findingsFor(code) {
  return new Linter()
    .verify(code, [structuralLimits])
    .map(({ ruleId, severity }) => ({ ruleId, severity: severity === 2 ? 'error' : 'warning' }));
}

test('a function with more than 3 parameters is an error', () => {
  const findings = findingsFor('function f(a, b, c, d) { return a + b + c + d; }');

  assert.deepEqual(findings, [{ ruleId: 'max-params', severity: 'error' }]);
});

test('code nested deeper than 4 blocks is an error', () => {
  const findings = findingsFor(`
    function f(x) {
      if (x) { if (x) { if (x) { if (x) { if (x) { return x; } } } } }
    }
  `);

  assert.deepEqual(findings, [{ ruleId: 'max-depth', severity: 'error' }]);
});
