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
/// <reference types="cypress" />
import { addMatchImageSnapshotPlugin } from '@simonsmith/cypress-image-snapshot/plugin';

/**
 * Visual regression mode, read from the VISUAL_SNAPSHOTS environment variable.
 * See the "Image-snapshot tests" section of the repository CLAUDE.md.
 *
 * - `verify` (the default, also when unset): compare every `cy.matchImageSnapshot()` with its
 *   committed baseline and fail on a difference or on a missing baseline. `test:integration`,
 *   and so `yarn test` and the pre-push hook, run in this mode; `test:visual` sets it explicitly.
 * - `update`: write missing baselines and overwrite the ones that differ (`test:visual:update`).
 *
 * The baselines are rendered natively on macOS (headless Chrome): another OS renders fonts and
 * anti-aliasing differently and does not match them.
 */
const visualSnapshotMode = (): string => {
  const mode = (process.env.VISUAL_SNAPSHOTS || 'verify').trim().toLowerCase();
  if (mode !== 'verify' && mode !== 'update') {
    throw new Error(`VISUAL_SNAPSHOTS must be 'verify' or 'update', got '${mode}'`);
  }
  return mode;
};

/** `expose` values read by @simonsmith/cypress-image-snapshot. */
export const visualSnapshotExpose = (): Record<string, string | boolean> => {
  const mode = visualSnapshotMode();
  return {
    visualSnapshots: mode,
    updateSnapshots: mode === 'update',
    failOnSnapshotDiff: true,
    requireSnapshots: mode === 'verify',
  };
};

/** The `setupNodeEvents` of the Cypress config. */
const setupNodeEvents = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
): Cypress.PluginConfigOptions => {
  addMatchImageSnapshotPlugin(on);
  // Headless Chrome opens a 1280x720 window, too small for the 1000x660 viewport and the Cypress
  // runner around it: Cypress then shrinks the page to 1000x633 while it takes a screenshot, and
  // the resize lands in the middle of the capture (the mindplot canvas re-centres). A bigger
  // window keeps the viewport as configured.
  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.family === 'chromium' && browser.isHeadless) {
      launchOptions.args.push('--window-size=1600,1200');
    }
    return launchOptions;
  });
  return config;
};

export default setupNodeEvents;
