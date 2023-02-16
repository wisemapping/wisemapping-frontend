const { defineConfig } = require('cypress')

module.exports = defineConfig({
  video: false,
  videoUploadOnPasses: false,
  projectId: 'it9g7s',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:6006',
    specPattern: 'cypress/e2e/**/*.{js,ts}',
  },
})
