/// <reference types="cypress" />

import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

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
Cypress.Commands.add('onFocusTopicById', (id: number) => {
  cy.get(`[test-id=${id}]`).click();
});

Cypress.Commands.add('onFocusTopicByText', (text: string) => {
  cy.contains(text).click({ force: true });
});
