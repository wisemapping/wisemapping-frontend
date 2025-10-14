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
describe.skip('Image Emoji Suite - DISABLED: UI has changed, needs test updates', () => {
  const waitForIconGallery = () => {
    cy.contains('Icons Gallery').should('be.visible');
    cy.get('img').should('have.length.gt', 0).first().should('have.attr', 'src').and('not.be.empty');
  };

  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Add image emoji to topic', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Image');

    // Switch to image mode
    cy.contains('Icons Gallery').should('be.visible').click();

    // Wait for image icons to load dynamically
    waitForIconGallery();

    // Click on the first image icon to add it
    cy.get('img').first().parent().click({ force: true });

    cy.matchImageSnapshot('image-emoji-added');
  });

  it('Replace image emoji with another image emoji', () => {
    // First add an image emoji
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Image');

    // Switch to image mode
    cy.contains('Icons Gallery').should('be.visible').click();

    // Wait for image icons to load dynamically
    waitForIconGallery();

    // Add the first image icon
    cy.get('img').first().parent().click({ force: true });

    // Now replace it with a different image emoji
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Image');

    // Switch to image mode again
    cy.get('input[type="checkbox"]').should('be.visible').check({ force: true });

    // Wait for image icons to load dynamically
    waitForIconGallery();

    // Click on a different image (second one) to replace the first
    cy.get('img').should('have.length.gt', 0).then(($imgs) => {
      if ($imgs.length >= 2) {
        cy.get('img').eq(1).parent().click({ force: true });
      } else {
        cy.get('img').eq(0).parent().click({ force: true });
      }
    });

    cy.matchImageSnapshot('image-emoji-replaced');
  });

  it('Switch between emoji and image modes', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Image');

    // Initially in emoji mode - verify emoji elements are present
    cy.get('[aria-label="grinning"]').should('be.visible');

    // Switch to image mode
    cy.contains('Icons Gallery').should('be.visible').click();

    // Verify image icons are now visible and emoji picker is not
    waitForIconGallery();
    cy.get('.EmojiPickerReact').should('not.be.visible');

    // Switch back to emoji mode
    cy.contains('Emojis').should('be.visible').click();

    // Verify emoji picker is back
    cy.get('[aria-label="grinning"]').should('be.visible');
    
    // Close the panel
    cy.get('body').type('{esc}');
    
    cy.matchImageSnapshot('emoji-mode-active');
  });

  it('Add emoji vs image emoji have different values', () => {
    // Add a regular emoji first
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Image');

    // Click on a regular emoji
    cy.get('[aria-label="grinning"]').should('be.visible').click();

    // Now add an image emoji to another topic
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Image');

    // Switch to image mode
    cy.contains('Icons Gallery').should('be.visible').click();

    // Wait for images to load dynamically
    waitForIconGallery();

    // Add an image icon
    cy.get('img').first().parent().click({ force: true });

    cy.matchImageSnapshot('emoji-and-image-emoji-comparison');
  });

  it('Verify image emoji renders correctly in topic', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Image');

    // Switch to image mode
    cy.contains('Icons Gallery').should('be.visible').click();

    // Wait for images to load dynamically
    waitForIconGallery();

    // Click on a specific image icon to add it
    cy.get('img').first().parent().click({ force: true });

    // Verify the topic is visible
    cy.get('[test-id="3"]').should('be.visible');
    
    // Look for any image-related elements that might have been added
    cy.get('svg image, img').should('have.length.gt', 0);

    cy.matchImageSnapshot('image-emoji-renders-in-topic');
  });
});