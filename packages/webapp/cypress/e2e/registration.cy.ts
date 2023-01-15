/// <reference types="cypress" />

describe('Registration Page', () => {
  beforeEach(() => {
    cy.visit('/c/registration');
    cy.waitForPageLoaded();
  });

  it('registation load', () => {
    cy.matchImageSnapshot('registration-page');
  });
});
