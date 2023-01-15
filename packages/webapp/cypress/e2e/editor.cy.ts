/// <reference types="cypress" />

describe('Editor Page', () => {
  beforeEach(() => {
    cy.visit('/c/maps/11/edit');
    cy.waitForEditorLoaded();
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('editor-page');
  });
});
