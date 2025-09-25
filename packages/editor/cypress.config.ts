import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'it9g7s',
  video: true,
  includeShadowDom: true,
  viewportWidth: 1000,
  viewportHeight: 660,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts')(on, config);
    },
    baseUrl: 'http://localhost:8081',
    // Add configuration to help with macOS compatibility
    chromeWebSecurity: false,
    experimentalStudio: false,
  },
  // Add browser launch options for macOS compatibility
  chrome: {
    args: ['--no-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
  }
});
