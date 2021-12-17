context('Playground', () => {
  describe('snapshots', () => {
    it('Arrow', () => {
      cy.visit('/arrow.html');
      cy.matchImageSnapshot('Arrow');
    });
    it('Curved Line', () => {
      cy.visit('/curvedLine.html');
      cy.matchImageSnapshot('Curved Line');
    });
    it('Events', () => {
      cy.visit('/events.html');
      cy.matchImageSnapshot('Events');
    });
    it('Font', () => {
      cy.visit('/font.html');
      cy.matchImageSnapshot('Font');
    });
    it('Group', () => {
      cy.visit('/group.html');
      cy.matchImageSnapshot('Group');
    });
    it('Line', () => {
      cy.visit('/line.html');
      cy.matchImageSnapshot('Line');
    });
    it('Poly Line', () => {
      cy.visit('/polyLine.html');
      cy.matchImageSnapshot('Poly Line');
    });
    it('Prototype', () => {
      cy.visit('/prototype.html');
      cy.matchImageSnapshot('Prototype');
    });
    it('Rect', () => {
      cy.visit('/rect.html');
      cy.matchImageSnapshot('Rect');
    });
    it('Shapes', () => {
      cy.visit('/shapes.html');
      cy.matchImageSnapshot('Shapes');
    });
    it('Text', () => {
      cy.visit('/text.html');
      cy.matchImageSnapshot('Text');
    });
    it('Workspace', () => {
      cy.visit('/workspace.html');
      cy.matchImageSnapshot('Workspace');
    });
  });
});
