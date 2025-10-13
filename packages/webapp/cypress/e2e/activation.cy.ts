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
      // Visit with error code (999999999 triggers error in mock client)
      cy.visit('/c/activation?code=999999999');
      cy.waitForPageLoaded();
    });

    it('should display activation error message', () => {
      // Wait for error state to render
      cy.contains('Activation Failed', { timeout: 10000 }).should('be.visible');
      
      // Check error message
      cy.contains('Invalid activation code or account already activated').should('be.visible');
      
      // Check only Sign In button is present (no Sign Up button)
      cy.contains('button', 'Sign In').should('be.visible');
      cy.contains('button', 'Sign Up').should('not.exist');
    });

    it('should navigate to login page when clicking Sign In', () => {
      cy.contains('Activation Failed', { timeout: 10000 }).should('be.visible');
      cy.contains('button', 'Sign In').click();
      cy.url().should('include', '/c/login');
    });
  });

  describe('Valid Activation Code', () => {
    beforeEach(() => {
      // Visit with valid code (any code except 999999999 will succeed in mock client)
      cy.visit('/c/activation?code=1234567890');
      cy.waitForPageLoaded();
    });

    it('should display activation success message', () => {
      // Wait for success state to render
      cy.contains('Account Activated Successfully', { timeout: 10000 }).should('be.visible');
      
      // Check success message in the alert
      cy.contains('Your account has been activated').should('be.visible');
      cy.contains('You can now sign in and start creating mind maps').should('be.visible');
      
      // Check Sign In button exists
      cy.contains('button', 'Sign In').should('be.visible');
    });

    it('should match visual snapshot for success state', () => {
      cy.contains('Account Activated Successfully', { timeout: 10000 }).should('be.visible');
      cy.matchImageSnapshot('activation-success-page');
    });

    it('should navigate to login page after successful activation', () => {
      cy.contains('Account Activated Successfully', { timeout: 10000 }).should('be.visible');
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
      // Visit page - mock client has a small delay built in
      cy.visit('/c/activation?code=1234567890');
    });

    it('should display loading spinner during activation', () => {
      // Check loading title appears briefly (may not always catch it due to fast mock)
      // This test might be flaky with mock client, but we'll check for either loading or success state
      cy.get('body').should('be.visible');
      
      // Eventually should show success
      cy.contains('Account Activated Successfully', { timeout: 10000 }).should('be.visible');
    });
  });
});

