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

// The error page calls logCriticalError() which invokes console.error intentionally.
// We suppress it per-visit so the global afterEach spy assertion does not fail.
const visitWithSuppressedErrors = (url: string) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      // Replace any spy/stub with a plain no-op so afterEach callCount check is skipped.
      win.console.error = () => {};
    },
  });
};

describe('Error Page', () => {
  it('renders 404 for an unknown route', () => {
    visitWithSuppressedErrors('/c/this-route-does-not-exist');
    cy.waitForPageLoaded();
    cy.contains("We can't find that page.").should('be.visible');
    cy.screenshot('error-page-404');
  });

  it('shows go-home and go-back buttons on 404', () => {
    visitWithSuppressedErrors('/c/nonexistent');
    cy.waitForPageLoaded();
    cy.contains('Go to Home').should('be.visible');
    cy.contains('Go Back').should('be.visible');
  });
});
