/// <reference types="cypress" />

import { css } from 'cypress/types/jquery';

describe('Relationship Topics', () => {
  beforeEach(() => {
    // Remove storage for autosave ...
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Add Relationship', () => {
    // Create new relationship ...
    cy.contains('Features').click({ force: true });
    cy.get(`[aria-label="Add Relationship"]`).click({ multiple: true });
    cy.onFocusTopicByText('Try it Now!');

    cy.get('[test-id="11-15-relationship"]').as('rel');
    cy.get('@rel').click({ force: true });
    cy.get('@rel').should('exist');

    cy.matchImageSnapshot('addRelationship');

    // Undo relationship ...
    cy.get('[aria-label^="Undo ').eq(1).click();
    cy.get('@rel').should('not.exist');
  });

  it('Delete Relationship', () => {
    // Add new relationship ...
    cy.contains('Features').first().click({ force: true });
    cy.get(`[aria-label="Add Relationship"]`).first().click();
    cy.contains('Try it Now!').first().click();

    // Delete it ...
    cy.get('[test-id="11-15-relationship"]').as('rel');
    cy.get('@rel').should('exist');
    cy.get('@rel').click({ force: true });

    cy.get('body').type('{backspace}');

    cy.get('@rel').should('not.exist');
    cy.matchImageSnapshot('delete relationship');

    // Undo relationship ...
    cy.get('[aria-label^="Undo ').eq(1).click();
    cy.get('@rel').should('exist');
  });

  it('Change Control Point', () => {
    // Create new relationship ...
    cy.onFocusTopicByText('Features');
    cy.get(`[aria-label="Add Relationship"]`).click({ multiple: true });
    cy.contains('Try it Now!').click();

    // Select relationship ...
    cy.get('[test-id="11-15-relationship"]').as('rel');
    cy.get('@rel').should('exist');
    cy.get('@rel').click({ force: true });

    // Move control point start ...
    cy.get('[test-id="relctl:0:11-15"]').first().trigger('mousedown');
    cy.get('body').trigger('mousemove', { clientX: 350, clientY: 380 });
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('move ctl pont 0');

    // Move control point end ...
    cy.get('[test-id="relctl:1:11-15"]').first().trigger('mousedown');
    cy.get('body').trigger('mousemove', { clientX: 350, clientY: 100 });
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('move ctl pont 1');

    // Test undo and redo ...
    cy.get('[aria-label^="Undo ').eq(1).click();
    cy.get('[aria-label^="Undo ').eq(1).click();
    cy.get('@rel').should('exist');
    cy.matchImageSnapshot('rel ctl undo');
  });
});
