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
    // Wait for contentEditable note editor to be visible and ready for interaction
    cy.get('[contenteditable="true"]').should('be.visible');
  };

  beforeEach(() => {
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
  });

  it('Add note to topic', () => {
    cy.focusTopicById(3);
    
    cy.onClickToolbarButton('Add Note');

    // Wait for note panel to load dynamically
    waitForNotePanel();

    // Type a note
    const noteText = 'This is a test note for the topic';
    cy.get('[contenteditable="true"]').first().type(noteText);

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
    cy.get('[contenteditable="true"]').first().type(noteText);

    // Save the note
    cy.contains('Accept').should('be.visible').click();

    // Now remove the note by opening the note panel again
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Note');

    // Wait for panel to load dynamically
    waitForNotePanel();

    // Clear the note text
    cy.get('[contenteditable="true"]').first().clear();

    // Click Delete button to remove the note
    cy.contains('Delete').should('be.visible').click();

    cy.matchImageSnapshot('note-removed-from-topic');
  });

  it('Edit existing note', () => {
    // Add initial note
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Note');

    // Wait for panel to load dynamically
    waitForNotePanel();

    const initialNote = 'Initial note text';
    cy.get('[contenteditable="true"]').first().type(initialNote);
    cy.contains('Accept').should('be.visible').click();

    // Edit the note
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Note');

    // Wait for panel to load dynamically
    waitForNotePanel();

    // Verify the existing note text is loaded
    cy.get('[contenteditable="true"]').should('contain.text', initialNote);

    // Clear and type new text
    cy.get('[contenteditable="true"]').first().clear().type('Updated note text');
    cy.contains('Accept').should('be.visible').click();

    cy.matchImageSnapshot('note-edited-successfully');
  });

  it('Verify note content is saved and persists', () => {
    cy.focusTopicById(5);
    cy.onClickToolbarButton('Add Note');

    // Wait for panel to load dynamically
    waitForNotePanel();

    const noteContent = 'This note should persist after saving';
    cy.get('[contenteditable="true"]').first().type(noteContent);
    
    // Save the note
    cy.contains('Accept').should('be.visible').click();

    // Verify the note persists by opening the note panel again
    cy.focusTopicById(5);
    cy.onClickToolbarButton('Add Note');

    // Wait for panel to load dynamically
    waitForNotePanel();

    // Verify the note content is still there
    cy.get('[contenteditable="true"]').should('contain.text', noteContent);

    cy.matchImageSnapshot('note-content-persists');
  });

  it('shows note tooltip on hover', () => {
    const tooltipNote = 'Tooltip note content';

    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Note');
    waitForNotePanel();

    cy.get('[contenteditable="true"]').first().clear().type(tooltipNote);
    cy.contains('Accept').should('be.visible').click();

    cy.get('mindplot-component')
      .shadow()
      .find('[test-id="topic-note-icon"]', { timeout: 5000 })
      .first()
      .trigger('mouseenter', { force: true });

    cy.get('mindplot-component')
      .shadow()
      .find('#mindplot-svg-tooltip-content-note', { timeout: 2000 })
      .should('be.visible')
      .and('contain.text', tooltipNote);

    cy.get('mindplot-component')
      .shadow()
      .find('[test-id="topic-note-icon"]')
      .first()
      .trigger('mouseleave', { force: true });
  });
});