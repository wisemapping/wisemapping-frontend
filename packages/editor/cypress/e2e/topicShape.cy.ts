/// <reference types="cypress" />
describe('Change Topic shape', () => {
  beforeEach(() => {
    cy.visit('/editor.html');

    // Wait all has been loaded ...
    cy.waitEditorLoaded();

    // Select one node ...
    cy.contains('Try it Now!').click();
  });

  it('open shape', () => {
    cy.get(`[aria-label="Topic Style"]`).first().trigger('mouseover');
    cy.matchImageSnapshot('topicShapePanel');
  });

  it('change to square shape', () => {
    cy.get(`[aria-label="Topic Style"]`).first().trigger('mouseover');
    cy.get(`[aria-label="Rectangle shape"]`).first().click();

    cy.get('[test-id=11] > rect')
      .eq(1)
      .invoke('attr', 'rx')
      .then(parseInt)
      .should('be.a', 'number')
      .should('eq', 0);

    cy.contains('Mind Mapping').click({ force: true });
    cy.matchImageSnapshot('changeToSquareShape');
  });

  it('change to rounded rectangle', () => {
    cy.contains('Mind Mapping').click();

    cy.get(`[aria-label="Topic Style"]`).first().trigger('mouseover');
    cy.get(`[aria-label="Rounded shape"]`).first().click();

    // Todo: Check how to validate this. Difference when it run in docker vs test:integration
    cy.get('[test-id=6] > rect')
      .eq(1)
      .invoke('attr', 'rx')
      .then(parseInt)
      .should('be.a', 'number')
      .should('be.gte', 4);
    cy.get('[test-id=6] > rect')
      .eq(1)
      .invoke('attr', 'rx')
      .then(parseInt)
      .should('be.a', 'number')
      .should('be.lt', 5);

    cy.contains('Mind Mapping').click({ force: true });
    cy.matchImageSnapshot('changeToRoundedRectangle');
  });

  it('change to line', () => {
    cy.contains('Try it Now!').click();

    cy.get(`[aria-label="Topic Style"]`).first().trigger('mouseover');
    cy.get(`[aria-label="Line shape"]`).first().click();

    cy.contains('Mind Mapping').click({ force: true });
    cy.matchImageSnapshot('changeToLine');
  });

  it('change to ellipse shape', () => {
    cy.contains('Productivity').click();

    cy.get(`[aria-label="Topic Style"]`).first().trigger('mouseover');
    cy.get(`[aria-label="Ellipse shape"]`).first().click();

    // Todo: Check how to validate this. Difference when it run in docker vs test:integration
    cy.get('[test-id=2] > rect')
      .eq(1)
      .invoke('attr', 'rx')
      .then(parseInt)
      .should('be.a', 'number')
      .should('be.gte', 12);
    cy.get('[test-id=2] > rect')
      .eq(1)
      .invoke('attr', 'rx')
      .then(parseInt)
      .should('be.a', 'number')
      .should('be.lt', 15);

    cy.contains('Mind Mapping').click({ force: true });
    cy.matchImageSnapshot('changeToEllipseShape');
  });
});
