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

describe('Maps Page', () => {
  beforeEach(() => {
    cy.visit('/c/maps');
    cy.waitForPageLoaded();
    cy.get('.MuiCard-root').should('have.length', 3);
  });

  it('should match the snapshot', () => {
    cy.matchImageSnapshot('maps');
  });
});

context('iphone-5 resolution', () => {
  beforeEach(() => {
    cy.viewport('iphone-5');
    cy.visit('/c/maps');
    cy.get('.MuiCard-root').should('have.length', 3);
  });

  it('Displays mobile menu button', () => {
    cy.get('#open-main-drawer').should('be.visible');
  });

  it('Displays mobile menu on click', () => {
    cy.get('.MuiDrawer-root').should('not.be.visible');
    cy.get('#open-main-drawer').should('be.visible').click();
    cy.get('.MuiDrawer-root').should('be.visible');
  });

  it('Displays a card list', () => {
    cy.get('.MuiCard-root').should('have.length', 3);
  });

  it('should match the snapshot', () => {
    cy.matchImageSnapshot('maps-iphone-5');
  });
});

context('720p resolution', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/c/maps');
    cy.get('.MuiCard-root').should('have.length', 3);
  });

  it('Displays mobile menu button', () => {
    cy.get('#open-desktop-drawer').should('be.visible');
  });

  it('Displays a table with maps', () => {
    cy.get('.MuiTableBody-root').should('be.visible');
  });

  it('should match the snapshot', () => {
    cy.matchImageSnapshot('maps-720p-resolution');
  });
});
