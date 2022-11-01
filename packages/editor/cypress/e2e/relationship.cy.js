context('Relationship Topics', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.reload();
    cy.get('[test-id="30-11-relationship"]').first().click({ force: true });
  });

  it('Add Relationship', () => {
    cy.contains('Features').first().click();
    cy.get(`[aria-label="Add Relationship"]`).first().click();
    cy.contains('Try it Now!').first().click();
 
    cy.get('[test-id="11-15-relationship"]').first().click({ force: true });
    cy.matchImageSnapshot('addRelationship');
  });

  it('Delete Relationship', () => {
    cy.get('[test-id="11-15-relationship"]').click({ force: true });
    cy.get('body').type('{backspace}');

    cy.get('[test-id="11-15-relationship"]').should('not.exist');
    cy.matchImageSnapshot('delete relationship');
  });
});
