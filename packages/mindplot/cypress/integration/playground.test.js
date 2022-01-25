context('Playground', () => {
  it('the playground layout page should match its snapshot', () => {
    // TODO: check why this error is happening, and remove this handling
    cy.on('uncaught:exception', (err) => {
      expect(err.message).to.include('Prediction is incorrectly positioned');
      return false;
    });
    cy.visit('/layout.html');
    cy.matchImageSnapshot('layout');
  });
});
