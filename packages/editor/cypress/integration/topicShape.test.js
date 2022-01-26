context('Change Topic shape', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.reload();
    cy.contains('Try it Now!').click();
  });

  it('change to square shape', () => {
    cy.get('#topicShapeTip').click();
    cy.get('#rectagle').click();

    cy.get('[test-id=11] > rect').eq(1).invoke('attr', 'rx').should('eq', '0');

    cy.matchImageSnapshot('changeToSquareShape');
  });

  it('change to rounded rectagle', () => {
    cy.get('#topicShapeTip').click();
    // TODO: The parameter {force: true} was placed because it does not detect that the element is visible
    cy.get('#rounded_rectagle').click({ force: true });

    cy.get('[test-id=11] > rect').eq(1).invoke('attr', 'rx').should('eq', '4.05');

    cy.matchImageSnapshot('changeToRoundedRectagle');
  });

  it('change to line', () => {
    cy.get('#topicShapeTip').click();
    // TODO: The parameter {force: true} was placed because it does not detect that the element is visible
    cy.get('#line').click({ force: true });

    cy.matchImageSnapshot('changeToLine');
  });

  it('change to elipse shape', () => {
    cy.get('#topicShapeTip').click();
    // TODO: The parameter {force: true} was placed because it does not detect that the element is visible
    cy.get('#elipse').click({ force: true });

    cy.get('[test-id=11] > rect').eq(1).invoke('attr', 'rx').should('eq', '12.15');

    cy.matchImageSnapshot('changeToElipseShape');
  });
});
