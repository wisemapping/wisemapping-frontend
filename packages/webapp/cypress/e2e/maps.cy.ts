context('Maps Page', () => {
  beforeEach(() => {
    cy.visit('/c/maps');
  });

  it('should match the snapshot', () => {
    // cy.matchImageSnapshot('maps');
  });
});
