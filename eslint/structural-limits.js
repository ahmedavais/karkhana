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
    rules: {
      'max-lines-per-function': 'off',
    },
  },
];
