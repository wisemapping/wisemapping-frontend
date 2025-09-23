context('Topic suite', () => {
  // Test to ensure all topic stories load without import/export errors
  it('all topic stories load successfully without errors', () => {
    const stories = [
      'border-style',
      'font-style', 
      'background-color',
      'icon-feature',
      'shape-none',
      'shape-ellipse',
      'shape-line'
    ];
    
    stories.forEach((story) => {
      cy.visit(`/iframe.html?args=&id=mindplot-topic--${story}&viewMode=story`);
      
      // Wait for story to load
      cy.get('body', { timeout: 10000 }).should('be.visible');
      
      // Ensure the story content is rendered (should contain SVG elements from mindplot)
      cy.get('body').should('contain.html', '<svg');
      cy.get('svg').should('exist').and('be.visible');
      
      // Main validation: story should render successfully with SVG content
    });
  });

  it('topic border', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--border-style&viewMode=story');
    cy.matchImageSnapshot('topic-border');
  });

  it('topic style', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--font-style&viewMode=story');
    cy.matchImageSnapshot('topic-style');
  });

  it('topic color', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--background-color&viewMode=story');
    cy.matchImageSnapshot('topic-color');
  });
  // Review topic use of designer ...
  it.skip('topic note feature', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--note-feature&viewMode=story');
    cy.matchImageSnapshot('topic-note');
  });
  it.skip('topic link feature', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--link-feature&viewMode=story');
    cy.matchImageSnapshot('topic-link-feature');
  });
  it('topic icon feature', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--icon-feature&viewMode=story');
    cy.matchImageSnapshot('topic-icon-feature');
  });
  it('topic shape line', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--shape-line&viewMode=story');
    cy.matchImageSnapshot('topic-shape-line');
  });
  it('topic ellipse line', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--shape-ellipse&viewMode=story');
    cy.matchImageSnapshot('topic-shape-ellipse');
  });
  it('topic none line', () => {
    cy.visit('/iframe.html?args=&id=mindplot-topic--shape-none&viewMode=story');
    cy.matchImageSnapshot('topic-shape-none');
  });
});