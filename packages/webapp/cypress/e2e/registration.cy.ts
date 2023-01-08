describe('Registration Page', () => {
  beforeEach(() => {
    cy.visit('/c/registration');
  });

  it('registation load', () => {
    cy.matchImageSnapshot('registration-page');
  });
});
