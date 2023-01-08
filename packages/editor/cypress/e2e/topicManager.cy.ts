describe('Node manager', () => {
  beforeEach(() => {
    cy.visit('/editor.html');

    // Wait for load complate ...
    cy.get('[aria-label="vortex-loading"]').should('not.exist');

    // Select root node ...
    cy.contains('Mind Mapping').click({ force: true });
  });

  it('shortcut add sibling node', () => {
    cy.get('body').type('{enter}').type('Mind Mapping rocks!!').type('{enter}');
    cy.get('[test-id=36] > text > tspan').should('exist');
    cy.matchImageSnapshot('editor-shortcut-edit');
  });

  it('shortcut add child node', () => {
    cy.get('body').type('{insert}').type('Child 1 mind Mapping rocks!!').type('{enter}');
    cy.get('body').type('{enter}').type('Child 2 mind Mapping rocks!!').type('{enter}');

    cy.get('[test-id=36] > text > tspan').should('exist');
    cy.get('[test-id=37] > text > tspan').should('exist');

    cy.matchImageSnapshot('addChildNodeSortcut');
  });

  it('Delete topic', () => {
    cy.get('body').type('{enter}').type('Mind Mapping rocks!!').type('{enter}');
    cy.get('[test-id=36]').click();
    cy.get('body').type('{del}');

    cy.get('[test-id=37]').should('not.exist');

    cy.matchImageSnapshot('deleteTopicShortcut');
  });

  it('undo changes', () => {
    cy.get('body').type('{enter}').type('Mind Mapping rocks!!').type('{enter}');
    cy.get('[data-testid="UndoOutlinedIcon"]').click();
    cy.get('[test-id=36] > text > tspan').should('exist');

    cy.matchImageSnapshot('undoChange');
  });

  it('redo changes', () => {
    cy.get('body').type('{enter}').type('Mind Mapping rocks!!').type('{enter}');
    cy.get('[data-testid="UndoOutlinedIcon"]').click();
    cy.get('[test-id=36] > text > tspan').should('exist');

    cy.get('[data-testid="RedoOutlinedIcon"]').click();
    cy.get('[test-id=36] > text > tspan').should('exist');

    cy.matchImageSnapshot('redoChange');
  });

  it('Save changes', () => {
    cy.get('body').type('{ctrl}s');
    cy.matchImageSnapshot('saveChagesShortcut');
  });
});
