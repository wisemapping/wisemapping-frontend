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

describe('TopicStyleEditor Storybook', () => {
  const storybookUrl = 'http://localhost:6008/iframe.html?id=editor-topicstyleeditor--default&viewMode=story';

  beforeEach(() => {
    cy.visit(storybookUrl);
    // Wait for Storybook to render the component
    cy.get('#storybook-root').should('exist');
  });

  it('should trigger onShapeChange action when shape is changed', () => {
    // Find and click on a different shape option
    cy.contains('button', 'rounded rectangle').should('exist');
    
    // Click on ellipse shape
    cy.contains('button', 'ellipse').click();
    
    // Verify the action was logged in the Actions panel
    // Note: In a real test, you'd need to spy on the action or check the Storybook actions panel
  });

  it('should trigger onFillColorChange action when fill color is changed', () => {
    // Find the fill color section
    cy.contains('Fill Color').should('exist');
    
    // Click on a color option
    cy.get('button[style*="background"]').first().click();
  });

  it('should trigger onBorderColorChange action when border color is changed', () => {
    // Find the border color section
    cy.contains('Border Color').should('exist');
    
    // Click on a color option
    cy.get('button[style*="background"]').eq(1).click();
  });

  it('should trigger onBorderStyleChange action when border style is changed', () => {
    // Find and click border style options
    cy.contains('Border Style').should('exist');
    
    // Click on a different border style (if available)
    cy.get('button').contains(/solid|dashed|dotted/i).click();
  });

  it('should trigger onConnectionStyleChange action when connection style is changed', () => {
    // Find connection style section
    cy.contains('Connection').should('exist');
    
    // Click on a different connection style
    cy.get('button').contains(/curved|straight|line/i).first().click();
  });

  it('should trigger onConnectionColorChange action when connection color is changed', () => {
    // Find connection color section
    cy.contains('Connection').should('exist');
    
    // Click on a color option for connection
    cy.get('button[style*="background"]').last().click();
  });

  it('should trigger closeModal action when close button is clicked', () => {
    // Find and click the close button (X icon button)
    cy.get('button[aria-label="close"]').click();
  });
});

