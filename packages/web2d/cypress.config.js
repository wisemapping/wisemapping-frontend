const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: true,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:6006',
    // Add macOS compatibility options
    chromeWebSecurity: false,
    experimentalStudio: false,
  },
  // Add browser launch options for macOS compatibility
  chrome: {
    args: ['--no-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor'],
  },
});
