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

// https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/
Cypress.Commands.add('getIframeBody', () =>
  cy.get('iframe').its('0.contentDocument.body').should('not.be.empty').then(cy.wrap),
);
