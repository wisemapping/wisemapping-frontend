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

import { addMatchImageSnapshotCommand } from '@simonsmith/cypress-image-snapshot/command';

// Visual regression (see cypress/plugins/index.js and the "Image-snapshot tests" section of CLAUDE.md).
// Baselines live in cypress/snapshots/<spec>/<name>.snap.png and are rendered natively on macOS
// (headless Chrome). A snapshot fails when more than 10 pixels differ: repeated native runs are
// pixel-identical, so this only leaves room for an isolated anti-aliasing pixel. The threshold
// is absolute, so it stays as tight on the tall full-page stories as on the small ones.
addMatchImageSnapshotCommand({
  failureThreshold: 10,
  failureThresholdType: 'pixel',
  // Per-pixel colour distance (pixelmatch YIQ, 0..1) below which two pixels count as equal.
  // 0.01 (the jest-image-snapshot default) flags a darker shade of the same hue; 0.1 does not.
  customDiffConfig: { threshold: 0.01 },
  capture: 'fullPage',
  // Full-page captures of long stories (layout-suite is ~44k px tall) take a while.
  timeout: 180000,
});

const FREEZE_STYLE_ID = 'cypress-visual-freeze';
const FREEZE_CSS = `*, *::before, *::after {
  transition: none !important;
  animation: none !important;
  caret-color: transparent !important;
}`;

// Waits until the story's markup stops changing: Storybook mounts the story asynchronously
// after `load`, and mindplot lays topics out in further ticks.
const waitForStableStory = (previous = '', stableChecks = 0, attempts = 0) => {
  cy.get('#storybook-root', { log: false }).then(($root) => {
    const markup = $root.html();
    const settled = markup === previous ? stableChecks + 1 : 0;
    if (settled >= 2) {
      return;
    }
    if (attempts > 60) {
      throw new Error('Story markup did not settle before the snapshot');
    }
    cy.wait(150, { log: false });
    waitForStableStory(markup, settled, attempts + 1);
  });
};

// Make every snapshot wait for a stable frame: the story's SVG rendered and settled, web fonts
// loaded, CSS transitions and animations at their end state, and two animation frames painted.
Cypress.Commands.overwrite('matchImageSnapshot', (originalFn, subject, ...args) => {
  cy.get('#storybook-root svg text', { log: false, timeout: 30000 }).should('exist');
  cy.document({ log: false }).then((doc) => {
    if (!doc.getElementById(FREEZE_STYLE_ID)) {
      const style = doc.createElement('style');
      style.id = FREEZE_STYLE_ID;
      style.textContent = FREEZE_CSS;
      doc.head.appendChild(style);
    }
  });
  waitForStableStory();
  cy.document({ log: false }).its('fonts.status', { log: false }).should('equal', 'loaded');
  cy.window({ log: false }).then(
    (win) =>
      new Cypress.Promise((resolve) => {
        win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()));
      }),
  );
  return originalFn(subject, ...args).then(() => {
    cy.document({ log: false }).then((doc) => doc.getElementById(FREEZE_STYLE_ID)?.remove());
  });
});

// https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/
Cypress.Commands.add('getIframeBody', () =>
  cy.get('iframe').its('0.contentDocument.body').should('not.be.empty').then(cy.wrap),
);
