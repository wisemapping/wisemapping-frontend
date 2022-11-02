const config = {
  testEnvironment: 'jsdom',
  verbose: true,
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'ts','tsx'],
  transform: {
    '^.+\\.js?$': 'babel-jest',
    ".+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub"
  },
};

module.exports = config;
