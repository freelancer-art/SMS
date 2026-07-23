export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { esModuleInterop: true, target: 'es2022' } }]
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testTimeout: 30000,
  verbose: true,
  clearMocks: true
};
