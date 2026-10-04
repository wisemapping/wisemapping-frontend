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

// matchImageSnapshot compares with cypress/snapshots/<spec>/<name>.snap.png only when
// CYPRESS_imageSnaphots is set (the Docker runner). Elsewhere it just takes the screenshot, as
// rendering differs between hosts.
if (Cypress.expose('imageSnaphots')) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { addMatchImageSnapshotCommand } = require('@simonsmith/cypress-image-snapshot/command');
  addMatchImageSnapshotCommand({
    // Docker rendering is deterministic, so the threshold is tight: 0.01 % of the page
    // (66 pixels at 1000x660), with pixelmatch's default per-pixel colour tolerance.
    failureThreshold: 0.0001,
    failureThresholdType: 'percent',
    customDiffConfig: { threshold: 0.1 },
  });
} else {
  Cypress.Commands.add(
    'matchImageSnapshot',
    { prevSubject: ['optional', 'element', 'window', 'document'] },
    (subject, name) => cy.screenshot(name),
  );
}
