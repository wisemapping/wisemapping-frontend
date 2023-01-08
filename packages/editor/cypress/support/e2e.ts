import './commands';

Cypress.Commands.add('waitEditorLoaded', () => {
  // Wait editor ...
  cy.get('svg > path').should('be.visible');
  cy.get('[aria-label="vortex-loading"]', { timeout: 120000 }).should('not.exist');
  cy.clearLocalStorage('welcome-xml');

  // Wait for font ...
  cy.document().its('fonts.status').should('equal', 'loaded');
});

Cypress.Commands.add('waitForLoad', () => {
  // Wait page be loaded...
  cy.document().its('fonts.status').should('equal', 'loaded');
});

Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'error');
  cy.spy(win.console, 'warn');
});

// afterEach(() => {
//   cy.window().then((win) => {
//     expect(win.console.error).to.have.callCount(0);
//     expect(win.console.warn).to.have.callCount(0);
//   });
// });
