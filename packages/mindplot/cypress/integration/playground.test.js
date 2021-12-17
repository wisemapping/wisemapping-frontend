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
  it('the playground viewmode.html page should match its snapshot', () => {
    cy.visit('/viewmode.html');
    cy.matchImageSnapshot('viewmode');
  });
  it('the playground container.html page should match its snapshot', () => {
    cy.visit('/container.html');
    // TODO: wait for mind map to load instead of an arbitrary number of ms
    cy.wait(5000);
    cy.matchImageSnapshot('container');
  });
  it('the playground editor.html page should match its snapshot', () => {
    cy.visit('/editor.html');
    // TODO: wait for mind map to load instead of an arbitrary number of ms
    cy.wait(5000);
    // TODO: why is the editor appearing twice in the snapshot?
    cy.matchImageSnapshot('editor');
  });
});
