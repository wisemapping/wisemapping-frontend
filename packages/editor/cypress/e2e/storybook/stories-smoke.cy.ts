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
      
      // Check that the editor is rendered
      cy.contains('Topic Style').should('be.visible');
      
      // Check shape selector exists
      cy.get('[data-testid="shape-selector"]', { timeout: 5000 }).should('exist');
    });

    it('should trigger action when changing shape', () => {
      visitStory('editor-topicstyleeditor--default');
      
      // Open Actions panel
      cy.get('[role="tablist"]').contains('Actions', { timeout: 5000 }).click();
      
      // Interact with shape selector
      cy.get('button, [role="button"]').first().click();
      
      // Verify action was logged
      cy.get('[class*="action"]', { timeout: 5000 }).should('exist');
    });
  });

  describe('TopicFontEditor', () => {
    it('should render with font family dropdown', () => {
      visitStory('editor-topicfonteditor--default');
      
      // Check that the editor is rendered
      cy.contains('Text').should('be.visible');
      
      // Font family dropdown should exist
      cy.get('select, [role="combobox"]').should('exist');
    });

    it('should have font size controls', () => {
      visitStory('editor-topicfonteditor--default');
      
      // Font size controls (increase/decrease buttons)
      cy.get('button[aria-label*="increase"], button[aria-label*="size"]').should('exist');
    });

    it('should trigger action when changing font', () => {
      visitStory('editor-topicfonteditor--default');
      
      // Open Actions panel
      cy.get('[role="tablist"]').contains('Actions', { timeout: 5000 }).click();
      
      // Click font weight or style button
      cy.get('button').contains(/bold|italic/i).first().click({ force: true });
      
      // Verify action was logged
      cy.get('[class*="action"]', { timeout: 5000 }).should('exist');
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
      
      // Open Actions panel
      cy.get('[role="tablist"]').contains('Actions', { timeout: 5000 }).click();
      
      // Type in URL input
      cy.get('input[type="url"], input[placeholder*="URL"], input[placeholder*="url"]').first().type('https://example.com{enter}');
      
      // Verify action was logged
      cy.get('[class*="action"]', { timeout: 5000 }).should('exist');
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
      
      // Should have icon selection area
      cy.get('button, [role="button"]').should('exist');
    });

    it('should display emoji variant', () => {
      visitStory('editor-topiciconeditor--with-emoji');
      
      // Emoji picker should be visible
      cy.get('[data-testid*="emoji"], .emoji, button').should('exist');
    });

    it('should display image variant', () => {
      visitStory('editor-topiciconeditor--with-image');
      
      // Image selection should be visible
      cy.get('img, [data-testid*="image"]').should('exist');
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
      
      // Should show a selected color
      cy.get('input[type="color"], [style*="background"]').should('exist');
    });

    it('should trigger action when color is selected', () => {
      visitStory('editor-colorpicker--default');
      
      // Open Actions panel
      cy.get('[role="tablist"]').contains('Actions', { timeout: 5000 }).click();
      
      // Click a color swatch or button
      cy.get('button, [role="button"]').first().click({ force: true });
      
      // Verify action was logged
      cy.get('[class*="action"]', { timeout: 5000 }).should('exist');
    });
  });

  describe('IconPicker', () => {
    it('should render icon selection grid', () => {
      visitStory('editor-iconpicker--default');
      
      // Should have multiple icon options
      cy.get('button, [role="button"]').should('have.length.at.least', 1);
    });

    it('should display emoji picker variant', () => {
      visitStory('editor-iconpicker--with-emoji');
      
      // Emoji options should be visible
      cy.get('[data-testid*="emoji"], button').should('exist');
    });

    it('should trigger action when icon is selected', () => {
      visitStory('editor-iconpicker--default');
      
      // Open Actions panel
      cy.get('[role="tablist"]').contains('Actions', { timeout: 5000 }).click();
      
      // Click an icon
      cy.get('button, [role="button"]').first().click({ force: true });
      
      // Verify action was logged
      cy.get('[class*="action"]', { timeout: 5000 }).should('exist');
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
      
      // Should have background pattern options
      cy.contains(/background|canvas|style/i).should('exist');
    });

    it('should display solid background variant', () => {
      visitStory('editor-canvasstyleeditor--with-solid-background');
      
      // Should show solid background option
      cy.get('button, [role="radio"], [role="button"]').should('exist');
    });

    it('should display dots pattern variant', () => {
      visitStory('editor-canvasstyleeditor--with-dots');
      
      // Should show dots pattern option
      cy.get('button, [role="radio"]').should('exist');
    });

    it('should trigger action when pattern is selected', () => {
      visitStory('editor-canvasstyleeditor--default');
      
      // Open Actions panel
      cy.get('[role="tablist"]').contains('Actions', { timeout: 5000 }).click();
      
      // Click a pattern option
      cy.get('button, [role="radio"], [role="button"]').first().click({ force: true });
      
      // Verify action was logged
      cy.get('[class*="action"]', { timeout: 5000 }).should('exist');
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
      
      // Should display keyboard shortcuts
      cy.contains(/keyboard|shortcut|key/i).should('be.visible');
    });

    it('should display multiple shortcuts', () => {
      visitStory('editor-keyboardshortcuthelp--default');
      
      // Should have multiple shortcut entries (look for kbd tags or key descriptions)
      cy.get('kbd, [data-testid*="shortcut"], tr, li').should('have.length.at.least', 3);
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
        
        // Verify no error messages
        cy.get('body').should('not.contain', 'Story is missing');
        cy.get('body').should('not.contain', 'Failed to load');
        cy.get('body').should('not.contain', 'Error:');
      });
    });
  });
});

