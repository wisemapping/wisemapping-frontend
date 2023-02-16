/// <reference types="cypress" />
describe('Topic Copy and Paste Suite', () => {
  beforeEach(() => {
    // Remove storage for autosave ...
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
    cy.focusTopicById(2);
  });

  it('Copy and Paste', () => {
    cy.get(`[aria-label="Topic Style"]`).first().trigger('mouseover');
    cy.get('body').type('{meta}c');

    // Copy & Paste require permissions. More reseach needed.
    // cy.get('body').type('{meta}v');
    // cy.get('[test-id=50]').click();
    // cy.matchImageSnapshot('copyandpaste');
  });
});
