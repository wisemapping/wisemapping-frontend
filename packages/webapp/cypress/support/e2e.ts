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
  // Store original console methods
  const originalError = win.console.error.bind(win.console);
  const originalWarn = win.console.warn.bind(win.console);

  // Wrap console methods to filter browser extension errors
  win.console.error = (...args: unknown[]) => {
    const errorMessage = String(args[0] || '');
    // Ignore browser extension errors
    if (
      errorMessage.includes('content_script.js') ||
      errorMessage.includes('Cannot read properties of undefined') ||
      errorMessage.includes("reading 'control'")
    ) {
      return;
    }
    originalError(...args);
  };

  win.console.warn = (...args: unknown[]) => {
    const warnMessage = String(args[0] || '');
    // Ignore browser extension warnings
    if (warnMessage.includes('content_script.js')) {
      return;
    }
    originalWarn(...args);
  };

  // Spy on the wrapped methods to track real application errors
  cy.spy(win.console, 'error');
  cy.spy(win.console, 'warn');
});

afterEach(() => {
  // cy.request() tests don't boot an AUT window, so Cypress won't have spies set up.
  // Use Cypress.state to check for an existing window and only assert when present.
  cy.then(() => {
    const win = Cypress.state('window') as Window | undefined;
    if (!win) {
      return;
    }

    const errorSpy = win.console.error as unknown as { callCount?: number };
    const warnSpy = win.console.warn as unknown as { callCount?: number };

    if (errorSpy && typeof errorSpy.callCount === 'number') {
      expect(win.console.error).to.have.callCount(0);
    }
    if (warnSpy && typeof warnSpy.callCount === 'number') {
      expect(win.console.warn).to.have.callCount(0);
    }
  });
});
