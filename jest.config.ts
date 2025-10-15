// jest.config.ts
// -----------------------------------------------------------------------------
// Provenance & Academic Integrity Notes
// - Source pattern: Jest + SWC setup for TypeScript tests mirrors what was
//   shown in lectures (Node test environment, swc transform, path alias mapper).
// - Reuse:
//   • testMatch targets __tests__/**/*.test.ts(x) per the course template.
//   • moduleNameMapper resolves "@/..." to project root so imports work in tests.
//   • collectCoverageFrom limits coverage to app/components/lib/models only.
// - AI Assist: Commented the rationale for each key, ensured transform options
//   shape is correct for '@swc/jest' (tuple with empty options object).
// - External references: Jest docs (config), SWC Jest docs (transform tuple).
// -----------------------------------------------------------------------------

import type { Config } from 'jest';

const config: Config = {
  // Run API/integration tests in a Node-like environment
  testEnvironment: 'node',

  // Look for tests in __tests__ with .test.ts or .test.tsx
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],

  // Use SWC to transpile TS/TSX quickly (faster than ts-jest for this use-case)
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest', {}], // keep empty options object
  },

  // Support the "@/..." import alias used throughout the app
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Basic coverage setup (what markers typically expect)
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'models/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
};

export default config;