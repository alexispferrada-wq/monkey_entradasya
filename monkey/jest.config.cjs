module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
