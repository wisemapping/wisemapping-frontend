import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts')(on, config);
    },
    baseUrl: 'http://localhost:3000',
    // Add macOS compatibility options
    chromeWebSecurity: false,
    experimentalStudio: false,
  },
  // Add browser launch options for macOS compatibility
  chrome: {
    args: ['--no-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
  }
});
