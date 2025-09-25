/// <reference types="cypress" />
describe.skip('Topic Note Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Add note to topic', () => {
    cy.focusTopicById(3);
    
    // Use the aria-label that includes the keyboard shortcut - select the first one
    cy.get('[aria-label*="Add Note"]').first().click({ force: true });

    // Wait for note panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify that the note input/editor is visible
    cy.get('textarea, [contenteditable="true"]').should('be.visible');

    // Type a note
    const noteText = 'This is a test note for the topic';
    cy.get('textarea').first().type(noteText);

    // Click Accept/Save button
    cy.contains('Accept').click();

    // Wait for the note to be applied
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Verify the note was added by checking for note indicator or taking snapshot
    cy.matchImageSnapshot('note-added-to-topic');
  });

  it('Remove note from topic', () => {
    // First add a note
    cy.focusTopicById(3);
    cy.get('[aria-label*="Add Note"]').first().click({ force: true });

    // Wait for note panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Add note text
    const noteText = 'This note will be deleted';
    cy.get('textarea').first().type(noteText);

    // Save the note
    cy.contains('Accept').click();

    // Wait for note to be applied
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Now remove the note by opening the note panel again
    cy.focusTopicById(3);
    cy.get('[aria-label*="Add Note"]').first().click({ force: true });

    // Wait for panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Clear the note text
    cy.get('textarea').first().clear();

    // Click Accept to save the empty note (which should remove it)
    cy.contains('Accept').click();

    // Take a snapshot to verify the note was removed
    cy.matchImageSnapshot('note-removed-from-topic');
  });

  it('Edit existing note', () => {
    // Add initial note
    cy.focusTopicById(4);
    cy.get('[aria-label*="Add Note"]').first().click({ force: true });

    // Wait for panel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    const initialNote = 'Initial note text';
    cy.get('textarea').first().type(initialNote);
    cy.contains('Accept').click();

    // Wait for note to be saved
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Edit the note
    cy.focusTopicById(4);
    cy.get('[aria-label*="Add Note"]').first().click({ force: true });

    // Wait for panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify the existing note text is loaded
    cy.get('textarea').should('contain.value', initialNote);

    // Clear and type new text
    cy.get('textarea').first().clear().type('Updated note text');
    cy.contains('Accept').click();

    // Take snapshot of edited note
    cy.matchImageSnapshot('note-edited-successfully');
  });

  it('Verify note content is saved and persists', () => {
    cy.focusTopicById(5);
    cy.get('[aria-label*="Add Note"]').first().click({ force: true });

    // Wait for panel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    const noteContent = 'This note should persist after saving';
    cy.get('textarea').first().type(noteContent);
    
    // Save the note
    cy.contains('Accept').click();

    // Wait for save
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Verify the note persists by opening the note panel again
    cy.focusTopicById(5);
    cy.get('[aria-label*="Add Note"]').first().click({ force: true });

    // Wait for panel
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify the note content is still there
    cy.get('textarea').should('contain.value', noteContent);

    // Take snapshot to verify note persistence
    cy.matchImageSnapshot('note-content-persists');
  });
});