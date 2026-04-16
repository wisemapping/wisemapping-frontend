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

describe('Maps Page – Export Dialog', () => {
  const getMapRow = (title: string) => cy.contains('tbody tr a', new RegExp(`^${title}$`)).closest('tr');

  beforeEach(() => {
    cy.visit('/c/maps');
    cy.waitForPageLoaded();
    cy.get('tbody tr').should('have.length', 10);
    // Search to bring "El Mapa" into the visible card list
    cy.get('input[aria-label="search"]').type('El Mapa');
    getMapRow('El Mapa').should('be.visible');
  });

  it('opens the export dialog from the card action menu', () => {
    getMapRow('El Mapa').find('[aria-label="Others"]').click();
    cy.contains('li', 'Export').click();
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('export dialog contains document format options', () => {
    getMapRow('El Mapa').find('[aria-label="Others"]').click();
    cy.contains('li', 'Export').click();
    cy.get('[role="dialog"]').contains('Document').should('be.visible');
  });
});
