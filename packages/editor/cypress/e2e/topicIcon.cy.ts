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
  const waitForIconPanel = () => {
    // Wait for icon panel to be fully loaded and interactive
    cy.contains('Icon').should('be.visible');
    cy.get('[class*="EmojiPickerReact"], img').should('exist');
  };

  const waitForImageIcons = () => {
    // Wait for image icons to be loaded with valid src attributes
    cy.get('img').should('have.length.gt', 0);
    cy.get('img').first().should('have.attr', 'src').and('not.be.empty');
  };

  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Open panel', () => {
    cy.onClickToolbarButton('Add Icon');
    waitForIconPanel();
    cy.matchImageSnapshot('icons-pannel');
  });

  it('Add new icon', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    cy.get('[aria-label="grinning"]').should('be.visible').click();
    cy.matchImageSnapshot('add-new-icon');
  });

  it('Verify image icons load correctly', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    waitForIconPanel();

    // Verify that images are loaded in the panel
    cy.get('img').should('have.length.gt', 0);
    cy.get('img').first().should('have.attr', 'src').and('not.be.empty');

    // Test that icon functionality works by clicking on an icon
    cy.get('[aria-label="grinning"]').should('be.visible').click();

    cy.matchImageSnapshot('verify-icon-fix-works');
  });

  it('Verify icons panel with "show images" enabled loads PNG/SVG icons correctly', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    waitForIconPanel();

    // Enable image mode (MUI Switch has opacity: 0, so force check)
    cy.get('input[type="checkbox"]').check({ force: true });

    // Wait for image icons to load dynamically
    waitForImageIcons();

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

    cy.matchImageSnapshot('show-images-enabled-works');
  });

  it('Verify no network errors when loading image icons', () => {
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

    waitForIconPanel();

    // Enable image mode (MUI Switch has opacity: 0, so force check)
    cy.get('input[type="checkbox"]').check({ force: true });

    // Wait for all images to load dynamically
    waitForImageIcons();
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'src').and('not.be.empty');
    });

    cy.matchImageSnapshot('no-network-errors-image-icons');
  });

  it('Remove icon from topic', () => {
    // First add an emoji icon
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    cy.get('[aria-label="grinning"]').should('be.visible').click();

    // Now add an image icon to the same topic to replace the emoji
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Switch to image mode
    cy.get('input[type="checkbox"]').should('be.visible').check({ force: true });

    // Wait for image icons to load dynamically
    waitForImageIcons();

    // Add an image icon to replace the emoji
    cy.get('img').first().parent().click({ force: true });

    cy.matchImageSnapshot('icon-replaced-successfully');
  });

  it('Replace emoji with different emoji', () => {
    // Add first emoji
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Icon');

    cy.get('[aria-label="grinning"]').should('be.visible').click({ force: true });

    // Replace with a different emoji
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Icon');

    // Click a different emoji (force in case of backdrop overlay)
    cy.get('[aria-label*="heart"]').first().click({ force: true });

    cy.matchImageSnapshot('emoji-replaced-with-different-emoji');
  });
});
