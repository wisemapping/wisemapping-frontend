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

describe('Maps Page – Search', () => {
  beforeEach(() => {
    cy.visit('/c/maps');
    cy.waitForPageLoaded();
    cy.get('tbody tr').should('have.length', 10);
  });

  it('filters map cards by search term', () => {
    cy.get('input[aria-label="search"]').type('El Mapa');
    cy.get('tbody tr').should('have.length.at.least', 1);
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).contains(/El Mapa/i);
    });
  });

  it('shows no cards when search term matches nothing', () => {
    cy.get('input[aria-label="search"]').type('xyzzy-no-match-123');
    cy.contains('tbody tr', 'No matching mindmap found with the current filter criteria.').should(
      'be.visible',
    );
  });

  it('restores full list after clearing the search', () => {
    cy.get('input[aria-label="search"]').type('El Mapa').clear();
    cy.get('tbody tr').should('have.length', 10);
  });
});
