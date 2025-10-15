context('Layout suite', () => {
  it('basic layout', () => {
    cy.visit('/iframe.html?args=&id=mindplot-layout--basic-suite&viewMode=story');
    // Wait for layout to be fully rendered - check that SVG contains content (replaces cy.wait(2000))
    cy.get('svg', { timeout: 10000 }).should('be.visible');
    // Wait for mindmap content to be loaded - check for text or rect elements that indicate rendering is complete
    cy.get('svg').should(($svg) => {
      const svgContent = $svg.html();
      // Ensure SVG has actual content rendered (not just an empty svg tag)
      expect(svgContent).to.not.be.empty;
      expect(svgContent.length).to.be.greaterThan(100); // Ensure substantial content
    });
    cy.matchImageSnapshot('layout-suite');
  });
});
