/// <reference types="cypress" />

describe('Public Page', () => {
  beforeEach(() => {
    cy.visit('/c/maps/1/public');
    cy.waitForEditorLoaded();
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('public-page');
  });
});
