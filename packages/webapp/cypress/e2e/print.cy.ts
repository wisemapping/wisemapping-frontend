/// <reference types="cypress" />

describe('Print Page', () => {
  beforeEach(() => {
    cy.visit('/c/maps/1/print');
    cy.waitForEditorLoaded();
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('print-page');
  });
});
