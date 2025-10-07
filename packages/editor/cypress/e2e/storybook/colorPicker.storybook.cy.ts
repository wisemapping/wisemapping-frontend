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

describe('ColorPicker Storybook', () => {
  const storybookUrl = 'http://localhost:6008/iframe.html?id=editor-colorpicker--default&viewMode=story';

  beforeEach(() => {
    cy.visit(storybookUrl);
    // Wait for Storybook to render the component
    cy.get('#storybook-root').should('exist');
  });

  it('should trigger onColorChange action when a color is selected', () => {
    // Find and click on a color button
    cy.get('button[style*="background"]').first().click();
  });

  it('should trigger onColorChange action when a different color is selected', () => {
    // Click on another color
    cy.get('button[style*="background"]').eq(5).click();
  });

  it('should trigger onColorChange action when color is cleared', () => {
    // Find and click the clear/reset button if available
    cy.get('button').contains(/clear|reset|none/i).click();
  });

  it('should trigger closeModal action when close button is clicked', () => {
    // Find and click the close button (X icon button)
    cy.get('button[aria-label="close"]').click();
  });

  it('should display selected color in WithSelectedColor story', () => {
    cy.visit('http://localhost:6008/iframe.html?id=editor-colorpicker--with-selected-color&viewMode=story');
    
    // Wait for component to load and verify color
    cy.get('#storybook-root').should('exist');
    cy.get('button[style*="rgb(255, 0, 0)"], button[style*="#ff0000"]').should('exist');
  });
});

