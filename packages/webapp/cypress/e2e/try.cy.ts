/// <reference types="cypress" />

describe('Try Page', () => {
  beforeEach(() => {
    cy.visit('/c/maps/1/try');
    cy.waitForEditorLoaded();
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('try-page');
  });
});
