context('Layout suite', () => {
  it('basic layout', () => {
    cy.visit('/iframe.html?args=&id=mindplot-layout--basic-suite&viewMode=story');
    cy.wait(2000);
    cy.matchImageSnapshot('layout-suite');
  });
});
