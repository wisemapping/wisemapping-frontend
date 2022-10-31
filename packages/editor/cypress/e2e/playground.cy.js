context('Playground', () => {
  it('viewmode page should match its snapshot', () => {
    [
      'welcome',
      'sample1',
      'sample2',
      'sample3',
      'sample4',
      'sample5',
      'sample6',
      'complex',
      'img-support',
      'icon-sample',
    ].forEach((mapId) => {
      cy.visit(`/viewmode.html?id=${mapId}`);
      cy.get('#mindmap-comp.ready').should('exist');
      cy.matchImageSnapshot(`viewmode-${mapId}`);
    });
  });
  it('the playground showcase.html page should match its snapshot', () => {
    cy.visit('/showcase.html');
    cy.getIframeBody().find('#mindmap-comp.ready').should('exist');
    cy.matchImageSnapshot('container');
  });
  it('the playground editor.html page should match its snapshot', () => {
    cy.visit('/editor.html');
    cy.get('#mindmap-comp.ready').should('exist');
    // TODO: why is the editor appearing twice in the snapshot?
    cy.matchImageSnapshot('editor');
  });
});
