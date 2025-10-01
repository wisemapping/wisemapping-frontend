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
