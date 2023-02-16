/// <reference types="cypress" />
describe('Topic Icon Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Open panel', () => {
    cy.onClickToolbarButton('Add Icon');
    // Icon images must be loaded. No better solution than wait.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);
    cy.matchImageSnapshot('icons-pannel');
  });

  it('Add new icon', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    cy.get('[aria-label="grinning"]').click();
    cy.matchImageSnapshot('add-new-icon');
  });
});
