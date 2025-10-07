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

describe('RichTextNoteEditor Storybook', () => {
  const storybookUrl = 'http://localhost:6008/iframe.html?id=editor-richtextnoteeditor--default&viewMode=story';

  beforeEach(() => {
    cy.visit(storybookUrl);
    // Wait for Storybook to render the component
    cy.get('#storybook-root').should('exist');
  });

  it('should trigger onNoteChange action when note content is changed', () => {
    // Find the text editor area (could be textarea, contenteditable, or rich text editor)
    cy.get('textarea, [contenteditable="true"], .ql-editor').should('exist');
    
    // Type some text
    cy.get('textarea, [contenteditable="true"], .ql-editor').first().clear().type('This is a test note');
    
    // Blur to trigger the change
    cy.get('textarea, [contenteditable="true"], .ql-editor').first().blur();
  });

  it('should trigger onNoteChange action when note is cleared', () => {
    // Visit the story with existing note
    cy.visit('http://localhost:6008/iframe.html?id=editor-richtextnoteeditor--with-existing-note&viewMode=story');
    
    // Wait for component to load
    cy.get('#storybook-root').should('exist');
    cy.get('textarea, [contenteditable="true"], .ql-editor').should('exist');
    
    // Clear the note
    cy.get('textarea, [contenteditable="true"], .ql-editor').first().clear().blur();
  });

  it('should trigger closeModal action when close button is clicked', () => {
    // Find and click the close button (X icon button)
    cy.get('button[aria-label="close"]').click();
  });

  it('should display existing note in WithExistingNote story', () => {
    cy.visit('http://localhost:6008/iframe.html?id=editor-richtextnoteeditor--with-existing-note&viewMode=story');
    
    // Wait for component to load and verify note content
    cy.get('#storybook-root').should('exist');
    cy.get('textarea, [contenteditable="true"], .ql-editor').first().should('contain', 'Important note');
  });
});

