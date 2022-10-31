context('Login Page', () => {
  beforeEach(() => {
    cy.visit('/c/login');
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('login-page');
  });
});
