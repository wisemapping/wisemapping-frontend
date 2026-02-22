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
describe('Topic Icon Suite', () => {
  const waitForEmojiTab = () => {
    // Wait for emoji picker to be visible on the Emojis tab
    cy.contains('Emojis').should('be.visible');
    cy.getEmoji().first().should('be.visible');
  };

  const waitForIconsGalleryTab = () => {
    // Wait for Icons Gallery tab to be visible and images to be loaded
    cy.contains('Icons Gallery').should('be.visible');
    cy.get('img').should('have.length.gt', 0);
    cy.get('img').first().should('have.attr', 'src').and('not.be.empty');
  };

  beforeEach(() => {
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
  });

  it('Open panel with emojis tab', () => {
    cy.onClickToolbarButton('Add Icon');
    waitForEmojiTab();
    cy.matchImageSnapshot('icons-panel-emojis');
  });

  it('Add new emoji icon', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    waitForEmojiTab();
    cy.getEmoji().first().should('be.visible').click();
    cy.matchImageSnapshot('add-new-emoji-icon');
  });

  it('Switch to Icons Gallery tab and verify images load', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Emojis tab should be open by default
    waitForEmojiTab();

    // Switch to Icons Gallery tab
    cy.contains('Icons Gallery').should('be.visible').click();

    // Verify image icons load correctly
    waitForIconsGalleryTab();

    cy.matchImageSnapshot('icons-gallery-tab-loaded');
  });

  it('Add image icon from Icons Gallery tab', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Switch to Icons Gallery tab
    cy.contains('Icons Gallery').should('be.visible').click();

    // Wait for image icons to load dynamically
    waitForIconsGalleryTab();

    // Enhanced validation: Check that ALL images have valid src attributes
    cy.get('img').each(($img) => {
      cy.wrap($img)
        .should('have.attr', 'src')
        .and('not.be.empty')
        .and('not.include', 'undefined')
        .and('not.include', '../assets/');
    });

    // Test clicking on an image icon to verify functionality
    cy.get('img').first().parent().click({ force: true });

    cy.matchImageSnapshot('image-icon-added-from-gallery');
  });

  it('Verify no network errors when loading image icons from Icons Gallery', () => {
    // Monitor network requests for 404 errors
    cy.intercept('**/*.svg', (req) => {
      req.continue((res) => {
        if (res.statusCode === 404) {
          throw new Error(`404 error loading SVG: ${req.url}`);
        }
      });
    }).as('svgRequests');

    cy.intercept('**/*.png', (req) => {
      req.continue((res) => {
        if (res.statusCode === 404) {
          throw new Error(`404 error loading PNG: ${req.url}`);
        }
      });
    }).as('pngRequests');

    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Switch to Icons Gallery tab
    cy.contains('Icons Gallery').should('be.visible').click();

    // Wait for all images to load dynamically
    waitForIconsGalleryTab();
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'src').and('not.be.empty');
    });

    cy.matchImageSnapshot('no-network-errors-icons-gallery');
  });

  it('Replace emoji icon with image icon', () => {
    // First add an emoji icon
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    waitForEmojiTab();
    cy.getEmoji().first().should('be.visible').click();

    // Now add an image icon to the same topic to replace the emoji
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Switch to Icons Gallery tab
    cy.contains('Icons Gallery').should('be.visible').click();

    // Wait for image icons to load dynamically
    waitForIconsGalleryTab();

    // Add an image icon to replace the emoji
    cy.get('img').first().parent().click({ force: true });

    cy.matchImageSnapshot('emoji-replaced-with-image-icon');
  });

  it('Replace emoji with different emoji', () => {
    // Add first emoji
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Icon');

    waitForEmojiTab();
    cy.getEmoji().first().should('be.visible').click({ force: true });

    // Replace with a different emoji
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Icon');

    waitForEmojiTab();
    // Click a different emoji (force in case of backdrop overlay)
    cy.getEmoji().eq(1).click({ force: true });

    cy.matchImageSnapshot('emoji-replaced-with-different-emoji');
  });
});
