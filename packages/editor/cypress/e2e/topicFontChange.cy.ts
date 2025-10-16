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

  it('Change Font Size', () => {
    // Open font style panel
    cy.onClickToolbarButton('Font Style');
    
    // Wait for font size controls to be visible
    cy.get('[aria-label="Smaller"]').should('be.visible').and('not.be.disabled').as('smaller');
    cy.get('[aria-label="Bigger"]').should('be.visible').and('not.be.disabled').as('bigger');
    
    // Get initial font size
    cy.get('[test-id=1] > text').invoke('attr', 'font-size').then((initialSize) => {
      const initial = parseFloat(initialSize as string);
      
      // Decrease font size once
      cy.get('@smaller').first().click({ force: true });
      cy.get('[test-id=1] > text').invoke('attr', 'font-size').should((newSize) => {
        expect(parseFloat(newSize as string)).to.be.lessThan(initial);
      });
      cy.matchImageSnapshot('changeFontSizeSmaller');
      
      // Decrease font size again
      cy.get('@smaller').first().click({ force: true });
      cy.get('[test-id=1] > text').invoke('attr', 'font-size').then((smallestSize) => {
        const smallest = parseFloat(smallestSize as string);
        expect(smallest).to.be.lessThan(initial);
        cy.matchImageSnapshot('changeFontSizeSmall');
        
        // Increase font size back
        cy.get('@bigger').first().click({ force: true });
        cy.get('[test-id=1] > text').invoke('attr', 'font-size').should((newSize) => {
          expect(parseFloat(newSize as string)).to.be.greaterThan(smallest);
        });
        cy.matchImageSnapshot('changeFontSizeNormal');
        
        // Increase to large size
        cy.get('@bigger').first().click({ force: true });
        cy.get('[test-id=1] > text').invoke('attr', 'font-size').should((newSize) => {
          const large = parseFloat(newSize as string);
          expect(large).to.be.greaterThan(smallest);
          expect(large).to.be.at.least(13.0); // Should be at least 13.0 (could be 13.4 for size 10)
        });
        cy.matchImageSnapshot('changeFontSizeLarge');
        
        // Increase to huge size
        cy.get('@bigger').first().click({ force: true });
        cy.get('[test-id=1] > text').invoke('attr', 'font-size').should((newSize) => {
          const huge = parseFloat(newSize as string);
          expect(huge).to.be.at.least(20.0); // Should be at least 20.0 (could be 20.2 for size 15)
        });
        cy.matchImageSnapshot('changeFontSizeHuge');
        
        // Try to increase beyond maximum (should stay at max)
        cy.get('@bigger').first().click({ force: true });
        cy.get('[test-id=1] > text').invoke('attr', 'font-size').should((newSize) => {
          const stillHuge = parseFloat(newSize as string);
          expect(stillHuge).to.be.at.least(20.0); // Should remain at maximum
        });
        cy.matchImageSnapshot('changeFontSizeMaxReached');
      });
    });
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

  it('Change Font to Bold', () => {
    cy.onClickToolbarButton('Font Style');
    
    // Wait for bold button to be available
    cy.get('[aria-label*="Bold"]').should('be.visible').and('not.be.disabled').as('boldButton');
    
    // Get initial font weight to determine current state
    cy.get('[test-id=1] > text').invoke('attr', 'font-weight').then((initialWeight) => {
      const isBold = initialWeight === '900';
      
      if (!isBold) {
        // If not bold, click to make it bold
        cy.get('@boldButton').first().click({ force: true });
        cy.get('[test-id=1] > text').should('have.attr', 'font-weight', '900');
      } else {
        // If already bold, click twice (toggle off then on) to ensure bold state
        cy.get('@boldButton').first().click({ force: true });
        cy.get('[test-id=1] > text').should('have.attr', 'font-weight', '600');
        cy.get('@boldButton').first().click({ force: true });
        cy.get('[test-id=1] > text').should('have.attr', 'font-weight', '900');
      }
      
      // Click away to close the toolbar and verify the change visually
      cy.contains('Mind Mapping').click({ force: true });
      cy.matchImageSnapshot('changeFontBold');
    });
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

  it('Reset to Default hides all font options', () => {
    cy.onClickToolbarButton('Font Style');
    
    // Change font family first to make Reset button visible
    cy.get('[role="combobox"]').should('be.visible').click({ force: true });
    cy.contains('Verdana').click({ force: true });

    // Reset to Default button should now be visible
    cy.contains('Reset to Default').should('be.visible').click({ force: true });

    // After reset, the Reset to Default button should not be visible
    cy.contains('Reset to Default').should('not.exist');

    cy.matchImageSnapshot('reset-font-to-default');
  });
});
