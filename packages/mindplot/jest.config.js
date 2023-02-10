const config = {
  testEnvironment: 'jsdom',
  verbose: true,
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.(ts)?$': 'ts-jest',
    '^.+\\.(js)$': 'babel-jest',
  },
};

module.exports = config;
