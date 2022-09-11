import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';
import '@testing-library/cypress/add-commands';

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
