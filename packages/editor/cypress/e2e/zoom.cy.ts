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
describe('Zoom Suite', () => {
  beforeEach(() => {
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
  });

  it('should display zoom controls', () => {
    // Verify zoom controls are visible
    cy.get('[aria-label="Zoom In"]').should('be.visible');
    cy.get('[aria-label="Zoom Out"]').should('be.visible');
    cy.get('[aria-label="Zoom to Fit"]').should('be.visible');
    
    // Verify zoom percentage is displayed
    cy.contains(/\d+%/).should('be.visible');
    
    cy.matchImageSnapshot('zoom-controls-visible');
  });

  it('should zoom in when clicking zoom in button', () => {
    // Get initial zoom percentage
    cy.contains(/\d+%/).invoke('text').then((initialZoom) => {
      const initialValue = parseInt(initialZoom);

      // Click zoom in button
      cy.get('[aria-label="Zoom In"]').first().click();

      // Verify zoom percentage increased
      cy.contains(/\d+%/).should(($el) => {
        // @ts-expect-error - Cypress guarantees $el is defined in .should() callback
        const newValue = parseInt($el.text());
        expect(newValue).to.be.greaterThan(initialValue);
      });

      // Verify the map content is still visible
      cy.contains('Mind Mapping').should('be.visible');
    });
    
    cy.matchImageSnapshot('zoom-in-applied');
  });

  it('should zoom out when clicking zoom out button', () => {
    // Get initial zoom percentage
    cy.contains(/\d+%/).invoke('text').then((initialZoom) => {
      const initialValue = parseInt(initialZoom);

      // Click zoom out button
      cy.get('[aria-label="Zoom Out"]').first().click();

      // Verify zoom percentage decreased
      cy.contains(/\d+%/).should(($el) => {
        // @ts-expect-error - Cypress guarantees $el is defined in .should() callback
        const newValue = parseInt($el.text());
        expect(newValue).to.be.lessThan(initialValue);
      });

      // Verify the map content is still visible
      cy.contains('Mind Mapping').should('be.visible');
    });
    
    cy.matchImageSnapshot('zoom-out-applied');
  });

  it('should center map when clicking zoom to fit button', () => {
    // First zoom in to change from default
    cy.get('[aria-label="Zoom In"]').first().click();

    // Get zoom level after zooming in
    cy.contains(/\d+%/).invoke('text').then((zoomedLevel) => {
      const zoomedValue = parseInt(zoomedLevel);

      // Click zoom to fit button
      cy.get('[aria-label="Zoom to Fit"]').first().click();

      // Verify zoom percentage changed
      cy.contains(/\d+%/).should(($el) => {
        // @ts-expect-error - Cypress guarantees $el is defined in .should() callback
        const newValue = parseInt($el.text());
        expect(newValue).to.not.equal(zoomedValue);
      });

      // Verify the map content is still visible
      cy.contains('Mind Mapping').should('be.visible');
    });
    
    cy.matchImageSnapshot('zoom-to-fit-applied');
  });
});
