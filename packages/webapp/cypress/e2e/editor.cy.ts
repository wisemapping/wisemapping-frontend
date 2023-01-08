describe('Editor Page', () => {
  beforeEach(() => {
    cy.visit('/c/maps/11/edit');
    cy.get('[aria-label="vortex-loading"]', { timeout: 120000 }).should('not.exist');
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('editor-page');
  });
});
