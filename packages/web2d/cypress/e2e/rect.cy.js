describe('Rect Suite', () => {
  // Rect tests ...
  it('Reactangle Fill', () => {
    cy.visit('/iframe.html?args=&id=shapes-rectangle--fill&viewMode=story');
    cy.matchImageSnapshot('rectangle-fill');
  });

  it('Reactangle Stroke', () => {
    cy.visit('/iframe.html?args=&id=shapes-rectangle--stroke&viewMode=story');
    cy.matchImageSnapshot('rectangle-stroke');
  });

  it('Reactangle Size', () => {
    cy.visit('/iframe.html?args=&id=shapes-rectangle--size&viewMode=story');
    cy.matchImageSnapshot('rectangle-size');
  });

  it('Reactangle Arc', () => {
    cy.visit('/iframe.html?args=&id=shapes-rectangle--arc&viewMode=story');
    cy.matchImageSnapshot('rectangle-arc');
  });
});
