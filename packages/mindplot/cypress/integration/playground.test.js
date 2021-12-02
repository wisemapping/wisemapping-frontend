const BASE_URL = 'http://localhost:8081';

context('Playground', () => {
  it('the playground layout page should match its snapshot', () => {
    // TODO: check why this error is happening, and remove this handling
    cy.on('uncaught:exception', (err) => {
      expect(err.message).to.include('Prediction is incorrectly positioned');
      return false;
    });
    cy.visit(`${BASE_URL}/layout.html`);
    cy.matchImageSnapshot('layout');
  });
  it('the playground viewmode.html page should match its snapshot', () => {
    cy.visit(`${BASE_URL}/viewmode.html`);
    cy.matchImageSnapshot('viewmode');
  });
});
