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

describe('Registration Form', () => {
  beforeEach(() => {
    cy.visit('/c/registration');
    cy.waitForPageLoaded();
  });

  it('valid submission redirects to registration-success page', () => {
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="firstname"]').type('John');
    cy.get('input[name="lastname"]').type('Doe');
    cy.get('input[name="password"]').type('password123');
    cy.get('form[role="form"]').submit();
    cy.url().should('include', '/c/registration-success');
  });

  it('shows error message when registration fails', () => {
    cy.get('input[name="email"]').type('error@example.com');
    cy.get('input[name="firstname"]').type('John');
    cy.get('input[name="lastname"]').type('Doe');
    cy.get('input[name="password"]').type('password123');
    cy.get('form[role="form"]').submit();
    cy.contains('Registration Failed').should('be.visible');
  });
});
