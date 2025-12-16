const config = {
  testEnvironment: 'jsdom',
  verbose: true,
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.(ts)?$': 'ts-jest',
    '^.+\\.(js)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@wisemapping/web2d$': '<rootDir>/../web2d/src/index.ts',
    '^@wisemapping/web2d/(.*)$': '<rootDir>/../web2d/src/$1',
  },
};

module.exports = config;
