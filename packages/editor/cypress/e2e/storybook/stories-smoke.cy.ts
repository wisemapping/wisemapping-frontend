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

// Skip this test suite - requires Storybook server running on localhost:6008
// Run separately with: yarn storybook (in one terminal) and yarn cy:storybook:run (in another)
describe.skip('Storybook Stories - Smoke Tests', () => {
  const stories = [
    { name: 'TopicStyleEditor', path: 'editor-topicstyleeditor--default' },
    { name: 'TopicFontEditor', path: 'editor-topicfonteditor--default' },
    { name: 'TopicLinkEditor', path: 'editor-topiclinkeditor--default' },
    { name: 'RichTextNoteEditor', path: 'editor-richtextnoteeditor--default' },
    { name: 'TopicIconEditor', path: 'editor-topiciconeditor--default' },
    { name: 'ColorPicker', path: 'editor-colorpicker--default' },
    { name: 'IconPicker', path: 'editor-iconpicker--default' },
    { name: 'TopicImagePicker', path: 'editor-topicimagepicker--default' },
    { name: 'CanvasStyleEditor', path: 'editor-canvasstyleeditor--default' },
    { name: 'RelationshipStyleEditor', path: 'editor-relationshipstyleeditor--default' },
    { name: 'KeyboardShortcutHelp', path: 'editor-keyboardshortcuthelp--default' },
  ];

  stories.forEach((story) => {
    it(`should load ${story.name} story successfully`, () => {
      const url = `http://localhost:6008/iframe.html?id=${story.path}&viewMode=story`;
      
      cy.visit(url);
      
      // Wait for Storybook iframe to load
      cy.get('body', { timeout: 10000 }).should('exist');
      
      // Verify no error messages
      cy.get('body').should('not.contain', 'Story is missing');
      cy.get('body').should('not.contain', 'Failed to load');
      cy.get('body').should('not.contain', 'Error:');
    });
  });

  it('should load all story variants', () => {
    const variants = [
      'editor-topiclinkeditor--with-existing-url',
      'editor-richtextnoteeditor--with-existing-note',
      'editor-topiciconeditor--with-emoji',
      'editor-topiciconeditor--with-image',
      'editor-colorpicker--with-selected-color',
      'editor-iconpicker--with-emoji',
      'editor-iconpicker--with-image',
      'editor-topicimagepicker--with-emoji',
      'editor-topicimagepicker--with-image',
      'editor-canvasstyleeditor--with-solid-background',
      'editor-canvasstyleeditor--with-dots',
    ];

    variants.forEach((storyPath) => {
      const url = `http://localhost:6008/iframe.html?id=${storyPath}&viewMode=story`;
      cy.visit(url);
      cy.get('body', { timeout: 10000 }).should('exist');
      cy.get('body').should('not.contain', 'Story is missing');
    });
  });
});

