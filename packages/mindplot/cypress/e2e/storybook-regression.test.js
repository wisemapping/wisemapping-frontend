/**
 * Regression tests to ensure Storybook stories load without errors
 */
context('Storybook Regression Tests', () => {
  it('connection stories load and render successfully', () => {
    const connectionStories = ['classic', 'prism', 'robot', 'sunrise', 'ocean'];

    connectionStories.forEach((variant) => {
      cy.visit(`/iframe.html?args=&id=mindplot-connection--${variant}&viewMode=story`);

      // Wait for the story to load
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Verify content is rendered with SVG
      cy.get('body').should('contain.html', '<svg');
      cy.get('svg').should('exist').and('be.visible');

      // Main validation: story should render successfully with SVG content
      // (The core functionality is working if SVG renders correctly)
    });
  });

  it('topic stories load and render successfully', () => {
    const topicStories = [
      'border-style',
      'font-style',
      'background-color',
      'icon-feature',
      'shape-none',
      'shape-ellipse',
      'shape-line',
    ];

    topicStories.forEach((variant) => {
      cy.visit(`/iframe.html?args=&id=mindplot-topic--${variant}&viewMode=story`);

      // Wait for the story to load
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Verify content is rendered with SVG
      cy.get('body').should('contain.html', '<svg');
      cy.get('svg').should('exist').and('be.visible');

      // Main validation: story should render successfully with SVG content
      // (The core functionality is working if SVG renders correctly)
    });
  });

  it('mindplot components render with expected structure', () => {
    cy.visit('/iframe.html?args=&id=mindplot-connection--classic&viewMode=story');

    // Wait for the story to load
    cy.get('body', { timeout: 15000 }).should('be.visible');

    // Verify SVG elements are present (indicating successful render)
    cy.get('svg').should('exist').and('be.visible');

    // Verify the story loaded without showing error elements
    cy.get('[data-testid="error-message"]').should('not.exist');
    cy.get('.error').should('not.exist');
  });
});
