describe('CurvedLine Suite', () => {
  // CurvedLine tests ...
  it('CurvedLine Width', () => {
    cy.visit('/iframe.html?args=&id=shapes-curvedline--width&viewMode=story');
    cy.matchImageSnapshot('curvedline-width');
  });

  it('CurvedLine Stroke', () => {
    cy.visit('/iframe.html?args=&id=shapes-curvedline--stroke&viewMode=story');
    cy.matchImageSnapshot('curvedline-stroke');
  });

  it('CurvedLine Middle Curved', () => {
    cy.visit('/iframe.html?args=&id=shapes-curvedline--fill&viewMode=story');
    cy.matchImageSnapshot('curvedline-fill');
  });
});
