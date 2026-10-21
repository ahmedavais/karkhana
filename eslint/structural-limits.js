import { maxLinesPerFunction } from './max-lines-per-function.js';

export const structuralLimits = [
  {
    rules: {
      'max-params': ['error', 3],
      'max-depth': ['error', 4],
      complexity: ['error', 10],
      'max-lines-per-function': ['warn', { max: 30 }],
    },
  },
  {
    files: ['**/*.test.*'],
    plugins: { karkhana: { rules: { 'max-lines-per-function': maxLinesPerFunction } } },
    rules: {
      'max-lines-per-function': 'off',
      'karkhana/max-lines-per-function': 'warn',
    },
  },
];
