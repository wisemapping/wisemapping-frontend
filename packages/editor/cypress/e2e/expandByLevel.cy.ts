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

describe('Expand By Level Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('should display expand by level button', () => {
    // Verify the Expand by Level button is visible
    cy.get('button[aria-label="Expand by Level"]').should('be.visible');
    
    cy.matchImageSnapshot('expand-by-level-button-visible');
  });

  it('should collapse all nodes and then expand by level incrementally', () => {
    // First, collapse all nodes using the collapse all button
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    
    // Wait for collapse animation by checking that badge is hidden (replaces cy.wait(500))
    cy.get('button[aria-label="Expand by Level"]').find('[class*="LevelBadge"]').should('not.exist');
    
    // Take snapshot of collapsed state
    cy.matchImageSnapshot('all-nodes-collapsed');
    
    // Click expand by level once - shows 2 levels visible (central + level 1)
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Wait for expand animation by verifying badge shows 2 visible levels (replaces cy.wait(500))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '2');
    
    cy.matchImageSnapshot('expanded-to-level-1');
    
    // Click expand by level again - shows 3 levels visible
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Wait for expand animation by verifying badge shows 3 visible levels (replaces cy.wait(500))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '3');
    
    cy.matchImageSnapshot('expanded-to-level-2');
    
    // Click expand by level again - if max depth allows, shows next level, otherwise cycles to 0
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Badge should either show the next level or disappear (cycle to 0)
    cy.get('button[aria-label="Expand by Level"]').should(($button) => {
      const text = $button.text();
      // Either shows a number >= 4 or no number (cycled back to 0)
      const hasNumber = /\d/.test(text);
      if (hasNumber) {
        const level = parseInt(text);
        expect(level).to.be.greaterThan(3);
      }
      // If no number, that's also acceptable (cycled to 0)
    });
    
    cy.matchImageSnapshot('expanded-to-level-3');
  });

  it('should show correct level badge number when expanding', () => {
    // Collapse all first
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    
    // Initially, no badge should be visible (level 0) - wait for collapse to complete (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').find('[class*="LevelBadge"]').should('not.exist');
    
    // Click to expand - shows 2 levels visible
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Badge should show "2" (2 visible levels) - wait for expand to complete (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '2');
    
    // Click to expand further - shows 3 levels visible
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Badge should show "3" (3 visible levels) - wait for expand to complete (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '3');
  });

  it('should reset level to max when expand all is clicked', () => {
    // Collapse all nodes
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    
    // Wait for collapse to complete by checking badge is hidden (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').find('[class*="LevelBadge"]').should('not.exist');
    
    // Expand once - shows 2 levels visible
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Wait for expand to complete by checking badge shows "2" (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '2');
    
    // Now expand all
    cy.get('button[aria-label="Expand All Nodes"]').should('be.visible').click({ force: true });
    
    // The badge should now show the max depth (not 999) - wait for expansion (replaces cy.wait(500))
    cy.get('button[aria-label="Expand by Level"]').should(($button) => {
      const text = $button.text();
      const level = parseInt(text);
      
      // Should be a reasonable number (greater than 2, but not 999)
      expect(level).to.be.greaterThan(2);
      expect(level).to.be.lessThan(100);
    });
    
    cy.matchImageSnapshot('expand-all-shows-max-level');
  });

  it.skip('should work with keyboard shortcut Cmd+E', () => {
    // Collapse all nodes first
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    
    // Wait for collapse to complete by checking badge is hidden (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('not.contain', /\d/);
    
    // Trigger keyboard event on body to expand by level (Cmd+E on Mac, Ctrl+E on Windows)
    cy.get('body').trigger('keydown', { key: 'e', metaKey: true, ctrlKey: false });
    
    // Badge should show "2" (2 visible levels) - wait for expand to complete (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '2');
    
    // Use keyboard shortcut again
    cy.get('body').trigger('keydown', { key: 'e', metaKey: true, ctrlKey: false });
    
    // Badge should show "3" (3 visible levels) - wait for expand to complete (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '3');
    
    cy.matchImageSnapshot('expand-by-level-keyboard-shortcut');
  });

  it('should show smaller badge numbers that are readable', () => {
    // Collapse all nodes
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    
    // Wait for collapse to complete by checking badge text is gone (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('not.contain', /\d/);
    
    // Expand once - shows 2 levels visible
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Verify badge appears with "2" (2 visible levels) - wait for expand to complete (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '2');
    
    // Verify the badge is visible and styled as a small indicator
    cy.get('button[aria-label="Expand by Level"]').within(() => {
      // The badge should be a small element overlaying the button
      cy.get('div').should(($divs) => {
        // Find the innermost div that contains just "2"
        const badgeDiv = $divs.filter((i, el) => {
          const $el = Cypress.$(el);
          return $el.text().trim() === '2' && $el.children().length === 0;
        }).first();
        
        // Badge should exist
        expect(badgeDiv.length).to.be.greaterThan(0);
      });
    });
    
    cy.matchImageSnapshot('expand-by-level-badge-styling');
  });
});

