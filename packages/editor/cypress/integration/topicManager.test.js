context('Node manager', () => {
  before(() => {
    cy.visit('/editor.html');
  });

  it('shortcut add sibling node', () => {
    cy.contains('Mind Mapping').click();
    cy.get('body').type('{enter}').type('Mind Mapping rocks!!').type('{enter}');

    cy.get('[test-id=36] > text > tspan').should('exist');

    cy.matchImageSnapshot('editor-shortcut-edit');
  });

  it('shortcut add child node', () => {
    cy.contains('Mind Mapping rocks!!').click();
    cy.get('body').type('{insert}').type('Child 1 mind Mapping rocks!!').type('{enter}');
    cy.get('body').type('{enter}').type('Child 2 mind Mapping rocks!!').type('{enter}');

    cy.get('[test-id=36] > text > tspan').should('exist');
    cy.get('[test-id=37] > text > tspan').should('exist');

    cy.matchImageSnapshot('addChildNodeSortcut');
  });

  it('Delete topic', () => {
    cy.get('[test-id=37]').click();
    cy.get('body').type('{del}');

    cy.get('[test-id=37]').should('not.exist');

    cy.matchImageSnapshot('deleteTopicShortcut');
  });

  it('undo changes', () => {
    cy.get('#undoEditionTip').click();

    cy.get('[test-id=36] > text > tspan').should('exist');

    cy.matchImageSnapshot('undoChange');
  });

  it('Save changes', () => {
    cy.contains('Mind Mapping rocks!!').click();
    cy.get('body').type('{ctrl}s');

    cy.matchImageSnapshot('saveChagesShortcut');
  });
});
