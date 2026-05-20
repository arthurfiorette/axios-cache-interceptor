/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  extensionsToTreatAsEsm: ['.ts'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^(\\.{1,2}/.*)\\.ts$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: "esnext",
          target: "es2022",
          esModuleInterop: true,
          allowJs: true,
          declaration: false,
        },
      }
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|cache-parser|fast-defer|object-code)/)',
  ],
};