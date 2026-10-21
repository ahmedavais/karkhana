import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Linter } from 'eslint';
import { structuralLimits } from './structural-limits.js';

function findingsFor(code, filename = 'module.js') {
  return new Linter()
    .verify(code, structuralLimits, filename)
    .map(({ ruleId, severity }) => ({ ruleId, severity: severity === 2 ? 'error' : 'warning' }));
}

function findingsInTestFile(code) {
  return findingsFor(code, 'module.test.js');
}

function testOf(lineCount) {
  const steps = Array.from({ length: lineCount - 2 }, () => 'x += 1;').join('\n');
  return `it('behaves', () => {\n${steps}\n});`;
}

function describeBlockOf(lineCount) {
  const tests = Array.from({ length: lineCount - 2 }, (_, n) => `it('behaves ${n}', () => {});`).join('\n');
  return `describe('module', () => {\n${tests}\n});`;
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

test('a function with complexity over 10 is an error', () => {
  const tenBranches = Array.from({ length: 10 }, (_, n) => `if (x === ${n}) return ${n};`).join('\n');

  const findings = findingsFor(`function f(x) {\n${tenBranches}\nreturn -1;\n}`);

  assert.deepEqual(findings, [{ ruleId: 'complexity', severity: 'error' }]);
});

test('a function over 30 lines is a warning, not an error', () => {
  const twentyEightLines = Array.from({ length: 28 }, () => 'x += 1;').join('\n');

  const findings = findingsFor(`function f(x) {\n${twentyEightLines}\nreturn x;\n}`);

  assert.deepEqual(findings, [{ ruleId: 'max-lines-per-function', severity: 'warning' }]);
});

test('code exactly at every limit lints clean', () => {
  const nineBranches = Array.from({ length: 9 }, (_, n) => `if (x === ${n}) return ${n};`).join('\n');
  const twentySevenLines = Array.from({ length: 27 }, () => 'x += 1;').join('\n');

  const findings = findingsFor(`
function atParameterAndDepthLimits(a, b, c) {
  if (a) { if (b) { if (c) { if (a) { return a + b + c; } } } }
  return 0;
}
function atComplexityLimit(x) {\n${nineBranches}\nreturn -1;\n}
function atLengthLimit(x) {\n${twentySevenLines}\nreturn x;\n}
`);

  assert.deepEqual(findings, []);
});

test('a describe block of 100 lines in a test file lints clean', () => {
  const findings = findingsInTestFile(describeBlockOf(100));

  assert.deepEqual(findings, []);
});

test('a describe block over 100 lines asks whether the module under test does more than one thing', () => {
  const findings = new Linter().verify(describeBlockOf(101), structuralLimits, 'module.test.js');

  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, 'karkhana/max-lines-per-describe');
  assert.equal(findings[0].severity, 1);
  assert.match(findings[0].message, /describe has too many lines \(101\)\. Maximum allowed is 100: does the module under test do more than one thing\?/);
});

test('a test of 30 lines in a test file lints clean', () => {
  const findings = findingsInTestFile(`let x = 0;\n${testOf(30)}`);

  assert.deepEqual(findings, []);
});

test('a test over 30 lines in a test file is a warning', () => {
  const findings = findingsInTestFile(`let x = 0;\n${testOf(31)}`);

  assert.deepEqual(findings, [{ ruleId: 'karkhana/max-lines-per-function', severity: 'warning' }]);
});

test('a skipped or focused describe block is held to the same 100 lines', () => {
  const skipped = describeBlockOf(60).replace('describe(', 'describe.skip(');
  const focused = describeBlockOf(60).replace('describe(', 'describe.only(');

  const findings = findingsInTestFile(`${skipped}\n${focused}`);

  assert.deepEqual(findings, []);
});
