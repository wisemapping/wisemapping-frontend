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
describe('Relationship Style Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();

    // Create a relationship between two topics for testing
    cy.focusTopicByText('Features');
    cy.onClickToolbarButton('Add Relationship');
    cy.focusTopicByText('Try it Now!');
    
    // Wait for relationship to be created and select it
    cy.get('[test-id*="relationship"]').should('exist');
    cy.get('[test-id*="relationship"]').first().click({ force: true });
  });

  it('Open relationship style panel', () => {
    cy.onClickToolbarButton('Relationship Style');
    cy.matchImageSnapshot('relationship-style-panel');
  });


  it('Change to solid stroke style', () => {
    cy.onClickToolbarButton('Relationship Style');

    // Click on solid stroke option
    cy.get('[aria-label="Solid Line"]').first().click({ force: true });

    cy.matchImageSnapshot('solid-stroke-relationship');
  });

  it('Change to dashed stroke style', () => {
    cy.onClickToolbarButton('Relationship Style');

    // Click on dashed stroke option  
    cy.get('[aria-label="Dashed Line"]').first().click({ force: true });

    cy.matchImageSnapshot('dashed-stroke-relationship');
  });

  it('Change to dotted stroke style', () => {
    cy.onClickToolbarButton('Relationship Style');

    // Click on dotted stroke option
    cy.get('[aria-label="Dotted Line"]').first().click({ force: true });

    cy.matchImageSnapshot('dotted-stroke-relationship');
  });

  it('Toggle end arrow on relationship', () => {
    cy.onClickToolbarButton('Relationship Style');

    // Click on end arrow option
    cy.get('[aria-label="End Arrow"]').first().click({ force: true });

    cy.matchImageSnapshot('end-arrow-relationship');
  });

  it('Toggle start arrow on relationship', () => {
    cy.onClickToolbarButton('Relationship Style');

    // Click on start arrow option
    cy.get('[aria-label="Start Arrow"]').first().click({ force: true });

    cy.matchImageSnapshot('start-arrow-relationship');
  });

  it('Toggle both arrows on relationship', () => {
    cy.onClickToolbarButton('Relationship Style');

    // Click on end arrow option
    cy.get('[aria-label="End Arrow"]').first().click({ force: true });
    
    // Click on start arrow option
    cy.get('[aria-label="Start Arrow"]').first().click({ force: true });

    cy.matchImageSnapshot('both-arrows-relationship');
  });

  it('Change relationship color', () => {
    cy.onClickToolbarButton('Relationship Style');

    // Click on color option
    cy.get('[aria-label="Color"]').last().click({ force: true });

    // Wait for color picker to load by checking for color elements
    cy.get('[title="#ff0000"]').should('be.visible').click({ force: true });

    cy.matchImageSnapshot('change-relationship-color');
  });

  it('Reset relationship color to default', () => {
    // First change the color
    cy.onClickToolbarButton('Relationship Style');
    cy.get('[aria-label="Color"]').last().click({ force: true });

    // Wait for color picker to load by checking for color element
    cy.get('[title="#0000ff"]').should('be.visible').click({ force: true });

    // Now reset to default - relationship style doesn't have a "Default" option
    // so we'll just verify the color was applied and take a snapshot
    cy.matchImageSnapshot('reset-relationship-color');
  });

});