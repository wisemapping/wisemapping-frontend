describe('Group Suite', () => {
  // Rect tests ...
  it('Group Fill', () => {
    cy.visit('/iframe.html?args=&id=shapes-rectangle--fill&viewMode=story');
    cy.matchImageSnapshot('group-fill');
  });

  it('Group Container', () => {
    cy.visit('/iframe.html?args=&id=shapes-group--container&viewMode=story');
    cy.matchImageSnapshot('group-container');
  });

  it('Group Bubbling', () => {
    cy.visit('/iframe.html?args=&id=shapes-group--event-bubbling&viewMode=story');
    cy.matchImageSnapshot('group-size');
  });

  it('Group Nested', () => {
    cy.visit('/iframe.html?args=&id=shapes-group--nested&viewMode=story');
    cy.matchImageSnapshot('group-nested');
  });

  it('Group Coord Size', () => {
    cy.visit('/iframe.html?args=&id=shapes-group--coord-size&viewMode=story');
    cy.matchImageSnapshot('group-coords-size');
  });

  it('Group Coord Origin', () => {
    cy.visit('/iframe.html?args=&id=shapes-group--coord-origin&viewMode=story');
    cy.matchImageSnapshot('group-coords-origin');
  });
});
