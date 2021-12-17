import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';
import '@testing-library/cypress/add-commands';

addMatchImageSnapshotCommand();

// make matchImageSnapshot() call the real implementation only if CYPRESS_imageSnaphots is set
// otherwise it calls a noop
if (Cypress.env('imageSnaphots')) {
    addMatchImageSnapshotCommand();
} else {
    Cypress.Commands.add(
        'matchImageSnapshot',
        {
            prevSubject: ['optional', 'element', 'window', 'document'],
        },
        () => Promise.resolve()
    );
}
