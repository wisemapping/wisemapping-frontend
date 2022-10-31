context('Change Topic shape', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.reload();
    cy.contains('Try it Now!').click();
  });

  it('change to square shape', () => {
    cy.get(`[aria-label="Topic Style"]`).trigger('mouseover');
    cy.get(`[aria-label="Rectangle shape"]`).click();

    cy.get('[test-id=11] > rect').eq(1).invoke('attr', 'rx').should('eq', '0.0');

    cy.matchImageSnapshot('changeToSquareShape');
  });

  it('change to rounded rectangle', () => {
    cy.contains('Mind Mapping').click();

    cy.get(`[aria-label="Topic Style"]`).trigger('mouseover');
    cy.get(`[aria-label="Rounded shape"]`).click();

    cy.get('[test-id=6] > rect').eq(1).invoke('attr', 'rx').should('eq', '4.2');

    cy.matchImageSnapshot('changeToRoundedRectangle');
  });

  it('change to line', () => {
    cy.contains('Try it Now!').click();
    
    cy.get(`[aria-label="Topic Style"]`).trigger('mouseover');
    cy.get(`[aria-label="Line shape"]`).click();

    cy.matchImageSnapshot('changeToLine');
  });

  it('change to ellipse shape', () => {
    cy.contains('Productivity').click();

    cy.get(`[aria-label="Topic Style"]`).trigger('mouseover');
    cy.get(`[aria-label="Ellipse shape"]`).click();

    cy.get('[test-id=2] > rect').eq(1).invoke('attr', 'rx').should('eq', '12.6');

    cy.matchImageSnapshot('changeToEllipseShape');
  });
});
