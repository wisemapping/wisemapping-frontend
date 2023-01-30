describe('Polyline Suite', () => {
  // Polyline tests ...
  it('Polyline Stroke', () => {
    cy.visit('/iframe.html?args=&id=shapes-polyline--stroke&viewMode=story');
    cy.matchImageSnapshot('polyline-stroke');
  });

  it('Polyline Straight', () => {
    cy.visit('/iframe.html?args=&id=shapes-polyline--straight&viewMode=story');
    cy.matchImageSnapshot('polyline-straight');
  });

  it('Polyline Middle Straight', () => {
    cy.visit('/iframe.html?args=&id=shapes-polyline--middle-straight&viewMode=story');
    cy.matchImageSnapshot('polyline-middle-straight');
  });

  it('Polyline Curved', () => {
    cy.visit('/iframe.html?args=&id=shapes-polyline--curved&viewMode=story');
    cy.matchImageSnapshot('polyline-curved');
  });

  it('Polyline Middle Curved', () => {
    cy.visit('/iframe.html?args=&id=shapes-polyline--middle-curved&viewMode=story');
    cy.matchImageSnapshot('polyline-middle-curved');
  });
});
