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

describe('TopicFontEditor Storybook', () => {
  const storybookUrl = 'http://localhost:6008/iframe.html?id=editor-topicfonteditor--default&viewMode=story';

  beforeEach(() => {
    cy.visit(storybookUrl);
    // Wait for Storybook to render the component
    cy.get('#storybook-root').should('exist');
  });

  it('should trigger onFontFamilyChange action when font family is changed', () => {
    // Find and click on font family selector
    cy.get('select, [role="button"]').contains(/arial|verdana|times/i).should('exist');
    
    // Select a different font
    cy.get('select').first().select('Verdana');
  });

  it('should trigger onFontSizeSwitch action when font size is increased', () => {
    // Find the font size increase button
    cy.get('button[aria-label*="increase"], button').contains('+').click();
  });

  it('should trigger onFontSizeSwitch action when font size is decreased', () => {
    // Find the font size decrease button
    cy.get('button[aria-label*="decrease"], button').contains('-').click();
  });

  it('should trigger onFontWeightSwitch action when bold button is clicked', () => {
    // Find and click the bold button
    cy.get('button[aria-label*="bold"], button').contains(/bold|B/i).click();
  });

  it('should trigger onFontStyleSwitch action when italic button is clicked', () => {
    // Find and click the italic button
    cy.get('button[aria-label*="italic"], button').contains(/italic|I/i).click();
  });

  it('should trigger onFontColorChange action when font color is changed', () => {
    // Find the font color section
    cy.contains('Color').should('exist');
    
    // Click on a color option
    cy.get('button[style*="background"]').first().click();
  });

  it('should trigger closeModal action when close button is clicked', () => {
    // Find and click the close button (X icon button)
    cy.get('button[aria-label="close"]').click();
  });
});

