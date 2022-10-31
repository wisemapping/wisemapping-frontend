context('Relationship Topics', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.reload();
    cy.get('[test-id="30-11-relationship"]').click({ force: true });
  });

  it('Add Relationship', () => {
    cy.contains('Features').click();
    cy.get(`[aria-label="Add Relationship"]`).click();
    cy.contains('Try it Now!').click();
 
    cy.get('[test-id="11-15-relationship"]').click({ force: true });
    cy.matchImageSnapshot('addRelationship');
  });

  it('Delete Relationship', () => {
    cy.get('[test-id="11-15-relationship"]').click({ force: true });
    cy.get('body').type('{backspace}');

    cy.get('[test-id="11-15-relationship"]').should('not.exist');
    cy.matchImageSnapshot('delete relationship');
  });
});
