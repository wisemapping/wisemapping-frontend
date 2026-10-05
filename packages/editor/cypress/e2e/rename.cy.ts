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
describe('Rename Suite', () => {
  beforeEach(() => {
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();

    // Select root node
    cy.focusTopicByText('Mind Mapping');
  });

  it('should rename the mind map title', () => {
    // Click on the title to enter edit mode
    cy.get('[data-testid="app-bar-title"]').click();
    
    // Clear the existing title and type new title
    cy.get('[data-testid="app-bar-title"] input').clear().type('My New Mind Map Title');
    
    // Press Enter to save
    cy.get('[data-testid="app-bar-title"] input').type('{enter}');
    
    // Wait for the title to update and verify it
    cy.get('[data-testid="app-bar-title"] input').should('have.value', 'My New Mind Map Title');
    
    // Take snapshot
    cy.matchImageSnapshot('rename-mindmap-title');
  });

  it('should cancel rename when pressing Escape', () => {
    // Get the current title first
    cy.get('[data-testid="app-bar-title"] input').then(($input) => {
      const originalTitle = $input.val();
      
      // Click on the title to enter edit mode
      cy.get('[data-testid="app-bar-title"]').click();
      
      // Type new title
      cy.get('[data-testid="app-bar-title"] input').clear().type('This should be cancelled');
      
      // Press Escape to cancel
      cy.get('[data-testid="app-bar-title"] input').type('{esc}');
      
      // Wait for the title to revert and verify it
      cy.get('[data-testid="app-bar-title"] input').should('have.value', originalTitle);
      
      // Take snapshot
      cy.matchImageSnapshot('cancel-rename-mindmap-title');
    });
  });

  it('should show tooltip on title hover', () => {
    // Hover over the title
    cy.get('[data-testid="app-bar-title"]').trigger('mouseover');
    
    // Verify tooltip appears with "Rename" text
    cy.get('[role="tooltip"]').should('contain', 'Rename');
    
    // Take snapshot
    cy.matchImageSnapshot('title-tooltip-hover');
  });
});

