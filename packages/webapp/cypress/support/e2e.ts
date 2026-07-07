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

// Set a mock JWT token before each test so authenticated pages work.
// Tests for unauthenticated pages (login, registration) should call cy.clearCookie('jwt-auth-token').
beforeEach(() => {
  cy.setCookie('jwt-auth-token', 'mock-test-token', { path: '/' });
});

Cypress.Commands.add('getMindplotShadowRoot', () =>
  cy.get('mindplot-component', { timeout: 120000 }).shadow(),
);

Cypress.Commands.add('waitForEditorLoaded', () => {
  // Wait editor ...
  cy.getMindplotShadowRoot().find('svg', { timeout: 120000 }).should('be.visible');
  cy.getMindplotShadowRoot().find('svg [test-id="1"]', { timeout: 120000 }).should('exist');
  cy.get('[aria-label="vortex-loading"]', { timeout: 120000 }).should('not.exist');
  cy.clearLocalStorage('welcome-xml');

  // Wait for font ...
  cy.document().its('fonts.status').should('equal', 'loaded');
});

Cypress.Commands.add('waitForPageLoaded', () => {
  // Wait page be loaded...
  cy.document().its('fonts.status').should('equal', 'loaded');
});

// Console messages that are expected in the e2e environment and must NOT fail a
// test. These are benign-by-design, not application defects:
//   - browser extension noise injected into the page (content_script.js, ...)
//   - "Service using mock client": the suite runs against config.mock.json
//     (clientType: 'mock'), so the mock client is the deliberate backend.
// Only genuinely-external noise belongs here. Do NOT add generic messages like
// "Cannot read properties of undefined" — that would mask real application
// null-dereference crashes. Match on something unambiguously external (e.g. the
// injected extension source file).
const IGNORED_ERROR_PATTERNS = ['content_script.js'];
const IGNORED_WARN_PATTERNS = ['content_script.js', 'Service using mock client'];

const isIgnored = (patterns: string[], args: unknown[]): boolean => {
  const message = String(args[0] ?? '');
  return patterns.some((pattern) => message.includes(pattern));
};

// A cy.spy() is a sinon spy; expose just the bit of its surface we rely on.
type ConsoleSpy = { getCalls?: () => Array<{ args: unknown[] }> };

Cypress.on('window:before:load', (win) => {
  // Store original console methods
  const originalError = win.console.error.bind(win.console);
  const originalWarn = win.console.warn.bind(win.console);

  // Keep the real console clean by not printing ignored messages. Note this
  // only suppresses output — the spy below still records every call, so the
  // afterEach assertion is what actually filters via the same allowlists.
  win.console.error = (...args: unknown[]) => {
    if (isIgnored(IGNORED_ERROR_PATTERNS, args)) {
      return;
    }
    originalError(...args);
  };

  win.console.warn = (...args: unknown[]) => {
    if (isIgnored(IGNORED_WARN_PATTERNS, args)) {
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
    const win = Cypress.state('window') as Cypress.AUTWindow | undefined;
    if (!win) {
      return;
    }

    const assertClean = (spy: ConsoleSpy, method: string, ignored: string[]) => {
      if (typeof spy?.getCalls !== 'function') {
        return;
      }
      const unexpected = spy.getCalls().filter((call) => !isIgnored(ignored, call.args));
      const details = unexpected.map((call) => String(call.args[0])).join(' | ');
      expect(unexpected.length, `unexpected console.${method}: ${details}`).to.equal(0);
    };

    assertClean(win.console.error as unknown as ConsoleSpy, 'error', IGNORED_ERROR_PATTERNS);
    assertClean(win.console.warn as unknown as ConsoleSpy, 'warn', IGNORED_WARN_PATTERNS);
  });
});
