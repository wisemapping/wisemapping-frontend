import { defineConfig } from 'cypress';
import setupNodeEvents, { visualSnapshotExpose } from './cypress/plugins';

export default defineConfig({
  projectId: 'it9g7s',
  video: process.env.CYPRESS_VIDEO === 'true',
  // Image-snapshot mode (VISUAL_SNAPSHOTS=verify, the default, or update), see cypress/plugins/index.ts.
  expose: visualSnapshotExpose(),
  includeShadowDom: true,
  viewportWidth: 1000,
  viewportHeight: 660,
  e2e: {
    setupNodeEvents,
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:8081',
    specPattern: ['cypress/e2e/**/*.cy.ts', '!cypress/e2e/storybook/**/*.cy.ts'],
    supportFile: 'cypress/support/e2e.ts',
    chromeWebSecurity: false,
  },
});
