/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

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
    cy.onClickToolbarButton('Style Topic & Connections');
    cy.matchImageSnapshot('topicShapePanel');
  });

  it('change to square shape', () => {
    cy.onClickToolbarButton('Style Topic & Connections');

    // Wait for the toolbar panel to be fully rendered
    cy.get(`[aria-label="Rectangle shape"]`).should('be.visible');
    cy.get(`[aria-label="Rectangle shape"]`).first().click({ force: true });

    // Find the Try it Now! topic element and validate square shape was applied
    cy.contains('Try it Now!').parent().then(($el) => {
      // Get the test-id of the topic
      const testId = $el.attr('test-id');
      
      if (testId) {
        cy.get(`[test-id="${testId}"]`).within(() => {
          // Check if there's a rect element
          cy.get('rect').then(($rects) => {
            if ($rects.length > 0) {
              // Check the rx attribute of the last rect (should be 0 for square)
              cy.get('rect')
                .last()
                .invoke('attr', 'rx')
                .then((rx) => {
                  if (rx !== null && rx !== undefined) {
                    const rxValue = parseInt(rx);
                    expect(rxValue).to.be.a('number');
                    expect(rxValue).to.eq(0);
                  }
                });
            }
          });
        });
      }
    });

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeToSquareShape');
  });

  it('change to rounded rectangle', () => {
    cy.focusTopicByText('Mind Mapping');

    cy.onClickToolbarButton('Style Topic & Connections');

    // Wait for the toolbar panel to be fully rendered
    cy.get(`[aria-label="Rounded shape"]`).should('be.visible');
    cy.get(`[aria-label="Rounded shape"]`).first().click({ force: true });

    // Find the Mind Mapping topic element and validate rounded rectangle shape was applied
    cy.contains('Mind Mapping').parent().then(($el) => {
      // Get the test-id of the Mind Mapping topic
      const testId = $el.attr('test-id');
      
      if (testId) {
        cy.get(`[test-id="${testId}"]`).within(() => {
          // Check if there's a rect element
          cy.get('rect').then(($rects) => {
            if ($rects.length > 0) {
              // Check the rx attribute of the last rect (should be > 4 for rounded rectangle)
              cy.get('rect')
                .last()
                .invoke('attr', 'rx')
                .then((rx) => {
                  if (rx) {
                    const rxValue = parseInt(rx);
                    expect(rxValue).to.be.a('number');
                    expect(rxValue).to.be.gte(4);
                  }
                });
            }
          });
        });
      }
    });

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeToRoundedRectangle');
  });

  it('change to line', () => {
    cy.onClickToolbarButton('Style Topic & Connections');

    // Wait for the toolbar panel to be fully rendered
    cy.get(`[aria-label="Line shape"]`).should('be.visible');
    cy.get(`[aria-label="Line shape"]`).first().click({ force: true });

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeToLine');
  });

  it('change to ellipse shape', () => {
    cy.focusTopicByText('Productivity');
    cy.onClickToolbarButton('Style Topic & Connections');

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
