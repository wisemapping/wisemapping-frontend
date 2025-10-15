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
describe('Topic Note Suite', () => {
  const waitForNotePanel = () => {
    // Wait for note textarea to be visible and ready for interaction
    cy.get('textarea, [contenteditable="true"]').should('be.visible').and('not.be.disabled');
  };

  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Add note to topic', () => {
    cy.focusTopicById(3);
    
    cy.onClickToolbarButton('Add Note');

    // Wait for note panel to load dynamically
    waitForNotePanel();

    // Type a note
    const noteText = 'This is a test note for the topic';
    cy.get('textarea').first().type(noteText);

    // Click Accept/Save button
    cy.contains('Accept').should('be.visible').click();

    cy.matchImageSnapshot('note-added-to-topic');
  });

  it('Remove note from topic', () => {
    // First add a note
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Note');

    // Wait for note panel to load dynamically
    waitForNotePanel();

    // Add note text
    const noteText = 'This note will be deleted';
    cy.get('textarea').first().type(noteText);

    // Save the note
    cy.contains('Accept').should('be.visible').click();

    // Now remove the note by opening the note panel again
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Note');

    // Wait for panel to load dynamically
    waitForNotePanel();

    // Clear the note text
    cy.get('textarea').first().clear();

    // Click Accept to save the empty note (which should remove it)
    cy.contains('Accept').should('be.visible').click();

    cy.matchImageSnapshot('note-removed-from-topic');
  });

  it('Edit existing note', () => {
    // Add initial note
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Note');

    // Wait for panel to load dynamically
    waitForNotePanel();

    const initialNote = 'Initial note text';
    cy.get('textarea').first().type(initialNote);
    cy.contains('Accept').should('be.visible').click();

    // Edit the note
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Note');

    // Wait for panel to load dynamically
    waitForNotePanel();

    // Verify the existing note text is loaded
    cy.get('textarea').should('contain.value', initialNote);

    // Clear and type new text
    cy.get('textarea').first().clear().type('Updated note text');
    cy.contains('Accept').should('be.visible').click();

    cy.matchImageSnapshot('note-edited-successfully');
  });

  it('Verify note content is saved and persists', () => {
    cy.focusTopicById(5);
    cy.onClickToolbarButton('Add Note');

    // Wait for panel to load dynamically
    waitForNotePanel();

    const noteContent = 'This note should persist after saving';
    cy.get('textarea').first().type(noteContent);
    
    // Save the note
    cy.contains('Accept').should('be.visible').click();

    // Verify the note persists by opening the note panel again
    cy.focusTopicById(5);
    cy.onClickToolbarButton('Add Note');

    // Wait for panel to load dynamically
    waitForNotePanel();

    // Verify the note content is still there
    cy.get('textarea').should('contain.value', noteContent);

    cy.matchImageSnapshot('note-content-persists');
  });
});