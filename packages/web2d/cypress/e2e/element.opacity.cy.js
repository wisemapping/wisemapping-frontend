describe('Element Opacity Suite', () => {
  // Rect tests ...
  it('Element Opacity', () => {
    cy.visit('/iframe.html?args=&id=shapes-element--opacity&viewMode=story');
    cy.matchImageSnapshot('element-opacity');
  });
});
