import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'it9g7s',
  video: true,
  videoUploadOnPasses: false,
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
  },
});
