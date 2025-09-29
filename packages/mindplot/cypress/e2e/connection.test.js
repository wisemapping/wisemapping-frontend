context('Connection suite', () => {
  // Test to ensure all stories load without import/export errors
  it('all stories load successfully without errors', () => {
    const stories = ['classic', 'prism', 'robot', 'sunrise'];

    stories.forEach((story) => {
      cy.visit(`/iframe.html?args=&id=mindplot-connection--${story}&viewMode=story`);

      // Wait for story to load
      cy.get('body', { timeout: 10000 }).should('be.visible');

      // Ensure the story content is rendered (should contain SVG elements from mindplot)
      cy.get('body').should('contain.html', '<svg');
      cy.get('svg').should('exist').and('be.visible');

      // Main validation: story should render successfully with SVG content
    });
  });

  it('classic theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--classic&viewMode=story');
    cy.matchImageSnapshot('connection-classic');
  });

  it('prism theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--prism&viewMode=story');
    cy.matchImageSnapshot('connection-prism');
  });

  it('robot theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--robot&viewMode=story');
    cy.matchImageSnapshot('connection-robot');
  });

  it('sunrise theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--sunrise&viewMode=story');
    cy.matchImageSnapshot('connection-sunrise');
  });
});
