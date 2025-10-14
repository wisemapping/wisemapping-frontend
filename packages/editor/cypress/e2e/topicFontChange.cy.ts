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
    cy.onClickToolbarButton('Font Style');
    cy.matchImageSnapshot('fontShapePanel');
  });

  it('Change Main Topic Text', () => {
    cy.get('body').type('New Title Main Topic{enter}');
    cy.get('[test-id=1] > text > tspan').should('have.text', 'New Title Main Topic');
    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeMainTopicText');
  });

  it.skip('Change Font Size', () => {
    // Go to the minimal size.
    cy.onClickToolbarButton('Font Style');
    
    // Wait for font size controls to be visible and clickable
    cy.get('[aria-label="Smaller"]').should('be.visible').and('not.be.disabled').as('smaller');
    cy.get('@smaller').first().click({ force: true });
    
    // Wait for the first click to take effect before the second click
    cy.get('[test-id=1] > text').should('have.attr', 'font-size');
    cy.get('@smaller').first().click({ force: true });

    // Wait for final font size and verify
    cy.get('[test-id=1] > text').should('have.attr', 'font-size').then(($el) => {
      const fontSize = $el.attr('font-size');
      expect(parseFloat(fontSize)).to.be.lessThan(12); // Should be smaller than default
    });
    cy.matchImageSnapshot('changeFontSizeSmall');

    cy.get('[aria-label="Bigger"]').as('bigger');
    cy.get('@bigger').first().click({ force: true });
    cy.matchImageSnapshot('changeFontSizeNormal');

    cy.get('@bigger').first().click({ force: true });
    cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '13.4');
    cy.matchImageSnapshot('changeFontSizeLarge');

    cy.get('@bigger').first().click({ force: true });
    cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '20.2');
    cy.matchImageSnapshot('changeFontSizeHuge');

    cy.get('@bigger').first().click({ force: true });
    cy.get('[test-id=1] > text').invoke('attr', 'font-size').should('eq', '20.2');

    cy.matchImageSnapshot('changeFontSizeHuge');
  });

  it('Change Font To Italic', () => {
    cy.onClickToolbarButton('Font Style');
    
    // Wait for italic button to be available and click it
    cy.get('[aria-label*="Italic"]').should('be.visible').and('not.be.disabled').first().click({ force: true });
    
    // Wait for the text element to be updated with italic style
    cy.get('[test-id=1] > text').should('have.attr', 'font-style', 'italic');
    
    // Click away to close the toolbar and verify the change visually
    cy.contains('Mind Mapping').click({ force: true });
    cy.matchImageSnapshot('changeFontItalic');
  });

  it.skip('Change Font to Bold', () => {
    cy.onClickToolbarButton('Font Style');
    cy.get('[aria-label*="Bold"]').should('be.visible').and('not.be.disabled').first().click({ force: true });

    cy.get('[test-id=1] > text').invoke('attr', 'font-weight').should('eq', '900');

    cy.contains('Mind Mapping').click({ force: true });
    cy.matchImageSnapshot('changeFontBold');
  });

  it('Change Font Color', () => {
    cy.onClickToolbarButton('Font Style');
    // Wait for the color picker to be visible and color options to be available
    cy.contains('Font Color').should('be.visible');
    cy.get('[title="#cc0000"]').should('be.visible').and('be.enabled').click({ force: true });

    // Wait for the color change to be applied to the text element
    cy.get('[test-id=1] > text').should('have.attr', 'fill', '#cc0000');

    cy.focusTopicByText('Mind Mapping');
    cy.matchImageSnapshot('changeFontColor');
  });
});
