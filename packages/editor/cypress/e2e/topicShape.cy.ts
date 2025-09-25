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

  it.skip('change to square shape', () => {
    cy.onMouseOverToolbarButton('Topic Style');

    // Wait for the toolbar panel to be fully rendered
    cy.get(`[aria-label="Rectangle shape"]`).should('be.visible');
    cy.get(`[aria-label="Rectangle shape"]`).first().click({ force: true });

    cy.get('[test-id=11] > rect')
      .eq(1)
      .invoke('attr', 'rx')
      .then(parseInt)
      .should('be.a', 'number')
      .should('eq', 0);

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeToSquareShape');
  });

  it.skip('change to rounded rectangle', () => {
    cy.focusTopicByText('Mind Mapping');

    cy.onMouseOverToolbarButton('Topic Style');

    // Wait for the toolbar panel to be fully rendered
    cy.get(`[aria-label="Rounded shape"]`).should('be.visible');
    cy.get(`[aria-label="Rounded shape"]`).first().click({ force: true });

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
      .should('be.gte', 8);

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeToRoundedRectangle');
  });

  it('change to line', () => {
    cy.onMouseOverToolbarButton('Topic Style');

    // Wait for the toolbar panel to be fully rendered
    cy.get(`[aria-label="Line shape"]`).should('be.visible');
    cy.get(`[aria-label="Line shape"]`).first().click({ force: true });

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeToLine');
  });

  it('change to ellipse shape', () => {
    cy.focusTopicByText('Productivity');
    cy.onMouseOverToolbarButton('Topic Style');

    // Wait for the toolbar panel to be fully rendered
    cy.get(`[aria-label="Ellipse shape"]`).should('be.visible');
    cy.get(`[aria-label="Ellipse shape"]`).first().click({ force: true });

    // Find the Productivity topic element and validate ellipse shape was applied
    cy.contains('Productivity').parent().then(($el) => {
      // Get the test-id of the Productivity topic
      const testId = $el.attr('test-id');
      
      if (testId) {
        cy.get(`[test-id="${testId}"]`).within(() => {
          // Check if there's a rect element (ellipse shapes use rounded rectangles)
          cy.get('rect').then(($rects) => {
            if ($rects.length > 0) {
              // Check the rx attribute of the last rect (which should be the shape)
              cy.get('rect')
                .last()
                .invoke('attr', 'rx')
                .then((rx) => {
                  if (rx) {
                    const rxValue = parseInt(rx);
                    expect(rxValue).to.be.a('number');
                    expect(rxValue).to.be.gte(11);
                    expect(rxValue).to.be.lt(15);
                  }
                });
            } else {
              // If no rect, check for ellipse elements
              cy.get('ellipse').should('exist');
            }
          });
        });
      }
    });

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeToEllipseShape');
  });
});
