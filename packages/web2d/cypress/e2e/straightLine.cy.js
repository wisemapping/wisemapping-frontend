describe('StraightLine Suite', () => {
  // StraightLine tests ...
  it('StraightLine Stroke Width', () => {
    cy.visit('/iframe.html?args=&id=shapes-straightline--stroke-width&viewMode=story');
    cy.matchImageSnapshot('straightline-stroke-width');
  });

  it('StraightLine Stroke Color', () => {
    cy.visit('/iframe.html?args=&id=shapes-straightline--stroke-color&viewMode=story');
    cy.matchImageSnapshot('straightline-stroke-color');
  });
});
