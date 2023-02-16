/// <reference types="cypress" />
describe('Node manager', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();

    // Select root node ...
    cy.focusTopicByText('Mind Mapping');
  });

  it('shortcut add sibling node', () => {
    cy.get('body').type('{enter}').type('Mind Mapping rocks!!').type('{enter}');
    cy.get('[test-id=36] > text > tspan').should('exist');
    cy.matchImageSnapshot('editor-shortcut-edit');
  });

  it('shortcut add child node', () => {
    cy.get('body').type('{insert}').type('Child 1 mind Mapping rocks!!').type('{enter}');
    cy.get('body').type('{enter}').type('Child 2 mind Mapping rocks!!').type('{enter}');

    cy.focusTopicById(36);
    cy.focusTopicById(37);

    cy.matchImageSnapshot('addChildNodeSortcut');
  });

  it('Delete topic', () => {
    cy.get('body').type('{enter}').type('Mind Mapping rocks!!').type('{enter}');
    cy.focusTopicById(36);
    cy.get('body').type('{del}');

    cy.get('[test-id=37]').should('not.exist');

    cy.matchImageSnapshot('deleteTopicShortcut');
  });

  it('undo changes', () => {
    cy.get('body').type('{enter}').type('Mind Mapping rocks!!').type('{enter}');
    cy.focusTopicByText('Mind Mapping rocks!!');
    cy.triggerUndo();

    cy.matchImageSnapshot('undoChange');
  });

  it('redo changes', () => {
    cy.get('body').type('{enter}').type('Mind Mapping rocks!!').type('{enter}');
    cy.focusTopicByText('Mind Mapping rocks!!');

    cy.triggerUndo();
    cy.triggerRedo();
    cy.focusTopicByText('Mind Mapping rocks!!');

    cy.matchImageSnapshot('redoChange');
  });

  it('save changes', () => {
    cy.get('body').type('{ctrl}s');
    cy.matchImageSnapshot('saveChagesShortcut');
  });
});
