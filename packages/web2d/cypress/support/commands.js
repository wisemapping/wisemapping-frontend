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

// Visual regression (see cypress/plugins/index.js and the "Image-snapshot tests" section of CLAUDE.md).
// matchImageSnapshot compares with cypress/snapshots/<spec>/<name>.snap.png, rendered natively on
// macOS (headless Chrome). A snapshot fails when more than 10 pixels differ: repeated native runs
// are pixel-identical, so this only leaves room for an isolated anti-aliasing pixel.
import { addMatchImageSnapshotCommand } from '@simonsmith/cypress-image-snapshot/command';

addMatchImageSnapshotCommand({
  failureThreshold: 10,
  failureThresholdType: 'pixel',
  // Per-pixel colour distance (pixelmatch YIQ, 0..1) below which two pixels count as equal.
  // 0.01 (the jest-image-snapshot default) flags a darker shade of the same hue; 0.1 does not.
  customDiffConfig: { threshold: 0.01 },
});

// A story renders asynchronously: wait until Storybook shows it (not the "preparing" spinner),
// its workspace is in the DOM and the fonts are loaded, so that a snapshot never captures a
// half-rendered page.
Cypress.Commands.overwrite('visit', (originalFn, url, options) =>
  originalFn(url, options).then(() => {
    if (String(url).includes('iframe.html')) {
      cy.get('body.sb-show-main', { timeout: 30000 });
      cy.get('#storybook-root svg', { timeout: 30000 }).should('exist');
      cy.document().its('fonts.status').should('equal', 'loaded');
    }
  }),
);
