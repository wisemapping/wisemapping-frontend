describe('Workspace Suite', () => {
  it('Workspace Visibility', () => {
    cy.visit('/iframe.html?args=&id=shapes-workspace--visibility&viewMode=story');
    cy.matchImageSnapshot('workspace-visibility');
  });

  it('Workspace Position', () => {
    cy.visit('/iframe.html?args=&id=shapes-workspace--position&viewMode=story');
    cy.matchImageSnapshot('workspace-position');
  });

  it('Workspace Coords Size', () => {
    cy.visit('/iframe.html?args=&id=shapes-workspace--coords-size&viewMode=story');
    cy.matchImageSnapshot('workspace-coord-size');
  });

  it('Workspace Coords Origin', () => {
    cy.visit('/iframe.html?args=&id=shapes-workspace--coords-origin&viewMode=story');
    cy.matchImageSnapshot('workspace-coord-origin');
  });
});
