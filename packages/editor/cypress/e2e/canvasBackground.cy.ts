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
describe('Canvas Background Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();

    // Select root node
    cy.focusTopicByText('Mind Mapping');
  });

  it('Default background pattern hides color pickers', () => {
    // Click on the Theme button in toolbar
    cy.onClickToolbarButton('Theme');
    
    // Wait for the Canvas Style section
    cy.contains('Canvas Style').should('be.visible');
    
    // Click the Default background style option
    cy.get('[aria-label*="Default"]').should('be.visible').first().click({ force: true });
    
    // Color and Grid Color tabs should not be visible when Default is selected
    cy.contains('Color').should('not.exist');
    cy.contains('Grid Color').should('not.exist');
    
    // Take snapshot
    cy.matchImageSnapshot('default-background-no-tabs');
  });

  it('Grid background pattern shows color pickers', () => {
    // Click on the Theme button in toolbar
    cy.onClickToolbarButton('Theme');
    
    // Wait for the Canvas Style section
    cy.contains('Canvas Style').should('be.visible');
    
    // Click the Grid background style option
    cy.get('[aria-label*="Grid"]').should('be.visible').first().click({ force: true });
    
    // Color and Grid Color tabs should be visible when Grid is selected
    cy.contains('Color').should('be.visible');
    cy.contains('Grid Color').should('be.visible');
    
    // Take snapshot
    cy.matchImageSnapshot('grid-background-with-tabs');
  });

  it('Dots background pattern shows color pickers', () => {
    // Click on the Theme button in toolbar
    cy.onClickToolbarButton('Theme');
    
    // Wait for the Canvas Style section
    cy.contains('Canvas Style').should('be.visible');
    
    // Click the Dots background style option
    cy.get('[aria-label*="Dots"]').should('be.visible').first().click({ force: true });
    
    // Color and Grid Color tabs should be visible when Dots is selected
    cy.contains('Color').should('be.visible');
    cy.contains('Grid Color').should('be.visible');
    
    // Take snapshot
    cy.matchImageSnapshot('dots-background-with-tabs');
  });
});

