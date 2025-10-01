/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

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
