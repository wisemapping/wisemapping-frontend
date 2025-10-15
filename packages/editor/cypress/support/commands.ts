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

/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

declare global {
  namespace Cypress {
    interface Chainable {
      waitForLoad(): void;
      waitEditorLoaded(): void;
      imageSnaphots(): void;

      focusTopicByText(value: string): void;
      focusTopicById(id: number): void;

      onMouseOverToolbarButton(value: 'Style Topic & Connections' | 'Font Style' | 'Connection Style' | 'Relationship Style'): void;
      onClickToolbarButton(
        value: 'Add Relationship' | 'Add Icon' | 'Theme' | 'Connection Style' | 'Relationship Style' | 'Font Style',
      ): void;

      triggerUndo(): void;
      triggerRedo(): void;
    }
  }
}
// make matchImageSnapshot() call the real implementation only if CYPRESS_imageSnaphots is set
// otherwise it calls a noop
if (Cypress.env('imageSnaphots')) {
  addMatchImageSnapshotCommand({
    failureThreshold: 0.001,
    failureThresholdType: 'percent',
  });
} else {
  Cypress.Commands.add(
    'matchImageSnapshot',
    {
      prevSubject: ['optional', 'element', 'window', 'document'],
    },
    () => Promise.resolve(),
  );
}

Cypress.Commands.add('waitEditorLoaded', () => {
  // Wait editor ...
  cy.get('svg > path').should('be.visible');
  cy.get('[aria-label="vortex-loading"]', { timeout: 120000 }).should('not.exist');
  cy.clearLocalStorage('welcome-xml');

  // Wait for font ...
  cy.document().its('fonts.status').should('equal', 'loaded');
});

Cypress.Commands.add('waitForLoad', () => {
  cy.document().its('fonts.status').should('equal', 'loaded');
});

// Mindmap commands ...
Cypress.Commands.add('focusTopicById', (id: number) => {
  cy.get(`[test-id=${id}]`).click({ force: true });
});

Cypress.Commands.add('focusTopicByText', (text: string) => {
  cy.contains(text).click({ force: true });
});

Cypress.Commands.add(
  'onMouseOverToolbarButton',
  (button: 'Style Topic & Connections' | 'Font Style' | 'Connection Style' | 'Relationship Style') => {
    // For buttons with custom panels (like Style Topic & Connections), we need to click instead of hover
    // because the toolbar requires click-to-open for items with custom render
    cy.get(`[aria-label="${button}"]`).first().click({ force: true });
    
    // Wait for the panel to be visible and fully rendered
    // For Style Topic & Connections, wait for one of the tab labels to appear
    if (button === 'Style Topic & Connections') {
      cy.contains('Shape', { timeout: 5000 }).should('be.visible');
    }
    
    // Wait for panel content to be fully rendered and interactive
    cy.get('body').should('not.have.class', 'loading');
  },
);

Cypress.Commands.add(
  'onClickToolbarButton',
  (
    button:
      | 'Add Relationship'
      | 'Add Icon'
      | 'Add Link'
      | 'Add Note'
      | 'Add Topic Image'
      | 'Theme'
      | 'Connection Style'
      | 'Relationship Style'
      | 'Font Style',
  ) => {
    // Use contains selector for buttons that include keyboard shortcuts in their aria-label
    cy.get(`[aria-label*="${button}"]`).click({ multiple: true, force: true });
  },
);

Cypress.Commands.add('triggerUndo', () => {
  cy.get('[aria-label^="Undo ').eq(1).click();
});

Cypress.Commands.add('triggerRedo', () => {
  cy.get('[aria-label^="Redo ').eq(1).click();
});
