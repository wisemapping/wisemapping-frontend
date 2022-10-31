context('Editor Page', () => {
  beforeEach(() => {
    cy.visit('c/maps/11/edit');
  });

  it('page loaded', () => {
    cy.matchImageSnapshot('editor-page');
  });
});
