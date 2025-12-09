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

describe('Relationship Topics', () => {
  beforeEach(() => {
    // Remove storage for autosave ...
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it.skip('Add Relationship', () => {
    // Create new relationship ...
    cy.focusTopicByText('Features');
    cy.onClickToolbarButton('Add Relationship');

    cy.focusTopicByText('Try it Now!');

    cy.get('[test-id="15-11-relationship"]').as('rel');
    cy.get('@rel').click({ force: true });
    cy.get('@rel').should('exist');

    cy.matchImageSnapshot('addRelationship');

    // Undo relationship ...
    cy.get('[aria-label^="Undo ').eq(1).click();
    cy.get('@rel').should('not.exist');
  });

  it('Delete Relationship', () => {
    // Add new relationship ...
    cy.focusTopicByText('Features');
    cy.onClickToolbarButton('Add Relationship');
    cy.focusTopicByText('Try it Now!');

    // Delete it ...
    cy.get('[test-id="15-11-relationship"]').as('rel');
    cy.get('@rel').should('exist');
    cy.get('@rel').first().click({ force: true });

    cy.get('body').type('{backspace}');

    cy.get('@rel').should('not.exist');
    cy.matchImageSnapshot('delete relationship');

    // Undo relationship ...
    cy.triggerUndo();
    cy.get('@rel').should('exist');
  });

  it('Change Control Point', () => {
    // Create new relationship ...
    cy.focusTopicByText('Features');
    cy.onClickToolbarButton('Add Relationship');
    cy.focusTopicByText('Try it Now!');

    // Select relationship ...
    cy.get('[test-id="15-11-relationship"]').as('rel');
    cy.get('@rel').should('exist');
    cy.get('@rel').first().click({ force: true });

    // Move control point start ...
    cy.get('[test-id="relctl:0:15-11"]').first().trigger('mousedown', { force: true });
    cy.get('body').trigger('mousemove', { clientX: 350, clientY: 380 });
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('move ctl pont 0');

    // Move control point end ...
    cy.get('[test-id="relctl:1:15-11"]').first().trigger('mousedown', { force: true });
    cy.get('body').trigger('mousemove', { clientX: 350, clientY: 100 });
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('move ctl pont 1');

    // Test undo and redo ...
    cy.triggerUndo();
    cy.triggerUndo();
    cy.get('@rel').should('exist');
    cy.matchImageSnapshot('rel ctl undo');
  });
});
