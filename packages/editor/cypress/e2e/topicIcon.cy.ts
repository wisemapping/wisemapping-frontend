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

  it('Verify image icons load correctly', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    // Wait for icon panel to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Verify that the icon panel is open and contains the "Icon" title
    cy.contains('Icon').should('be.visible');

    // Verify that images are loaded in the panel (this confirms webpack asset processing works)
    cy.get('img').should('have.length.gt', 0);

    // Check that at least one image has a src attribute (confirming image loading works)
    cy.get('img').first().should('have.attr', 'src').and('not.be.empty');

    // Test that icon functionality works by clicking on an icon
    cy.get('[aria-label="grinning"]').should('be.visible').click();

    // Take a snapshot to verify the test completes successfully
    cy.matchImageSnapshot('verify-icon-fix-works');
  });
});
