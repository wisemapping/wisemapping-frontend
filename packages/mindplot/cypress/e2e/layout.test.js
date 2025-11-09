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

  it('renders a full mindmap with distinct node positions', () => {
    cy.visit('/iframe.html?args=&id=mindplot-layout--rendered-mindmap&viewMode=story');

    cy.get('[data-testid="mindmap-story-container"][data-loaded="ready"]', {
      timeout: 20000,
    }).should('be.visible');

    cy.get('mindplot-component', { timeout: 10000 }).should('exist');

    cy.get('mindplot-component')
      .shadow()
      .find('svg', { timeout: 10000 })
      .should('exist')
      .and('be.visible');

    cy.window().then((win) => {
      const designer = win.__mindplotStoryDesigner;
      expect(designer, 'Designer should be initialized').to.exist;

      const mindmap = designer.getMindmap();
      const branches = mindmap.getBranches();
      expect(branches, 'Mindmap should have branches').to.have.length.greaterThan(0);

      const central = branches[0];
      const children = central.getChildren();
      expect(children, 'Central topic should have child nodes').to.have.length.greaterThan(1);

      const childPositions = children.map((child, index) => {
        const pos = child.getPosition();
        expect(pos, `Child ${index} position`).to.exist;
        expect(Number.isFinite(pos.x), `Child ${index} x is finite`).to.be.true;
        expect(Number.isFinite(pos.y), `Child ${index} y is finite`).to.be.true;
        return pos;
      });

      const roundedX = childPositions.map((pos) => Math.round(pos.x));
      const uniqueX = new Set(roundedX);
      expect(
        uniqueX.size,
        'Child nodes should have distinct horizontal positions',
      ).to.be.greaterThan(1);
      expect(
        childPositions.some((pos) => pos.x < 0),
        'At least one child should be on the left side',
      ).to.be.true;
      expect(
        childPositions.some((pos) => pos.x > 0),
        'At least one child should be on the right side',
      ).to.be.true;

      const grandchildren = [];
      children.forEach((child) => {
        const nodes = child.getChildren();
        nodes.forEach((grandchild) => grandchildren.push(grandchild));
      });

      expect(grandchildren, 'There should be grandchildren').to.have.length.greaterThan(0);
      grandchildren.forEach((grandchild, index) => {
        const pos = grandchild.getPosition();
        expect(pos, `Grandchild ${index} position`).to.exist;
        expect(Math.abs(pos.y), `Grandchild ${index} vertical offset`).to.be.greaterThan(10);
      });
    });
  });
});
