context('Connection suite', () => {
  it('classic theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--classic&viewMode=story');
    cy.matchImageSnapshot('connection-classic');
  });

  it('classic prism', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--prism&viewMode=story');
    cy.matchImageSnapshot('connection-prism');
  });
});
