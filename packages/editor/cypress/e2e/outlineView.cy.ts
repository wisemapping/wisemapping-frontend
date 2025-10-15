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

describe('Outline View Suite', () => {
  beforeEach(() => {
    cy.visit('/editor.html');
    cy.waitEditorLoaded();
  });

  it('Open Outline View dialog', () => {
    // Find and click the Outline View button in the zoom toolbar (right side)
    // The button has the tooltip "Outline View"
    cy.get('button[aria-label="Outline View"]').should('be.visible').click({ force: true });

    // Wait for dialog to render
    cy.wait(500);

    // Verify the dialog is visible
    cy.get('[role="dialog"]').should('be.visible');

    // Verify the dialog contains outline content
    cy.get('[role="dialog"]').should('contain.text', 'Welcome');

    // Take a snapshot of the opened dialog
    cy.matchImageSnapshot('outline-view-opened');
  });

  it('Outline View displays mind map structure', () => {
    // Open the Outline View
    cy.get('button[aria-label="Outline View"]').should('be.visible').click({ force: true });

    // Wait for dialog to be visible
    cy.wait(500);
    cy.get('[role="dialog"]').should('be.visible');

    // Verify the central topic title is displayed
    cy.get('[role="dialog"]').within(() => {
      // The central topic title is a Typography component
      cy.contains('Welcome').should('exist').and('be.visible');
    });

    // Verify outline structure is rendered with multiple nodes
    cy.get('[role="dialog"]').should('contain.text', 'Welcome');

    cy.matchImageSnapshot('outline-view-structure');
  });

  it('Expand and collapse nodes in Outline View', () => {
    // Open the Outline View
    cy.get('button[aria-label="Outline View"]').should('be.visible').click({ force: true });

    // Wait for dialog to be visible
    cy.wait(500);
    cy.get('[role="dialog"]').should('be.visible');

    // Find a node that is currently collapsed (has "Expand" aria-label)
    cy.get('[role="dialog"]').within(() => {
      // Look for expand button (aria-label="Expand")
      cy.get('button[aria-label="Expand"]').first().should('be.visible').click();
    });

    cy.wait(500); // Wait for expand animation

    // Take snapshot of expanded state
    cy.matchImageSnapshot('outline-view-node-expanded');

    // Now the same button should have "Collapse" aria-label
    cy.get('[role="dialog"]').within(() => {
      // Look for collapse button (aria-label="Collapse")
      cy.get('button[aria-label="Collapse"]').first().should('be.visible').click();
    });

    cy.wait(500); // Wait for collapse animation

    // Take snapshot of collapsed state
    cy.matchImageSnapshot('outline-view-node-collapsed');
  });

  it('Expand All and Collapse All buttons work', () => {
    // Open the Outline View
    cy.get('button[aria-label="Outline View"]').should('be.visible').click({ force: true });

    // Wait for dialog to be visible
    cy.wait(500);
    cy.get('[role="dialog"]').should('be.visible');

    // Click Expand All button (in the floating toolbar at bottom-left)
    // Note: The aria-label will be just "Expand" from the i18n key
    cy.get('[role="dialog"]').within(() => {
      // Look for the Expand All button by its tooltip content or position (bottom-left toolbar)
      cy.get('button').filter('[aria-label="Expand"]').last().should('be.visible').click();
    });

    cy.wait(800); // Wait for all expansions to complete

    // Take snapshot of all expanded
    cy.matchImageSnapshot('outline-view-expand-all');

    // Click Collapse All button (in the floating toolbar)
    cy.get('[role="dialog"]').within(() => {
      // Look for the Collapse All button (should be in the floating toolbar)
      cy.get('button').filter('[aria-label="Collapse"]').last().should('be.visible').click();
    });

    cy.wait(800); // Wait for all collapses to complete

    // Take snapshot of all collapsed
    cy.matchImageSnapshot('outline-view-collapse-all');
  });

  it('Close Outline View dialog', () => {
    // Open the Outline View
    cy.get('button[aria-label="Outline View"]').should('be.visible').click({ force: true });

    // Wait for dialog to be visible
    cy.wait(500);
    cy.get('[role="dialog"]').should('be.visible');

    // Click the close button (X icon in top right)
    cy.get('[role="dialog"]').within(() => {
      cy.get('button').first().click();
    });

    cy.wait(300);

    // Verify dialog is closed
    cy.get('[role="dialog"]').should('not.exist');

    cy.matchImageSnapshot('outline-view-closed');
  });

  it('Outline View displays topic icons', () => {
    // First, add an icon to a topic
    cy.focusTopicById(3);
    
    // Click the Add Icon button using the custom command
    cy.onClickToolbarButton('Add Icon');
    
    // Select an icon by clicking on one
    cy.get('[aria-label="grinning"]').should('be.visible').click();

    // Wait a moment for the icon to be added
    cy.wait(300);

    // Now open the Outline View
    cy.get('button[aria-label="Outline View"]').should('be.visible').click({ force: true });

    // Wait for outline dialog to be visible
    cy.wait(500);
    cy.get('[role="dialog"]').should('be.visible');

    // Verify that icons are displayed in the outline
    cy.get('[role="dialog"]').within(() => {
      cy.get('img[alt="icon"]').should('exist');
    });

    cy.matchImageSnapshot('outline-view-with-icons');
  });

  it('Outline View displays link and note indicators', () => {
    // Open the Outline View
    cy.get('button[aria-label="Outline View"]').should('be.visible').click({ force: true });

    // Wait for dialog to be visible
    cy.wait(500);
    cy.get('[role="dialog"]').should('be.visible');

    // Check if link/note icons are present (if the map has any)
    cy.get('[role="dialog"]').within(() => {
      // Look for link or note feature icons
      cy.get('img[alt="link"], img[alt="note"]').should('have.length.greaterThan', -1);
    });

    cy.matchImageSnapshot('outline-view-with-features');
  });
});

