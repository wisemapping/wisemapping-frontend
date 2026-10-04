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
describe('Image Emoji Suite', () => {


  beforeEach(() => {
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
  });

  it('Add image icon to topic', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Topic Image');

    // Icons Gallery tab should be open by default
    cy.waitForIconsGalleryTab();

    // Click on the first image icon to add it
    cy.get('img').first().parent().click({ force: true });

    cy.matchImageSnapshot('image-icon-added');
  });

  it('Replace image icon with another image icon', () => {
    // First add an image icon
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Topic Image');

    // Icons Gallery tab should be open by default
    cy.waitForIconsGalleryTab();

    // Add the first image icon
    cy.get('img').first().parent().click({ force: true });

    // Now replace it with a different image icon
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Topic Image');

    // Icons Gallery tab should still be open by default
    cy.waitForIconsGalleryTab();

    // Click on a different image (second one) to replace the first
    cy.get('img').should('have.length.gt', 0).then(($imgs) => {
      if ($imgs.length >= 2) {
        cy.get('img').eq(1).parent().click({ force: true });
      } else {
        cy.get('img').eq(0).parent().click({ force: true });
      }
    });

    cy.matchImageSnapshot('image-icon-replaced');
  });

  it('Switch between Icons Gallery and Emojis tabs', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Topic Image');

    // Icons Gallery tab should be open by default
    cy.waitForIconsGalleryTab();

    // Switch to Emojis tab
    cy.contains('Emojis').should('be.visible').click();

    // Verify emoji picker is now visible
    cy.getEmoji().first().should('be.visible');

    // Switch back to Icons Gallery tab
    cy.contains('Icons Gallery').should('be.visible').click();

    // Verify image icons are visible again
    cy.get('img').should('have.length.gt', 0);

    cy.matchImageSnapshot('tabs-switching-works');
  });

  it('Add emoji vs image icon have different representations', () => {
    // Add a regular emoji first
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Topic Image');

    // Switch to Emojis tab
    cy.contains('Emojis').should('be.visible').click();

    // Click on a regular emoji
    cy.getEmoji().first().should('be.visible').click();

    // Now add an image icon to another topic
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Topic Image');

    // Icons Gallery tab should be open by default
    cy.waitForIconsGalleryTab();

    // Add an image icon
    cy.get('img').first().parent().click({ force: true });

    cy.matchImageSnapshot('emoji-and-image-icon-comparison');
  });

  it('Verify image icon renders correctly in topic', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Topic Image');

    // Icons Gallery tab should be open by default
    cy.waitForIconsGalleryTab();

    // Click on a specific image icon to add it
    cy.get('img').first().parent().click({ force: true });

    // Verify the topic is visible
    cy.get('[test-id="3"]').should('be.visible');

    // Look for any image-related elements that might have been added to the topic
    cy.get('svg image, img').should('have.length.gt', 0);

    cy.matchImageSnapshot('image-icon-renders-in-topic');
  });
});