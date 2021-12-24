// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  testEnvironment: 'jsdom',
  verbose: true,
  moduleFileExtensions: ['js'],
  transform: {
    '^.+\\.js?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@libraries(.*)$': '<rootDir>../../libraries$1',
    '^@commands(.*)$': '<rootDir>/src/components/commands$1',
    '^@layout(.*)$': '<rootDir>/src/components/layout$1',
    '^@libs(.*)$': '<rootDir>/src/components/libraries$1',
    '^@model(.*)$': '<rootDir>/src/components/model$1',
    '^@persistence(.*)$': '<rootDir>/src/components/persistence$1',
    '^@util(.*)$': '<rootDir>/src/components/util$1',
    '^@widget(.*)$': '<rootDir>/src/components/widget$1',
    '^@components(.*)$': '<rootDir>/src/components$1',
  },
};

module.exports = config;
