describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/c/login');
    cy.waitForPageLoaded();
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('login-page');
  });
});
