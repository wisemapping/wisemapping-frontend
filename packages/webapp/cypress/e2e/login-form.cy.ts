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

describe('Login Form', () => {
  beforeEach(() => {
    // Clear auth token so the login page shows the form instead of redirecting
    cy.clearCookie('jwt-auth-token');
    cy.visit('/c/login');
    cy.waitForPageLoaded();
  });

  it('submitting valid credentials redirects to maps page', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('form[role="form"]').submit();
    cy.url().should('include', '/c/maps');
  });

  it('"Forgot Password?" link navigates to forgot-password page', () => {
    cy.contains('Forgot Password ?').click();
    cy.url().should('include', '/c/forgot-password');
  });
});
