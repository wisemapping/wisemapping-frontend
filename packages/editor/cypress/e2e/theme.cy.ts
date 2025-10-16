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
describe('Theme Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();

    // Select root node
    cy.focusTopicByText('Mind Mapping');
  });

  it('should open theme dialog and select a theme', () => {
    // Click on the Theme button in toolbar
    cy.onClickToolbarButton('Theme');
    
    // Verify theme dialog is open
    cy.get('[role="dialog"]').should('be.visible');
    
    // Select Light theme (should be first option)
    cy.contains('Light').should('be.visible').click({ force: true });
    
    // Take snapshot
    cy.matchImageSnapshot('select-light-theme');
  });

  it('should select Colorful theme', () => {
    // Click on the Theme button in toolbar
    cy.onClickToolbarButton('Theme');
    
    // Select Colorful theme
    cy.contains('Colorful').should('be.visible').click({ force: true });
    
    // Take snapshot
    cy.matchImageSnapshot('select-colorful-theme');
  });

  it('should select Dark theme', () => {
    // Click on the Theme button in toolbar
    cy.onClickToolbarButton('Theme');
    
    // Select Dark theme
    cy.contains('Dark').should('be.visible').click({ force: true });
    
    // Take snapshot
    cy.matchImageSnapshot('select-dark-theme');
  });

  it('should show theme descriptions when hovering', () => {
    // Click on the Theme button in toolbar
    cy.onClickToolbarButton('Theme');
    
    // Verify theme dialog is open
    cy.get('[role="dialog"]').should('be.visible');
    
    // Hover over a theme to see description
    cy.contains('Colorful').trigger('mouseover');
    
    // Take snapshot
    cy.matchImageSnapshot('theme-descriptions-dialog');
  });

  it('should close theme dialog when clicking outside', () => {
    // Click on the Theme button in toolbar
    cy.onClickToolbarButton('Theme');
    
    // Verify theme dialog is open
    cy.get('[role="dialog"]').should('be.visible');
    
    // Click outside the dialog (on the backdrop)
    cy.get('[role="dialog"]').parent().click(0, 0);
    
    // Verify dialog is closed
    cy.get('[role="dialog"]').should('not.exist');
    
    // Take snapshot
    cy.matchImageSnapshot('theme-dialog-backdrop-close');
  });
});

