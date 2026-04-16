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

describe('Maps Page – Create Map', () => {
  beforeEach(() => {
    cy.visit('/c/maps');
    cy.waitForPageLoaded();
    cy.get('.MuiCard-root').should('have.length', 10);
  });

  it('"New map" button opens the create dialog', () => {
    cy.get('[data-testid="create"]').click();
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('submitting the create dialog navigates to the editor', () => {
    cy.get('[data-testid="create"]').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('input[name="title"]').type('My Test Map');
    cy.get('[role="dialog"]').contains('button', 'Create').click();
    cy.url().should('match', /\/c\/maps\/\d+\/edit/);
  });
});
