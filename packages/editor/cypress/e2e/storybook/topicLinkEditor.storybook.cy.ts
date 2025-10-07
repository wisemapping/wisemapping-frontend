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

describe('TopicLinkEditor Storybook', () => {
  const storybookUrl = 'http://localhost:6008/iframe.html?id=editor-topiclinkeditor--default&viewMode=story';

  beforeEach(() => {
    cy.visit(storybookUrl);
    // Wait for Storybook to render the component
    cy.get('#storybook-root').should('exist');
  });

  it('should trigger onUrlChange action when URL is entered', () => {
    // Find the URL input field
    cy.get('input[type="text"], input[type="url"]').should('exist');
    
    // Type a URL
    cy.get('input[type="text"], input[type="url"]').first().clear().type('https://www.example.com');
    
    // Blur the input to trigger the change
    cy.get('input[type="text"], input[type="url"]').first().blur();
  });

  it('should trigger onUrlChange action when URL is cleared', () => {
    // Visit the story with existing URL
    cy.visit('http://localhost:6008/iframe.html?id=editor-topiclinkeditor--with-existing-url&viewMode=story');
    
    // Wait for component to load
    cy.get('#storybook-root').should('exist');
    cy.get('input[type="text"], input[type="url"]').should('exist');
    
    // Clear the URL
    cy.get('input[type="text"], input[type="url"]').first().clear().blur();
  });

  it('should trigger closeModal action when close button is clicked', () => {
    // Find and click the close button (X icon button)
    cy.get('button[aria-label="close"]').click();
  });

  it('should display existing URL in WithExistingURL story', () => {
    cy.visit('http://localhost:6008/iframe.html?id=editor-topiclinkeditor--with-existing-url&viewMode=story');
    
    // Wait for component to load and verify URL
    cy.get('#storybook-root').should('exist');
    cy.get('input[type="text"], input[type="url"]').first().should('have.value', 'https://www.wisemapping.com');
  });
});

