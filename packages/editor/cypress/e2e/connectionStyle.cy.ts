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
describe('Connection Style Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();

    // Focus on the central topic which has connections to child topics
    cy.focusTopicByText('Mind Mapping');
  });

  it('Open connection style panel', () => {
    cy.onClickToolbarButton('Style Topic & Connections');
    
    // Wait for the panel to open and then click the Connector tab
    cy.contains('Connector').should('be.visible').click({ force: true });
    
    cy.matchImageSnapshot('connection-style-panel');
  });

  it('Change to thick curved connection', () => {
    cy.onClickToolbarButton('Style Topic & Connections');
    

    // Wait for the panel to open and then click the Connector tab
    cy.contains('Connector').should('be.visible').click({ force: true });

    // Click on thick curved option
    cy.get('[aria-label="Thick Curved"]').should('be.visible').first().click({ force: true });

    cy.matchImageSnapshot('thick-curved-connection');
  });

  it('Change to arc connection', () => {
    cy.onClickToolbarButton('Style Topic & Connections');
    
    // Wait for the panel to open and then click the Connector tab
    cy.contains('Connector').should('be.visible').click({ force: true });

    // Click on arc option
    cy.get('[aria-label="Arc"]').should('be.visible').first().click({ force: true });

    cy.matchImageSnapshot('arc-connection');
  });

  it('Change to thin curved connection', () => {
    cy.onClickToolbarButton('Style Topic & Connections');
    
    // Wait for the panel to open and then click the Connector tab
    cy.contains('Connector').should('be.visible').click({ force: true });

    // Click on thin curved option
    cy.get('[aria-label="Thin Curved"]').should('be.visible').first().click({ force: true });

    cy.matchImageSnapshot('thin-curved-connection');
  });

  it('Change to simple polyline connection', () => {
    cy.onClickToolbarButton('Style Topic & Connections');
    
    // Wait for the panel to open and then click the Connector tab
    cy.contains('Connector').should('be.visible').click({ force: true });

    // Click on simple polyline option
    cy.get('[aria-label="Simple Polyline"]').should('be.visible').first().click({ force: true });

    cy.matchImageSnapshot('simple-polyline-connection');
  });

  it('Change to curved polyline connection', () => {
    cy.onClickToolbarButton('Style Topic & Connections');
    
    // Wait for the panel to open and then click the Connector tab
    cy.contains('Connector').should('be.visible').click({ force: true });

    // Click on curved polyline option
    cy.get('[aria-label="Curved Polyline"]').should('be.visible').first().click({ force: true });

    cy.matchImageSnapshot('curved-polyline-connection');
  });

  it('Change connection color', () => {
    cy.onClickToolbarButton('Style Topic & Connections');
    
    // Wait for the panel to open and then click the Connector tab
    cy.contains('Connector').should('be.visible').click({ force: true });

    // First select a non-default connection style to make color picker visible
    // Click on thick curved connection style
    cy.get('[aria-label="Thick Curved"]').should('be.visible').first().click({ force: true });

    // Wait for color picker to appear
    cy.get('[title="#cc0000"]').should('be.visible');

    // Select a color (green)
    cy.get('[title="#00ff00"]').click({ force: true });

    cy.matchImageSnapshot('change-connection-color');
  });

  it('Reset connection color to default', () => {
    // First change the color
    cy.onClickToolbarButton('Style Topic & Connections');
    
    // Wait for the panel to open and then click the Connector tab
    cy.contains('Connector').should('be.visible').click({ force: true });
    
    // Select a connection style first to make color picker visible
    cy.get('[aria-label="Thick Curved"]').should('be.visible').first().click({ force: true });

    // Wait for color picker to appear
    cy.get('[title="#cc0000"]').should('be.visible');

    // Select a color (red)
    cy.get('[title="#ff0000"]').click({ force: true });

    // Now reset to default - click the Connector tab again to ensure focus
    cy.contains('Connector').click({ force: true });
    
    // Click the default connection style option
    cy.get('[aria-label="Default"]').first().click({ force: true });

    cy.matchImageSnapshot('reset-connection-color');
  });
});
