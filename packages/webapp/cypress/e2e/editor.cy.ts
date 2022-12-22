context('Editor Page', () => {
  beforeEach(() => {
    cy.visit('c/maps/11/edit');
  });

  it('page loaded', () => {
    // Wait for load complate ...
    cy.get('[aria-label="vortex-loading"]').should('not.exist');

    cy.matchImageSnapshot('editor-page');
  });
});
