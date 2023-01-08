describe('Forgot Password Page', () => {
  beforeEach(() => {
    cy.visit('/c/forgot-password');
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('forgot-password');
  });
});
