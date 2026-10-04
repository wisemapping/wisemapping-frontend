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
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
  });

  it('should display expand by level button', () => {
    cy.get('button[aria-label="Expand by Level"]').should('be.visible');
    cy.matchImageSnapshot('expand-by-level-button-visible');
  });

  it('should collapse all nodes and then expand by level incrementally', () => {
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    cy.get('button[aria-label="Expand by Level"]').find('[class*="LevelBadge"]').should('not.exist');
    cy.matchImageSnapshot('all-nodes-collapsed');

    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    cy.get('[data-testid="expand-level-badge"]').should('be.visible').and('contain', '2');
    cy.matchImageSnapshot('expanded-to-level-1');

    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    cy.get('[data-testid="expand-level-badge"]').should('be.visible').and('contain', '3');
    cy.matchImageSnapshot('expanded-to-level-2');

    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    cy.get('button[aria-label="Expand by Level"]').should(($button) => {
      const text = $button.text();
      const hasNumber = /\d/.test(text);
      if (hasNumber) {
        const level = Number.parseInt(text, 10);
        expect(level).to.be.greaterThan(3);
      }
    });
    cy.matchImageSnapshot('expanded-to-level-3');
  });

  it('should show correct level badge number when expanding', () => {
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    cy.get('button[aria-label="Expand by Level"]').find('[class*="LevelBadge"]').should('not.exist');

    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    cy.get('[data-testid="expand-level-badge"]').should('be.visible').and('contain', '2');

    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    cy.get('[data-testid="expand-level-badge"]').should('be.visible').and('contain', '3');
  });

  it('should reset level to max when expand all is clicked', () => {
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    cy.get('button[aria-label="Expand by Level"]').find('[class*="LevelBadge"]').should('not.exist');

    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    cy.get('[data-testid="expand-level-badge"]').should('be.visible').and('contain', '2');

    cy.get('button[aria-label="Expand All Nodes"]').should('be.visible').click({ force: true });
    cy.get('[data-testid="expand-level-badge"]').should('be.visible').and(($badge) => {
      const text = $badge.text();
      const level = Number.parseInt(text, 10);
      expect(level).to.be.greaterThan(2);
      expect(level).to.be.lessThan(100);
    });
    cy.matchImageSnapshot('expand-all-shows-max-level');
  });

  it.skip('should work with keyboard shortcut Cmd+E', () => {
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    cy.get('button[aria-label="Expand by Level"]').should('not.contain', /\d/);

    cy.get('body').trigger('keydown', { key: 'e', metaKey: true, ctrlKey: false });
    cy.get('[data-testid="expand-level-badge"]').should('be.visible').and('contain', '2');

    cy.get('body').trigger('keydown', { key: 'e', metaKey: true, ctrlKey: false });
    cy.get('[data-testid="expand-level-badge"]').should('be.visible').and('contain', '3');
    cy.matchImageSnapshot('expand-by-level-keyboard-shortcut');
  });

  it('should show smaller badge numbers that are readable', () => {
    cy.get('button[aria-label="Collapse All Nodes"]').should('be.visible').click({ force: true });
    cy.get('button[aria-label="Expand by Level"]').should('not.contain', /\d/);

    cy.get('button[aria-label="Expand by Level"]').click({ force: true });
    cy.get('[data-testid="expand-level-badge"]').should('be.visible').and('contain', '2');

    cy.get('button[aria-label="Expand by Level"]').within(() => {
      cy.get('div').should(($divs) => {
        const badgeDiv = $divs
          .filter((_, el) => {
            const $el = Cypress.$(el);
            return $el.text().trim() === '2' && $el.children().length === 0;
          })
          .first();
        expect(badgeDiv.length).to.be.greaterThan(0);
      });
    });
    cy.matchImageSnapshot('expand-by-level-badge-styling');
  });
});

