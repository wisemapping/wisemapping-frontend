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

import './commands';

Cypress.Commands.add('waitForEditorLoaded', () => {
  // Wait editor ...
  cy.get('svg > path').should('be.visible');
  cy.get('[aria-label="vortex-loading"]', { timeout: 120000 }).should('not.exist');
  cy.clearLocalStorage('welcome-xml');

  // Wait for font ...
  cy.document().its('fonts.status').should('equal', 'loaded');
});

Cypress.Commands.add('waitForPageLoaded', () => {
  // Wait page be loaded...
  cy.document().its('fonts.status').should('equal', 'loaded');
});

Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'error');
  cy.spy(win.console, 'warn');
});

afterEach(() => {
  cy.window().then((win) => {
    expect(win.console.error).to.have.callCount(0);
    expect(win.console.warn).to.have.callCount(0);
  });
});
