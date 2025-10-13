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

describe('Registration Success Page', () => {
  beforeEach(() => {
    cy.visit('/c/registration-success');
    cy.waitForPageLoaded();
  });

  it('should display registration success page with email confirmation message', () => {
    // Check title
    cy.contains('Registration Successful!').should('be.visible');
    
    // Check activation email message
    cy.contains("We've sent an activation email to your inbox").should('be.visible');
    cy.contains('Please check your email and click on the activation link').should('be.visible');
    
    // Check spam folder reminder
    cy.contains("If you don't see the email, please check your spam folder").should('be.visible');
    
    // Check already activated message
    cy.contains('Already activated your account?').should('be.visible');
    
    // Check Sign In button exists (it's a Button component with RouterLink)
    cy.contains('button', 'Sign In').should('be.visible');
  });

  it('should match visual snapshot', () => {
    cy.matchImageSnapshot('registration-success-page');
  });

  it('should have correct page title', () => {
    cy.title().should('include', 'Success');
  });

  it('should navigate to login page when clicking Sign In button', () => {
    cy.contains('button', 'Sign In').click();
    cy.url().should('include', '/c/login');
  });
});

