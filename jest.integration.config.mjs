export default {
  moduleFileExtensions: [
    'mjs',
    'js',
  ],
  testMatch: ['**/?(*.)integration.+(spec|test).(m)js'],
  collectCoverageFrom: [
    '**/app.mjs',
    '**/handlers/**/*.mjs',
  ],
  verbose: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
