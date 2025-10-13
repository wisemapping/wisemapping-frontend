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
describe('Topic Color Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();

    // Select a topic for testing
    cy.focusTopicById(3);
  });

  it('Open topic style panel', () => {
    cy.onClickToolbarButton('Style Topic & Connections');
    cy.matchImageSnapshot('topic-style-panel');
  });

  it('Change topic fill color', () => {
    cy.onClickToolbarButton('Style Topic & Connections');

    // The Shape tab should be open by default, which contains the fill color picker
    // Wait for panel to appear
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);

    // Click on fill color button
    cy.get('[aria-label="Color"]').first().click({ force: true });

    // Wait for color picker to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Select a color (red)
    cy.get('[title="#ff0000"]').click({ force: true });

    cy.matchImageSnapshot('change-topic-fill-color');
  });

  it('Change topic border color', () => {
    cy.onClickToolbarButton('Style Topic & Connections');

    // Click on Border tab
    cy.contains('Border').click({ force: true });

    // Click on border color button
    cy.get('[aria-label="Color"]').first().click({ force: true });

    // Wait for color picker to load
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // Select a color (blue)
    cy.get('[title="#0000ff"]').click({ force: true });

    cy.matchImageSnapshot('change-topic-border-color');
  });

  it('Reset topic fill color to default', () => {
    // First change the color
    cy.onClickToolbarButton('Style Topic & Connections');
    
    // The Shape tab should be open by default
    cy.get('[aria-label="Color"]').first().click({ force: true });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.get('[title="#ff0000"]').click({ force: true });

    // Now reset to default
    cy.onClickToolbarButton('Style Topic & Connections');
    
    // Click the default/reset button in the color picker
    cy.get('[aria-label="Default color"]').first().click({ force: true });

    cy.matchImageSnapshot('reset-topic-fill-color');
  });

  it('Reset topic border color to default', () => {
    // First change the border color
    cy.onClickToolbarButton('Style Topic & Connections');
    
    // Click on Border tab
    cy.contains('Border').click({ force: true });
    
    cy.get('[aria-label="Color"]').first().click({ force: true });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.get('[title="#0000ff"]').click({ force: true });

    // Now reset to default
    cy.onClickToolbarButton('Style Topic & Connections');
    
    // Click on Border tab again
    cy.contains('Border').click({ force: true });
    
    cy.get('[aria-label="Default color"]').first().click({ force: true });

    cy.matchImageSnapshot('reset-topic-border-color');
  });
});
