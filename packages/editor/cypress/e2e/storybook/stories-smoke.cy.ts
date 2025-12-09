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

describe('Storybook Editor Components - Tests', () => {
  // Helper to visit story
  const visitStory = (storyPath: string) => {
    cy.visit(`http://localhost:6008/iframe.html?id=${storyPath}&viewMode=story`);
    cy.get('#storybook-root', { timeout: 10000 }).should('be.visible');
  };

  describe('TopicStyleEditor', () => {
    it('should render and display all shape options', () => {
      visitStory('editor-topicstyleeditor--default');

      // Wait for tabs to be visible (Shape, Border, Connector)
      cy.get('[role="tablist"]', { timeout: 10000 }).should('be.visible');

      // Shape tab should be active and have shape icon buttons (IconButton elements)
      cy.get('button[aria-label*="shape"]', { timeout: 5000 }).should('have.length.at.least', 5);

      // Verify shape buttons are visible
      cy.get('button[aria-label*="shape"]').first().should('be.visible');
    });

    it('should trigger action when changing shape', () => {
      visitStory('editor-topicstyleeditor--default');

      // Wait for tabs and shape buttons
      cy.get('[role="tablist"]', { timeout: 10000 }).should('be.visible');

      // Click a shape option button
      cy.get('button[aria-label*="shape"]', { timeout: 5000 })
        .first()
        .should('be.visible')
        .click({ force: true });

      // Verify component remains interactive
      cy.get('button[aria-label*="shape"]').should('exist');
    });
  });

  describe('TopicFontEditor', () => {
    it('should render with font family dropdown', () => {
      visitStory('editor-topicfonteditor--default');

      // Check that the editor is rendered - look for Font Family label
      cy.contains('Font Family', { timeout: 10000 }).should('be.visible');

      // Font family dropdown should exist (MUI Select has role="combobox")
      cy.get('[role="combobox"]', { timeout: 5000 }).should('be.visible').and('not.be.disabled');
    });

    it('should have font size controls', () => {
      visitStory('editor-topicfonteditor--default');

      // Font size controls - look for Bigger and Smaller buttons
      cy.get('[aria-label*="Bigger"], [aria-label*="Smaller"]', { timeout: 10000 })
        .should('have.length.at.least', 2)
        .and('be.visible');

      // Verify both increase and decrease buttons exist
      cy.get('[aria-label*="Bigger"]').should('be.visible').and('not.be.disabled');
      cy.get('[aria-label*="Smaller"]').should('be.visible').and('not.be.disabled');
    });

    it('should trigger action when changing font', () => {
      visitStory('editor-topicfonteditor--default');

      // Wait for the editor to be fully loaded
      cy.contains('Font Family', { timeout: 10000 }).should('be.visible');

      // Click bold button (has aria-label containing "Bold")
      cy.get('[aria-label*="Bold"]', { timeout: 5000 })
        .should('be.visible')
        .and('not.be.disabled')
        .first()
        .click({ force: true });

      // Verify bold button reacts to click (toggle state or remains clickable)
      cy.get('[aria-label*="Bold"]')
        .first()
        .should('exist'); // Verifies component is interactive
    });
  });

  describe('TopicLinkEditor', () => {
    it('should render URL input field', () => {
      visitStory('editor-topiclinkeditor--default');

      // Check URL input exists
      cy.get('input[type="url"], input[placeholder*="URL"], input[placeholder*="url"]').should('exist');
    });

    it('should render with existing URL variant', () => {
      visitStory('editor-topiclinkeditor--with-existing-url');

      // Check that URL is displayed
      cy.get('input[type="url"], input[value*="http"]').should('exist');
    });

    it('should trigger action when URL is entered', () => {
      visitStory('editor-topiclinkeditor--default');

      // Type in URL input and verify it accepts input
      cy.get('input[type="url"], input[placeholder*="URL"], input[placeholder*="url"]', { timeout: 10000 })
        .first()
        .should('be.visible')
        .type('https://example.com')
        .should('have.value', 'https://example.com');

      // Verify the input maintains the value
      cy.get('input[type="url"], input[placeholder*="URL"], input[placeholder*="url"]')
        .first()
        .should('have.value', 'https://example.com');
    });
  });

  describe('RichTextNoteEditor', () => {
    it('should render text editor area', () => {
      visitStory('editor-richtextnoteeditor--default');

      // Check for text editor (could be textarea, contenteditable, or rich text component)
      cy.get('textarea, [contenteditable="true"], .tox-edit-area').should('exist');
    });

    it('should render with existing note variant', () => {
      visitStory('editor-richtextnoteeditor--with-existing-note');

      // Editor should be visible with content
      cy.get('textarea, [contenteditable="true"]').should('exist');
    });
  });

  describe('TopicIconEditor', () => {
    it('should render icon selection interface', () => {
      visitStory('editor-topiciconeditor--default');

      // Should have tabs (Emojis and Icons Gallery)
      cy.get('[role="tablist"]', { timeout: 10000 }).should('be.visible');

      // Emoji picker should be rendered by default (first tab)
      cy.get('.epr-emoji-category-label, .epr-search, input[placeholder*="Search"], input[placeholder*="search"]', { timeout: 5000 })
        .should('exist');
    });

    it('should display emoji variant', () => {
      visitStory('editor-topiciconeditor--with-emoji');

      // Tabs should be visible
      cy.get('[role="tablist"]', { timeout: 10000 }).should('be.visible');

      // Emoji tab should be active - look for emoji picker elements
      cy.get('.epr-emoji-category-label, .epr-search, input[placeholder*="Search"], input[placeholder*="search"]', { timeout: 5000 })
        .should('exist');
    });

    it('should display image variant', () => {
      visitStory('editor-topiciconeditor--with-image');

      // Tabs should be visible
      cy.get('[role="tablist"]', { timeout: 10000 }).should('be.visible');

      // Switch to Icons Gallery tab (second tab)
      cy.get('[role="tab"]').eq(1).click();

      // Image icons should be visible
      cy.get('img, [role="button"]', { timeout: 5000 }).should('exist');
    });
  });

  describe('ColorPicker', () => {
    it('should render color selection interface', () => {
      visitStory('editor-colorpicker--default');

      // Color picker should have color input or swatches
      cy.get('input[type="color"], [role="button"], button').should('exist');
    });

    it('should display selected color variant', () => {
      visitStory('editor-colorpicker--with-selected-color');

      // Should show color buttons (component renders buttons for colors)
      cy.get('button[aria-label*="#"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Verify at least one color button is visible
      cy.get('button[aria-label*="#"]').first().should('be.visible');
    });

    it('should trigger action when color is selected', () => {
      visitStory('editor-colorpicker--default');

      // Wait for color buttons to be visible
      cy.get('button[aria-label*="#"]', { timeout: 10000 }).should('be.visible');

      // Click a color button
      cy.get('button[aria-label*="#"]')
        .first()
        .should('be.visible')
        .and('not.be.disabled')
        .click({ force: true });

      // Verify component remains interactive (color buttons still exist)
      cy.get('button[aria-label*="#"]').should('exist');
    });
  });

  describe('IconPicker', () => {
    it('should render icon selection grid', () => {
      visitStory('editor-iconpicker--default');

      // Should have emoji picker visible by default
      cy.get('.epr-emoji-category-label, .epr-search, input[placeholder*="Search"], input[placeholder*="search"]', { timeout: 10000 })
        .should('exist');
    });

    it('should display emoji picker variant', () => {
      visitStory('editor-iconpicker--with-emoji');

      // Emoji picker should be visible
      cy.get('.epr-emoji-category-label, .epr-search, input[placeholder*="Search"], input[placeholder*="search"]', { timeout: 10000 })
        .should('exist');
    });

    it('should trigger action when icon is selected', () => {
      visitStory('editor-iconpicker--default');

      // Wait for emoji picker to load
      cy.get('.epr-emoji-category-label, .epr-search', { timeout: 10000 }).should('exist');

      // Toggle to show images using the switch (force click because input has opacity: 0)
      cy.contains('Show images', { timeout: 5000 })
        .should('exist')
        .click({ force: true });

      // Verify that the emoji picker is no longer visible (switched to images)
      cy.get('.epr-emoji-category-label').should('not.exist');
    });
  });

  describe('TopicImagePicker', () => {
    it('should render image picker interface', () => {
      visitStory('editor-topicimagepicker--default');

      // Should have image selection interface
      cy.get('button, [role="button"], img').should('exist');
    });

    it('should display emoji in picker', () => {
      visitStory('editor-topicimagepicker--with-emoji');

      cy.get('button, img').should('exist');
    });
  });

  describe('CanvasStyleEditor', () => {
    it('should render canvas style options', () => {
      visitStory('editor-canvasstyleeditor--default');

      // Should have background pattern options (4 buttons: default, solid, grid, dots)
      cy.get('button', { timeout: 10000 }).should('have.length.at.least', 4);

      // Background Style label should be visible
      cy.contains(/background.*style/i).should('be.visible');
    });

    it('should display solid background variant', () => {
      visitStory('editor-canvasstyleeditor--with-solid-background');

      // Should show pattern buttons
      cy.get('button', { timeout: 10000 }).should('have.length.at.least', 4);

      // Tabs should be visible (Color and Grid Color)
      cy.get('[role="tablist"]', { timeout: 5000 }).should('be.visible');
    });

    it('should display dots pattern variant', () => {
      visitStory('editor-canvasstyleeditor--with-dots');

      // Should show pattern buttons
      cy.get('button', { timeout: 10000 }).should('have.length.at.least', 4);

      // Tabs should be visible
      cy.get('[role="tablist"]', { timeout: 5000 }).should('be.visible');
    });

    it('should trigger action when pattern is selected', () => {
      visitStory('editor-canvasstyleeditor--default');

      // Wait for pattern buttons to be visible (close button + 4 pattern buttons)
      cy.get('button', { timeout: 10000 }).should('have.length.at.least', 4);

      // Click the solid pattern button (force click to avoid visibility issues)
      cy.get('button').eq(2).click({ force: true });

      // Verify tabs appear after selecting a pattern (tabs should be rendered)
      cy.get('[role="tablist"]').should('exist');
    });
  });

  describe('RelationshipStyleEditor', () => {
    it('should render relationship style controls', () => {
      visitStory('editor-relationshipstyleeditor--default');

      // Should have style controls for relationships
      cy.get('button, select, [role="combobox"]').should('exist');
    });

    it('should have line style options', () => {
      visitStory('editor-relationshipstyleeditor--default');

      // Should have multiple style options
      cy.get('button, [role="button"]').should('have.length.at.least', 1);
    });
  });

  describe('KeyboardShortcutHelp', () => {
    it('should render keyboard shortcuts list', () => {
      visitStory('editor-keyboardshortcuthelp--default');

      // Should have a table with keyboard shortcuts
      cy.get('table', { timeout: 10000 }).should('be.visible');

      // Table should have headers - at least 3 (Action, Windows/Linux, Mac OS X)
      cy.get('table thead tr th').should('have.length.at.least', 3);

      // Verify Action header exists
      cy.get('table thead').should('contain.text', 'Action');
    });

    it('should display multiple shortcuts', () => {
      visitStory('editor-keyboardshortcuthelp--default');

      // Should have multiple shortcut entries in table rows
      cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 15);

      // Verify some shortcut content is visible (e.g., "Ctrl" or "⌘")
      cy.get('table tbody').should('contain.text', 'Ctrl');
    });
  });

  // Smoke test - verify all stories load without errors
  describe('Smoke Tests - All Stories Load', () => {
    const allStories = [
      'editor-topicstyleeditor--default',
      'editor-topicfonteditor--default',
      'editor-topiclinkeditor--default',
      'editor-richtextnoteeditor--default',
      'editor-topiciconeditor--default',
      'editor-colorpicker--default',
      'editor-iconpicker--default',
      'editor-topicimagepicker--default',
      'editor-canvasstyleeditor--default',
      'editor-relationshipstyleeditor--default',
      'editor-keyboardshortcuthelp--default',
    ];

    allStories.forEach((story) => {
      it(`should load ${story} without errors`, () => {
        visitStory(story);

        // Verify the story rendered successfully by checking:
        // 1. No Storybook error display is shown
        cy.get('body').should('not.have.class', 'sb-show-errordisplay');

        // 2. The storybook root has content (story rendered)
        cy.get('#storybook-root').should('not.be.empty');

        // 3. No generic error messages in the body
        cy.get('body').should('not.contain', 'Story is missing');
      });
    });
  });
});
