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

describe('OAuth Callback Page', () => {
  it('displays an error when no OAuth code or token is present', () => {
    cy.visit('/c/oauth-callback');
    cy.waitForPageLoaded();
    cy.contains('Missing OAuth code or token').should('be.visible');
    cy.matchImageSnapshot('oauth-callback-error');
  });

  it('displays an error and back-to-login link when OAuth is denied', () => {
    cy.visit('/c/oauth-callback?error=access_denied');
    // access_denied redirects to login immediately
    cy.url().should('include', '/c/login');
  });

  it('displays Google OAuth callback error state', () => {
    cy.visit('/c/registration-google');
    cy.waitForPageLoaded();
    cy.contains('Missing OAuth code or token').should('be.visible');
  });

  it('displays Facebook OAuth callback error state', () => {
    cy.visit('/c/registration-facebook');
    cy.waitForPageLoaded();
    cy.contains('Missing OAuth code or token').should('be.visible');
  });
});
