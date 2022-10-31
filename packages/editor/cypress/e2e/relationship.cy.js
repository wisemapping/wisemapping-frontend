context('Relationship Topics', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.reload();
    cy.get('[test-id="30-11-relationship"]').click({ force: true });
  });

  it('Change shape relationship', () => {
    cy.get('[test-id="control-56"]').trigger('mousedown', { force: true });
    cy.get('body').trigger('mousemove', { clientX: 500, clientY: 200 });
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('changeShapeRealtionship');

    cy.get('[test-id="control-56"]').invoke('attr', 'cy').should('eq', '-131.75');
  });
});
