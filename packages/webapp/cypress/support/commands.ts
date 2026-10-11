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

import '@testing-library/cypress/add-commands';

import axe from 'axe-core';

// Runs axe-core in the page under test and yields its violations (cypress/e2e/accessibility.cy.ts).
// axe ships its own source (axe.source) to be injected into the page it scans: run from the spec's
// frame, it would scan that frame instead.
Cypress.Commands.add('scanA11y', () =>
  cy.window({ log: false }).then((win) => {
    const page = win as typeof win & { axe?: typeof axe };
    if (!page.axe) {
      page.eval(axe.source);
    }
    const pageAxe = page.axe;
    if (!pageAxe) {
      throw new Error('axe-core could not be loaded into the page');
    }
    return pageAxe.run(win.document).then((results) => results.violations);
  }),
);
