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
describe('Topic Font Suite', () => {
  beforeEach(() => {
    // Remove storage for autosave ...
    cy.visit('/editor.html');
    cy.waitEditorLoaded();

    cy.focusTopicById(1);
  });

  it('Open Font Shape Panel', () => {
    cy.onMouseOverToolbarButton('Font Style');
    cy.matchImageSnapshot('fontShapePanel');
  });

  it('Change Main Topic Text', () => {
    cy.get('body').type('New Title Main Topic{enter}');
    cy.get('[test-id=1] > text > tspan').should('have.text', 'New Title Main Topic');
    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeMainTopicText');
  });

  it('Change Font Size', () => {
    // Go to the minimal size.
    cy.onMouseOverToolbarButton('Font Style');

    cy.get('[aria-label="Smaller"]').as('smaller');
    cy.get('@smaller').eq(1).click({ force: true });
    cy.get('@smaller').eq(1).click({ force: true });

    cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '8.1');
    cy.matchImageSnapshot('changeFontSizeSmall');

    cy.get('[aria-label="Bigger"]').as('bigger');
    cy.get('@bigger').eq(1).click({ force: true });
    cy.matchImageSnapshot('changeFontSizeNormal');

    cy.get('@bigger').eq(1).click({ force: true });
    cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '13.4');
    cy.matchImageSnapshot('changeFontSizeLarge');

    cy.get('@bigger').eq(1).click({ force: true });
    cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '20.2');
    cy.matchImageSnapshot('changeFontSizeHuge');

    cy.get('@bigger').eq(1).click({ force: true });
    cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '20.2');

    cy.matchImageSnapshot('changeFontSizeHuge');
  });

  it('Change Font To Italic', () => {
    cy.onMouseOverToolbarButton('Font Style');
    
    // Wait for the toolbar to be fully loaded
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    
    // Click the italic button
    cy.get('[aria-label*="Italic"]').first().click({ force: true });
    
    // Wait for the change to be applied
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    
    // Click away to close the toolbar and verify the change visually
    cy.contains('Mind Mapping').click({ force: true });
    cy.matchImageSnapshot('changeFontItalic');
  });

  it('Change Font to Bold', () => {
    cy.onMouseOverToolbarButton('Font Style');
    cy.get('[aria-label^="Bold ').first().click({ force: true });

    cy.get('[test-id=1] > text').invoke('attr', 'font-weight').should('eq', 'bold');

    cy.contains('Mind Mapping').click({ force: true });
    cy.matchImageSnapshot('changeFontBold');
  });

  it('Change Font Color', () => {
    cy.onMouseOverToolbarButton('Font Style');
    cy.get('[aria-label="Color"]').eq(1).click({ force: true });
    cy.get('[title="#cc0000"]').click({ force: true });

    cy.get('[test-id=1] > text').invoke('attr', 'fill').should('eq', '#cc0000');

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeFontColor');
  });
});
