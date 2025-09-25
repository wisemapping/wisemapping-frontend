/// <reference types="cypress" />
describe('Connection Style Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();

    // Focus on a topic that has connections
    cy.focusTopicById(11);
  });

  it('Open connection style panel', () => {
    cy.onClickToolbarButton('Connection Style');
    cy.matchImageSnapshot('connection-style-panel');
  });

  it('Change to thick curved connection', () => {
    cy.onMouseOverToolbarButton('Connection Style');

    // Click on thick curved option
    cy.get('[aria-label="Thick Curved"]').first().click({ force: true });

    // Verify the connection style changed - look for relationship elements
    cy.get('[test-id*="relationship"]').should('exist');

    cy.matchImageSnapshot('thick-curved-connection');
  });

  it('Change to arc connection', () => {
    cy.onMouseOverToolbarButton('Connection Style');

    // Click on arc option
    cy.get('[aria-label="Arc"]').first().click({ force: true });

    cy.matchImageSnapshot('arc-connection');
  });

  it('Change to thin curved connection', () => {
    cy.onMouseOverToolbarButton('Connection Style');

    // Click on thin curved option
    cy.get('[aria-label="Thin Curved"]').first().click({ force: true });

    cy.matchImageSnapshot('thin-curved-connection');
  });

  it('Change to simple polyline connection', () => {
    cy.onMouseOverToolbarButton('Connection Style');

    // Click on simple polyline option
    cy.get('[aria-label="Simple Polyline"]').first().click({ force: true });

    cy.matchImageSnapshot('simple-polyline-connection');
  });

  it('Change to curved polyline connection', () => {
    cy.onMouseOverToolbarButton('Connection Style');

    // Click on curved polyline option
    cy.get('[aria-label="Curved Polyline"]').first().click({ force: true });

    cy.matchImageSnapshot('curved-polyline-connection');
  });

  it('Change connection color', () => {
    cy.onMouseOverToolbarButton('Connection Style');

    // Click on color option
    cy.get('[aria-label="Color"]').last().click({ force: true });

    // Wait for color picker to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Select a color (green) - use title attribute like in font color test
    cy.get('[title="#00ff00"]').click({ force: true });

    cy.matchImageSnapshot('change-connection-color');
  });

  it('Reset connection color to default', () => {
    // First change the color
    cy.onMouseOverToolbarButton('Connection Style');
    cy.get('[aria-label="Color"]').last().click({ force: true });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Select a color (red) - use title attribute like in font color test
    cy.get('[title="#ff0000"]').click({ force: true });

    // Now reset to default
    cy.onMouseOverToolbarButton('Connection Style');
    cy.get('[aria-label="Default color"]').first().click({ force: true });

    cy.matchImageSnapshot('reset-connection-color');
  });
});
