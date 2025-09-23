/// <reference types="cypress" />
describe('Topic Color Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();

    // Select a topic for testing
    cy.focusTopicById(3);
  });

  it('Open topic style panel', () => {
    cy.onMouseOverToolbarButton('Topic Style');
    cy.matchImageSnapshot('topic-style-panel');
  });

  it.skip('Change topic fill color', () => {
    cy.onMouseOverToolbarButton('Topic Style');

    // Click on fill color button
    cy.get('[aria-label="Fill color"]').first().click();

    // Wait for color picker to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Get the current color before changing
    cy.get('[test-id="3"] > rect').invoke('attr', 'fill').as('originalColor');

    // Select a color - try multiple approaches for color selection
    cy.get('body').then(($body) => {
      if ($body.find('[title="#ff0000"]').length > 0) {
        cy.get('[title="#ff0000"]').click({ force: true });
      } else if ($body.find('[title="#FF0000"]').length > 0) {
        cy.get('[title="#FF0000"]').click({ force: true });
      } else if ($body.find('[style*="background: rgb(255, 0, 0)"]').length > 0) {
        cy.get('[style*="background: rgb(255, 0, 0)"]').first().click({ force: true });
      } else {
        // Fallback: click any color that's not the current one
        cy.get('[title^="#"], [style*="background: rgb"]').first().click({ force: true });
      }
    });

    // Wait a bit for the color change to take effect
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);

    // Verify the topic color changed (not equal to original)
    cy.get('@originalColor').then((originalColor) => {
      cy.get('[test-id="3"] > rect').should('have.attr', 'fill').and('not.equal', originalColor);
    });

    cy.matchImageSnapshot('change-topic-fill-color');
  });

  it.skip('Change topic border color', () => {
    cy.onMouseOverToolbarButton('Topic Style');

    // Click on border color button
    cy.get('[aria-label="Border color"]').first().click();

    // Wait for color picker to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Get the current border color before changing
    cy.get('[test-id="3"] > rect').invoke('attr', 'stroke').as('originalBorderColor');

    // Select a color - try multiple approaches for color selection
    cy.get('body').then(($body) => {
      if ($body.find('[title="#0000ff"]').length > 0) {
        cy.get('[title="#0000ff"]').click({ force: true });
      } else if ($body.find('[title="#0000FF"]').length > 0) {
        cy.get('[title="#0000FF"]').click({ force: true });
      } else if ($body.find('[style*="background: rgb(0, 0, 255)"]').length > 0) {
        cy.get('[style*="background: rgb(0, 0, 255)"]').first().click({ force: true });
      } else {
        // Fallback: click any color that's not the current one
        cy.get('[title^="#"], [style*="background: rgb"]').first().click({ force: true });
      }
    });

    // Wait a bit for the color change to take effect
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);

    // Verify the topic border color changed (not equal to original)
    cy.get('@originalBorderColor').then((originalBorderColor) => {
      cy.get('[test-id="3"] > rect')
        .should('have.attr', 'stroke')
        .and('not.equal', originalBorderColor);
    });

    cy.matchImageSnapshot('change-topic-border-color');
  });

  it('Reset topic fill color to default', () => {
    // First change the color
    cy.onMouseOverToolbarButton('Topic Style');
    cy.get('[aria-label="Fill color"]').first().click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.get('[title="#ff0000"]').click({ force: true });

    // Now reset to default
    cy.onMouseOverToolbarButton('Topic Style');
    cy.get('[aria-label="Default fill color"]').first().click();

    cy.matchImageSnapshot('reset-topic-fill-color');
  });

  it('Reset topic border color to default', () => {
    // First change the border color
    cy.onMouseOverToolbarButton('Topic Style');
    cy.get('[aria-label="Border color"]').first().click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.get('[title="#0000ff"]').click({ force: true });

    // Now reset to default
    cy.onMouseOverToolbarButton('Topic Style');
    cy.get('[aria-label="Default border color"]').first().click();

    cy.matchImageSnapshot('reset-topic-border-color');
  });
});
