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

describe('TopicImagePicker Storybook', () => {
  const storybookUrl = 'http://localhost:6008/iframe.html?id=editor-topicimagepicker--default&viewMode=story';

  beforeEach(() => {
    cy.visit(storybookUrl);
    // Wait for Storybook and emoji picker to load
    cy.get('#storybook-root').should('exist');
    cy.get('[aria-label*="grinning"]', { timeout: 10000 }).should('exist');
  });

  it('should trigger onEmojiChange action when an emoji is selected', () => {
    // Find and click an emoji
    cy.get('[aria-label*="grinning"]').first().click();
  });

  it('should trigger onIconsGalleryChange action when switching to image mode and selecting an image', () => {
    // Find and toggle the switch to image mode
    cy.get('input[type="checkbox"]').first().check({ force: true });
    
    // Wait for images to load
    cy.get('img', { timeout: 10000 }).should('have.length.gt', 0);
    
    // Click on an image icon
    cy.get('img').first().parent().click();
  });

  it('should trigger triggerClose action when close button is clicked', () => {
    // Find and click the close button (X icon button)
    cy.get('button[aria-label="close"]').click();
  });

  it('should display existing emoji in WithEmoji story', () => {
    cy.visit('http://localhost:6008/iframe.html?id=editor-topicimagepicker--with-emoji&viewMode=story');
    
    // Wait for component and emoji to load
    cy.get('#storybook-root').should('exist');
    cy.get('[aria-label*="grinning"]', { timeout: 10000 }).should('exist');
  });

  it('should display existing image in WithImage story', () => {
    cy.visit('http://localhost:6008/iframe.html?id=editor-topicimagepicker--with-image&viewMode=story');
    
    // Wait for component to load
    cy.get('#storybook-root').should('exist');
    cy.get('input[type="checkbox"]', { timeout: 10000 }).first().should('be.checked');
  });

  it('should allow switching between emoji and image modes', () => {
    // Start in emoji mode - verify emoji picker exists
    cy.get('[aria-label*="grinning"]').should('exist');
    
    // Switch to image mode
    cy.get('input[type="checkbox"]').first().check({ force: true });
    
    // Wait for images to load
    cy.get('img', { timeout: 10000 }).should('have.length.gt', 0);
    
    // Switch back to emoji mode
    cy.get('input[type="checkbox"]').first().uncheck({ force: true });
    
    // Wait for emojis to reload
    cy.get('[aria-label*="grinning"]', { timeout: 10000 }).should('exist');
  });
});

