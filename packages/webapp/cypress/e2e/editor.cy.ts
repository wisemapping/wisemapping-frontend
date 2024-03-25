/// <reference types="cypress" />

describe('Editor Page', () => {
  beforeEach(() => {
    cy.visit('/c/maps/1/edit');
    cy.waitForEditorLoaded();
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('editor-page');
  });
});
