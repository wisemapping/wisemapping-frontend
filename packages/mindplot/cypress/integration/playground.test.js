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
  it('the playground container.html page should match its snapshot', () => {
    cy.visit(`${BASE_URL}/container.html`);
    cy.matchImageSnapshot('container');
  });
  it('the playground editor.html page should match its snapshot', () => {
    cy.visit(`${BASE_URL}/editor.html`);
    // TODO: wait for #load modal to hide instead of arbitrary wait time
    cy.wait(5000);
    // TODO: why is the editor appearing twice in the snapshot?
    cy.matchImageSnapshot('editor');
  });
});
