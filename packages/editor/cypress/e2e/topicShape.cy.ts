/// <reference types="cypress" />
describe('Topic Shape Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');

    // Wait all has been loaded ...
    cy.waitEditorLoaded();

    // Select one node ...
    cy.focusTopicByText('Try it Now!');
  });

  it('open shape', () => {
    cy.onMouseOverToolbarButton('Topic Style');
    cy.matchImageSnapshot('topicShapePanel');
  });

  it('change to square shape', () => {
    cy.onMouseOverToolbarButton('Topic Style');
    cy.get(`[aria-label="Rectangle shape"]`).first().click();

    cy.get('[test-id=11] > rect')
      .eq(1)
      .invoke('attr', 'rx')
      .then(parseInt)
      .should('be.a', 'number')
      .should('eq', 0);

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeToSquareShape');
  });

  it('change to rounded rectangle', () => {
    cy.focusTopicByText('Mind Mapping');

    cy.onMouseOverToolbarButton('Topic Style');
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
      .should('be.eq', 8);

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeToRoundedRectangle');
  });

  it('change to line', () => {
    cy.onMouseOverToolbarButton('Topic Style');
    cy.get(`[aria-label="Line shape"]`).first().click();

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeToLine');
  });

  it('change to ellipse shape', () => {
    cy.focusTopicByText('Productivity');
    cy.onMouseOverToolbarButton('Topic Style');

    cy.get(`[aria-label="Ellipse shape"]`).first().click();

    // Todo: Check how to validate this. Difference when it run in docker vs test:integration
    cy.get('[test-id=2] > rect')
      .eq(1)
      .invoke('attr', 'rx')
      .then(parseInt)
      .should('be.a', 'number')
      .should('be.gte', 11);
    cy.get('[test-id=2] > rect')
      .eq(1)
      .invoke('attr', 'rx')
      .then(parseInt)
      .should('be.a', 'number')
      .should('be.lt', 15);

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeToEllipseShape');
  });
});
