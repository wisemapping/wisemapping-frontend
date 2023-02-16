/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

declare global {
  namespace Cypress {
    interface Chainable {
      waitForLoad(): void;
      waitEditorLoaded(): void;
      imageSnaphots(): void;

      focusTopicByText(value: string): void;
      focusTopicById(id: number): void;

      onMouseOverToolbarButton(value: 'Topic Style' | 'Font Style'): void;
      onClickToolbarButton(value: 'Add Relationship' | 'Add Icon'): void;

      triggerUndo(): void;
      triggerRedo(): void;
    }
  }
}
// make matchImageSnapshot() call the real implementation only if CYPRESS_imageSnaphots is set
// otherwise it calls a noop
if (Cypress.env('imageSnaphots')) {
  addMatchImageSnapshotCommand({
    failureThreshold: 0.001,
    failureThresholdType: 'percent',
  });
} else {
  Cypress.Commands.add(
    'matchImageSnapshot',
    {
      prevSubject: ['optional', 'element', 'window', 'document'],
    },
    () => Promise.resolve(),
  );
}

Cypress.Commands.add('waitEditorLoaded', () => {
  // Wait editor ...
  cy.get('svg > path').should('be.visible');
  cy.get('[aria-label="vortex-loading"]', { timeout: 120000 }).should('not.exist');
  cy.clearLocalStorage('welcome-xml');

  // Wait for font ...
  cy.document().its('fonts.status').should('equal', 'loaded');
});

Cypress.Commands.add('waitForLoad', () => {
  cy.document().its('fonts.status').should('equal', 'loaded');
});

// Mindmap commands ...
Cypress.Commands.add('focusTopicById', (id: number) => {
  cy.get(`[test-id=${id}]`).click();
});

Cypress.Commands.add('focusTopicByText', (text: string) => {
  cy.contains(text).click({ force: true });
});

Cypress.Commands.add('onMouseOverToolbarButton', (button: 'Topic Style' | 'Font Style') => {
  cy.get(`[aria-label="${button}"]`).first().trigger('mouseover');
});

Cypress.Commands.add('onClickToolbarButton', (button: 'Add Relationship' | 'Add Icon') => {
  cy.get(`[aria-label="${button}"]`).click({ multiple: true, force: true });
});

Cypress.Commands.add('triggerUndo', () => {
  cy.get('[aria-label^="Undo ').eq(1).click();
});

Cypress.Commands.add('triggerRedo', () => {
  cy.get('[aria-label^="Redo ').eq(1).click();
});
