/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: process.env.CYPRESS_VIDEO === 'true',
  // Pixel snapshots (cypress/snapshots) are compared only when CYPRESS_imageSnaphots is set,
  // which the Docker runner does (docker-compose.snapshots*.yml); elsewhere fonts and
  // anti-aliasing differ, so matchImageSnapshot only takes a screenshot.
  expose: {
    imageSnaphots: !!process.env.CYPRESS_imageSnaphots,
    // Read by @simonsmith/cypress-image-snapshot.
    updateSnapshots: process.env.CYPRESS_updateSnapshots === 'true',
    requireSnapshots: process.env.CYPRESS_requireSnapshots === 'true',
    failOnSnapshotDiff: process.env.CYPRESS_failOnSnapshotDiff !== 'false',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:6006',
    // Add macOS compatibility options
    chromeWebSecurity: false,
  },
  // Add browser launch options for macOS compatibility
  chrome: {
    args: ['--no-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor'],
  },
});
