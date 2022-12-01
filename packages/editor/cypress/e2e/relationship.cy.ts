context('Relationship Topics', () => {
  beforeEach(() => {
    // Remove storage for autosave ...
    cy.visit('/editor.html');
    cy.clearLocalStorage('welcome-xml');
    cy.reload();

    // Wait for load complate ...
    cy.get('svg > path').should('be.visible');
  });

  it('Add Relationship', () => {
    cy.contains('Features').click();
    cy.get(`[aria-label="Add Relationship"]`).first().click();
    cy.contains('Try it Now!').click();

    cy.get('[test-id="11-15-relationship"]').click();
    cy.get('[test-id="11-15-relationship"]').should('exist');

    cy.matchImageSnapshot('addRelationship');
  });

  it('Delete Relationship', () => {
    cy.contains('Features').first().click();
    cy.get(`[aria-label="Add Relationship"]`).first().click();
    cy.contains('Try it Now!').first().click();

    cy.get('[test-id="11-15-relationship"]').should('exist');
    cy.get('[test-id="11-15-relationship"]').click();

    cy.get('body').type('{backspace}');

    cy.get('[test-id="11-15-relationship"]').should('not.exist');
    cy.matchImageSnapshot('delete relationship');
  });
});
