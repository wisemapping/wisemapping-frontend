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

    // Select root node to enable toolbar buttons
    cy.focusTopicByText('Mind Mapping');
  });

  it('Default background pattern hides color pickers', () => {
    // Click on the Background button in toolbar
    cy.get('button[aria-label*="Background"]').should('be.visible').click({ force: true });
    
    // Wait for the Background Style section
    cy.contains('Background Style').should('be.visible');
    
    // First select Grid to ensure tabs are visible
    cy.get('button').find('svg[data-testid="GridOnIcon"]').parent().click({ force: true });
    
    // Verify tabs appeared (specifically the Tab components)
    cy.get('[role="tab"]').contains('Color').should('be.visible');
    
    // Close the dialog
    cy.get('button[aria-label*="Background"]').click({ force: true });
    
    // Reopen the dialog
    cy.get('button[aria-label*="Background"]').should('be.visible').click({ force: true });
    
    // Now click Default to hide them
    cy.get('button').find('svg[data-testid="NotInterestedOutlinedIcon"]').parent().click({ force: true });
    
    // Tabs should not be visible when Default is selected
    cy.get('[role="tab"]').should('not.exist');
    
    // Take snapshot
    cy.matchImageSnapshot('default-background-no-tabs');
  });

  it('Grid background pattern shows color pickers', () => {
    // Click on the Background button in toolbar
    cy.get('button[aria-label*="Background"]').should('be.visible').click({ force: true });
    
    // Wait for the Background Style section
    cy.contains('Background Style').should('be.visible');
    
    // Click the Grid background style option (GridOnIcon, third button)
    cy.get('button').find('svg[data-testid="GridOnIcon"]').parent().click({ force: true });
    
    // Color and Grid Color tabs should be visible when Grid is selected
    cy.contains('Color').should('be.visible');
    cy.contains('Grid Color').should('be.visible');
    
    // Take snapshot
    cy.matchImageSnapshot('grid-background-with-tabs');
  });

  it('Dots background pattern shows color pickers', () => {
    // Click on the Background button in toolbar
    cy.get('button[aria-label*="Background"]').should('be.visible').click({ force: true });
    
    // Wait for the Background Style section
    cy.contains('Background Style').should('be.visible');
    
    // Click the Dots background style option (FiberManualRecordIcon, fourth button)
    cy.get('button').find('svg[data-testid="FiberManualRecordIcon"]').parent().click({ force: true });
    
    // Color and Grid Color tabs should be visible when Dots is selected
    cy.contains('Color').should('be.visible');
    cy.contains('Grid Color').should('be.visible');
    
    // Take snapshot
    cy.matchImageSnapshot('dots-background-with-tabs');
  });
});

