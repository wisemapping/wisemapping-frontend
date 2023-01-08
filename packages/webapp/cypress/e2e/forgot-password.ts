describe('Forgot Password Page', () => {
  beforeEach(() => {
    cy.visit('/c/forgot-password');
    cy.waitForPageLoaded();
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('forgot-password');
  });
});
