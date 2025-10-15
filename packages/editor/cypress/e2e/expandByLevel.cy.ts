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
    
    // Click expand by level once - should expand level 1
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Wait for expand animation by verifying badge shows level 1 (replaces cy.wait(500))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '1');
    
    cy.matchImageSnapshot('expanded-to-level-1');
    
    // Click expand by level again - should expand level 2
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Wait for expand animation by verifying badge shows level 2 (replaces cy.wait(500))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '2');
    
    cy.matchImageSnapshot('expanded-to-level-2');
    
    // Click expand by level again - should expand level 3
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Wait for expand animation by verifying badge shows level 3 (replaces cy.wait(500))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '3');
    
    cy.matchImageSnapshot('expanded-to-level-3');
  });

  it('should show correct level badge number when expanding', () => {
    // Collapse all first
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    
    // Initially, no badge should be visible (level 0) - wait for collapse to complete (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').find('[class*="LevelBadge"]').should('not.exist');
    
    // Click to expand level 1
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Badge should show "1" - wait for expand to complete (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '1');
    
    // Click to expand level 2
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Badge should show "2" - wait for expand to complete (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '2');
  });

  it('should reset level to max when expand all is clicked', () => {
    // Collapse all nodes
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    
    // Wait for collapse to complete by checking badge is hidden (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').find('[class*="LevelBadge"]').should('not.exist');
    
    // Expand to level 1
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Wait for expand to complete by checking badge shows "1" (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '1');
    
    // Now expand all
    cy.get('button[aria-label="Expand All Nodes"]').should('be.visible').click({ force: true });
    
    // The badge should now show the max depth (not 999) - wait for expansion (replaces cy.wait(500))
    cy.get('button[aria-label="Expand by Level"]').should(($button) => {
      const text = $button.text();
      const level = parseInt(text);
      
      // Should be a reasonable number (not 999)
      expect(level).to.be.greaterThan(0);
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
    
    // Badge should show "1" - wait for expand to complete (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '1');
    
    // Use keyboard shortcut again
    cy.get('body').trigger('keydown', { key: 'e', metaKey: true, ctrlKey: false });
    
    // Badge should show "2" - wait for expand to complete (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '2');
    
    cy.matchImageSnapshot('expand-by-level-keyboard-shortcut');
  });

  it('should show smaller badge numbers that are readable', () => {
    // Collapse all nodes
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    
    // Wait for collapse to complete by checking badge text is gone (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('not.contain', /\d/);
    
    // Expand to level 1
    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    
    // Verify badge appears with level "1" - wait for expand to complete (replaces cy.wait(300))
    cy.get('button[aria-label="Expand by Level"]').should('contain', '1');
    
    // Verify the badge is visible and styled as a small indicator
    cy.get('button[aria-label="Expand by Level"]').within(() => {
      // The badge should be a small element overlaying the button
      cy.get('div').should(($divs) => {
        // Find the innermost div that contains just "1"
        const badgeDiv = $divs.filter((i, el) => {
          const $el = Cypress.$(el);
          return $el.text().trim() === '1' && $el.children().length === 0;
        }).first();
        
        // Badge should exist
        expect(badgeDiv.length).to.be.greaterThan(0);
      });
    });
    
    cy.matchImageSnapshot('expand-by-level-badge-styling');
  });
});

