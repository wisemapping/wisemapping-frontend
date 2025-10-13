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
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Add image emoji to topic', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Image');

    // Wait for icon panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Switch to image mode by clicking the "Icons Gallery" tab
    cy.contains('Icons Gallery').click();

    // Wait for image icons to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify that image icons are displayed
    cy.get('img').should('have.length.gt', 0);

    // Click on the first image icon to add it
    cy.get('img').first().parent().click({ force: true });

    // Take a snapshot to verify the image emoji was added
    cy.matchImageSnapshot('image-emoji-added');
  });

  it('Replace image emoji with another image emoji', () => {
    // First add an image emoji
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Image');

    // Wait for icon panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Switch to image mode by clicking the "Icons Gallery" tab
    cy.contains('Icons Gallery').click();

    // Wait for image icons to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Add the first image icon
    cy.get('img').first().parent().click({ force: true });

    // Wait a bit for the icon to be applied
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Now replace it with a different image emoji
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Image');

    // Wait for panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Switch to image mode again
    cy.get('input[type="checkbox"]').check({ force: true });

    // Wait for image icons to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Click on a different image (second one) to replace the first
    // First ensure we have at least 2 images loaded, if not, use the first image again
    cy.get('img').should('have.length.gt', 0).then(($imgs) => {
      if ($imgs.length >= 2) {
        cy.get('img').eq(1).parent().click({ force: true });
      } else {
        cy.get('img').eq(0).parent().click({ force: true });
      }
    });

    // Take a snapshot to verify the image emoji was replaced
    cy.matchImageSnapshot('image-emoji-replaced');
  });

  it('Switch between emoji and image modes', () => {
    // Updated to work with tab-based interface
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Image');

    // Wait for icon panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Initially in emoji mode - verify emoji elements are present
    cy.get('[aria-label="grinning"]').should('be.visible');

    // Switch to image mode by clicking the "Icons Gallery" tab
    cy.contains('Icons Gallery').click();

    // Wait for switch
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify image icons are now visible and emoji picker is not
    cy.get('img').should('have.length.gt', 0);
    // Check that the emoji picker is no longer visible after switching to Icons Gallery
    cy.get('.EmojiPickerReact').should('not.be.visible');

    // Switch back to emoji mode by clicking the "Emojis" tab
    cy.contains('Emojis').click();

    // Wait for switch
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify emoji picker is back
    cy.get('[aria-label="grinning"]').should('be.visible');
    
    // Close the panel by pressing escape
    cy.get('body').type('{esc}');
    
    // Take a snapshot of the final state
    cy.matchImageSnapshot('emoji-mode-active');
  });

  it('Add emoji vs image emoji have different values', () => {
    // Add a regular emoji first
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Image');

    // Wait for panel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Click on a regular emoji (should be in emoji mode by default)
    cy.get('[aria-label="grinning"]').click();

    // Now add an image emoji to another topic
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Image');

    // Wait for panel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Switch to image mode by clicking the "Icons Gallery" tab
    cy.contains('Icons Gallery').click();

    // Wait for images to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Add an image icon
    cy.get('img').first().parent().click({ force: true });

    // Take a snapshot showing both types of icons
    cy.matchImageSnapshot('emoji-and-image-emoji-comparison');
  });

  it('Verify image emoji renders correctly in topic', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Image');

    // Wait for panel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Switch to image mode by clicking the "Icons Gallery" tab
    cy.contains('Icons Gallery').click();

    // Wait for images
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Click on a specific image icon to add it
    cy.get('img').first().parent().click({ force: true });

    // Wait for the icon to be applied to the topic
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify the topic now has some visual change - check for SVG or image elements
    cy.get('[test-id="3"]').should('be.visible');
    
    // Look for any image-related elements that might have been added
    cy.get('svg image, img').should('have.length.gt', 0);

    // Take a snapshot to verify proper rendering
    cy.matchImageSnapshot('image-emoji-renders-in-topic');
  });
});