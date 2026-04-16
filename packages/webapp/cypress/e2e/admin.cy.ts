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

describe('Admin Console', () => {
  it('redirects /c/admin to the accounts page', () => {
    cy.visit('/c/admin');
    cy.waitForPageLoaded();
    cy.url().should('include', '/c/admin/accounts');
  });
});

describe('Admin Accounts Page', () => {
  beforeEach(() => {
    cy.visit('/c/admin/accounts');
    cy.waitForPageLoaded();
    // Wait for the accounts table to be populated
    cy.get('.MuiTableBody-root', { timeout: 10000 }).should('be.visible');
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('admin-accounts-page');
  });

  it('displays the accounts table with user data', () => {
    cy.get('.MuiTableBody-root .MuiTableRow-root').should('have.length.at.least', 1);
  });
});

describe('Admin Maps Page', () => {
  beforeEach(() => {
    cy.visit('/c/admin/maps');
    cy.waitForPageLoaded();
    // Wait for the maps table to be populated
    cy.get('.MuiTableBody-root', { timeout: 10000 }).should('be.visible');
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('admin-maps-page');
  });

  it('displays the maps table', () => {
    cy.get('.MuiTableBody-root .MuiTableRow-root').should('have.length.at.least', 1);
  });
});

describe('Admin System Page', () => {
  beforeEach(() => {
    cy.visit('/c/admin/system');
    cy.waitForPageLoaded();
    // Wait for system info cards to render
    cy.get('.MuiCard-root', { timeout: 10000 }).should('be.visible');
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('admin-system-page');
  });
});
