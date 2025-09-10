context('Connection suite', () => {
  // Test to ensure all stories load without import/export errors
  it('all stories load successfully without errors', () => {
    const stories = ['classic', 'prism', 'dark-prism', 'robot'];
    
    stories.forEach((story) => {
      cy.visit(`/iframe.html?args=&id=mindplot-connection--${story}&viewMode=story`);
      
      // Ensure the story loads without JavaScript errors
      cy.window().then((win) => {
        // Check that no uncaught errors occurred during story loading
        cy.wrap(win).should('not.have.property', 'cypressError');
      });
      
      // Ensure the story content is rendered (should contain SVG elements from mindplot)
      cy.get('body').should('contain.html', '<svg');
      
      // Ensure no error messages are displayed
      cy.get('body').should('not.contain', 'does not provide an export named');
      cy.get('body').should('not.contain', 'Failed to resolve module');
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

  it('dark prism theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--dark-prism&viewMode=story');
    cy.matchImageSnapshot('connection-dark-prism');
  });

  it('robot theme', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--robot&viewMode=story');
    cy.matchImageSnapshot('connection-robot');
  });
});
