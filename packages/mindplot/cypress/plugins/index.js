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
const { addMatchImageSnapshotPlugin } = require('@simonsmith/cypress-image-snapshot/plugin');

/**
 * Visual regression mode, read from the VISUAL_SNAPSHOTS environment variable.
 * See the "Image-snapshot tests" section of the repository CLAUDE.md.
 *
 * - `verify`: compare every `cy.matchImageSnapshot()` with its committed baseline and fail
 *   on a difference or on a missing baseline. Used by docker-compose.snapshots.yml.
 * - `update`: write missing baselines and overwrite the ones that differ. Used by
 *   docker-compose.snapshots.update.yml.
 * - unset (host runs): compare and only log differences in the command log. Baselines are
 *   never written, because fonts and anti-aliasing on a developer machine differ from the
 *   pinned Docker image the baselines come from.
 */
const visualSnapshotMode = () => {
  const mode = (process.env.VISUAL_SNAPSHOTS || '').trim().toLowerCase();
  if (mode !== '' && mode !== 'verify' && mode !== 'update') {
    throw new Error(`VISUAL_SNAPSHOTS must be 'verify', 'update' or unset, got '${mode}'`);
  }
  return mode;
};

/** `expose` values read by @simonsmith/cypress-image-snapshot and cypress/support/commands.js. */
const visualSnapshotExpose = () => {
  const mode = visualSnapshotMode();
  return {
    visualSnapshots: mode || 'log',
    updateSnapshots: mode === 'update',
    failOnSnapshotDiff: mode !== '',
    requireSnapshots: mode !== 'update',
  };
};

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  addMatchImageSnapshotPlugin(on);
  return config;
};
module.exports.visualSnapshotExpose = visualSnapshotExpose;
