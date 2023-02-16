describe('Ellipse Suite', () => {
  // Ellipse tests ...
  it('Ellipse Fill', () => {
    cy.visit('/iframe.html?args=&id=shapes-ellipse--fill&viewMode=story');
    cy.matchImageSnapshot('ellipse-fill');
  });

  it('Ellipse Stroke', () => {
    cy.visit('/iframe.html?args=&id=shapes-ellipse--fill&viewMode=story');
    cy.matchImageSnapshot('ellipse-stroke');
  });

  it('Ellipse Size', () => {
    cy.visit('/iframe.html?args=&id=shapes-ellipse--size&viewMode=story');
    cy.matchImageSnapshot('ellipse-size');
  });
});
