// jest.config.mjs
import nextJest from 'next/jest.js';
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  testMatch: ['**/tests/**/*.spec.(ts|tsx)'],
  maxWorkers: 1, // keeps sqlite access simple
};

export default createJestConfig(customJestConfig);