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
describe('Topic Link Suite', () => {
  const waitForLinkPanel = () => {
    // Wait for link input to be visible and ready for interaction
    cy.get('input[type="url"]').should('be.visible');
  };

  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Add link to topic', () => {
    cy.focusTopicById(3);
    
    cy.onClickToolbarButton('Add Link');

    // Wait for link panel to load
    waitForLinkPanel();

    // Type a URL
    const testUrl = 'https://www.wisemapping.com';
    cy.get('input[type="url"]').first().type(testUrl);

    // Click Accept/Save button
    cy.contains('Accept').should('be.visible').click();

    cy.matchImageSnapshot('link-added-to-topic');
  });

  it('Validate URL format shows error for invalid URL', () => {
    cy.focusTopicById(3);
    
    cy.onClickToolbarButton('Add Link');

    // Wait for link panel to load
    waitForLinkPanel();

    // Type an invalid URL
    const invalidUrl = 'not-a-valid-url';
    cy.get('input[type="url"]').first().type(invalidUrl);

    // Check that error message is shown
    cy.contains('Address is not valid').should('be.visible');

    cy.matchImageSnapshot('link-validation-error');
  });

  it('Accept valid URL and save', () => {
    cy.focusTopicById(3);
    
    cy.onClickToolbarButton('Add Link');

    // Wait for link panel to load
    waitForLinkPanel();

    // Type a valid URL
    const validUrl = 'https://www.example.com';
    cy.get('input[type="url"]').first().clear().type(validUrl);

    // Error message should not be shown for valid URL
    cy.contains('Address is not valid').should('not.exist');

    // Click Accept to save - use button selector instead of text since FormattedMessage might render differently
    cy.get('button').contains('Accept').should('be.visible').click();

    // Wait for panel to close after saving
    cy.get('input[type="url"]').should('not.exist');

    cy.matchImageSnapshot('link-with-valid-url');
  });

  it('Remove link from topic', () => {
    // First add a link
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Link');

    // Wait for link panel to load
    waitForLinkPanel();

    // Add link
    const testUrl = 'https://www.example.com';
    cy.get('input[type="url"]').first().type(testUrl);

    // Save the link
    cy.contains('Accept').should('be.visible').click();

    // Now remove the link by opening the link panel again
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Link');

    // Wait for panel to load
    waitForLinkPanel();

    // Click Delete button to remove the link
    cy.contains('Delete').should('be.visible').click();

    cy.matchImageSnapshot('link-removed-from-topic');
  });

  it('Edit existing link', () => {
    // Add initial link
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Link');

    // Wait for panel to load
    waitForLinkPanel();

    const initialUrl = 'https://www.initial-url.com';
    cy.get('input[type="url"]').first().type(initialUrl);
    cy.contains('Accept').should('be.visible').click();

    // Edit the link
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Link');

    // Wait for panel to load
    waitForLinkPanel();

    // Verify the existing URL is loaded
    cy.get('input[type="url"]').should('have.value', initialUrl);

    // Clear and type new URL
    cy.get('input[type="url"]').first().clear().type('https://www.updated-url.com');
    cy.contains('Accept').should('be.visible').click();

    cy.matchImageSnapshot('link-edited-successfully');
  });

  it('Verify link content is saved and persists', () => {
    cy.focusTopicById(5);
    cy.onClickToolbarButton('Add Link');

    // Wait for panel to load
    waitForLinkPanel();

    const linkUrl = 'https://www.persistent-link.com';
    cy.get('input[type="url"]').first().type(linkUrl);
    
    // Save the link
    cy.contains('Accept').should('be.visible').click();

    // Verify the link persists by opening the link panel again
    cy.focusTopicById(5);
    cy.onClickToolbarButton('Add Link');

    // Wait for panel to load
    waitForLinkPanel();

    // Verify the link URL is still there
    cy.get('input[type="url"]').should('have.value', linkUrl);

    cy.matchImageSnapshot('link-content-persists');
  });

  it('Close link panel without saving', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Link');

    // Wait for link panel to load
    waitForLinkPanel();

    // Type a URL but don't save
    cy.get('input[type="url"]').first().type('https://www.example.com');

    // Press Escape to close the panel without saving
    cy.get('body').type('{esc}');

    // Verify panel is closed by waiting for input to not exist (replaces cy.wait(300))
    cy.get('input[type="url"]').should('not.exist');

    cy.matchImageSnapshot('link-panel-closed-without-saving');
  });

  it('Use keyboard shortcut to open link panel', () => {
    cy.focusTopicById(3);

    // Use Cmd+L (Mac) or Ctrl+L (Windows/Linux) to open link panel
    cy.get('body').type('{ctrl}l');

    // Wait for link panel to appear
    waitForLinkPanel();

    cy.matchImageSnapshot('link-panel-opened-via-keyboard');
  });

  it('shows link tooltip on hover', () => {
    const linkUrl = 'https://tooltip.example.com';

    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Link');
    waitForLinkPanel();

    cy.get('input[type="url"]').first().clear().type(linkUrl);
    cy.contains('Accept').should('be.visible').click();

    cy.get('mindplot-component')
      .shadow()
      .find('image[href*="links.svg"], image[xlink\\:href*="links.svg"]', { timeout: 5000 })
      .first()
      .trigger('mouseenter', { force: true });

    cy.get('mindplot-component')
      .shadow()
      .find('#mindplot-svg-tooltip-content-link', { timeout: 2000 })
      .should('be.visible')
      .and('have.attr', 'href', linkUrl)
      .and('contain.text', linkUrl);

    cy.get('mindplot-component')
      .shadow()
      .find('image[href*="links.svg"], image[xlink\\:href*="links.svg"]')
      .first()
      .trigger('mouseleave', { force: true });
  });
});

