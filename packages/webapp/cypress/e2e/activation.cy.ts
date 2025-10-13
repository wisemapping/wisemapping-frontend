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

describe('Activation Page', () => {
  describe('Invalid Activation Code', () => {
    beforeEach(() => {
      // Mock API to return error for invalid code
      cy.intercept('PUT', '**/api/restful/users/activation*', {
        statusCode: 400,
        body: {
          globalErrors: ['Invalid activation code or account already activated'],
        },
      }).as('activationError');
      
      cy.visit('/c/activation?code=999999999');
      cy.waitForPageLoaded();
    });

    it('should display activation error message', () => {
      // Wait for activation API call
      cy.wait('@activationError');
      
      // Check error title
      cy.contains('Activation Failed').should('be.visible');
      
      // Check error message
      cy.contains("We couldn't activate your account").should('be.visible');
      cy.contains('activation link may be invalid or expired').should('be.visible');
      cy.contains('Please contact support for assistance').should('be.visible');
      
      // Check only Sign In button is present (no Sign Up button)
      cy.contains('button', 'Sign In').should('be.visible');
      cy.contains('button', 'Sign Up').should('not.exist');
    });

    it('should navigate to login page when clicking Sign In', () => {
      cy.wait('@activationError');
      cy.contains('button', 'Sign In').click();
      cy.url().should('include', '/c/login');
    });
  });

  describe('Valid Activation Code', () => {
    beforeEach(() => {
      // Mock API to return success for valid code
      cy.intercept('PUT', '**/api/restful/users/activation*', {
        statusCode: 204,
      }).as('activationSuccess');
      
      cy.visit('/c/activation?code=1234567890');
      cy.waitForPageLoaded();
    });

    it('should display activation success message', () => {
      // Wait for activation API call
      cy.wait('@activationSuccess');
      
      // Check success title
      cy.contains('Account Activated Successfully').should('be.visible');
      
      // Check success message in the alert
      cy.contains('Your account has been activated').should('be.visible');
      cy.contains('You can now sign in and start creating mind maps').should('be.visible');
      
      // Check Sign In button exists (it's a Button component with RouterLink)
      cy.contains('button', 'Sign In').should('be.visible');
    });

    it('should match visual snapshot for success state', () => {
      cy.wait('@activationSuccess');
      cy.matchImageSnapshot('activation-success-page');
    });

    it('should navigate to login page after successful activation', () => {
      cy.wait('@activationSuccess');
      cy.contains('button', 'Sign In').click();
      cy.url().should('include', '/c/login');
    });
  });

  describe('Missing Activation Code', () => {
    beforeEach(() => {
      cy.visit('/c/activation');
      cy.waitForPageLoaded();
    });

    it('should display error for missing activation code', () => {
      // Check error title
      cy.contains('Activation Failed').should('be.visible');
      
      // The component should detect missing code immediately without API call
      cy.contains('button', 'Sign In').should('be.visible');
      cy.contains('button', 'Sign Up').should('not.exist');
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      // Mock API with delay to capture loading state
      cy.intercept('PUT', '**/api/restful/users/activation*', (req) => {
        req.reply({
          delay: 2000, // 2 second delay
          statusCode: 204,
        });
      }).as('activationDelayed');
      
      cy.visit('/c/activation?code=1234567890');
    });

    it('should display loading spinner during activation', () => {
      // Check loading title
      cy.contains('Activating Your Account').should('be.visible');
      
      // Check loading message
      cy.contains('Please wait while we activate your account').should('be.visible');
      
      // Check spinner is visible
      cy.get('[role="progressbar"]').should('be.visible');
    });
  });
});

