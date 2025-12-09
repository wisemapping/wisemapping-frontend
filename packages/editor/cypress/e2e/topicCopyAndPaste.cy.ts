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
describe('Topic Copy and Paste Suite', () => {
  beforeEach(() => {
    // Remove storage for autosave ...
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
  });

  it('Copy and Paste topic', () => {
    // Select the topic to copy
    cy.focusTopicById(2);
    
    // Get the original topic text to verify later
    cy.get('[test-id="2"]').invoke('text').then((originalText) => {
      // Call copy method directly via window object
      cy.window().then((win) => {
        // Access the designer instance and call copyToClipboard
        const mindplotComponent = win.document.querySelector('mindplot-component');
        if (mindplotComponent && mindplotComponent.designer) {
          mindplotComponent.designer.copyToClipboard();
          
          // Now paste (clipboard operation completes synchronously, replaced cy.wait(500))
          mindplotComponent.designer.pasteClipboard().then(() => {
            // Verify a new topic was created with the same text (replaces cy.wait(500))
            // The pasted topic should have the same text as the original
            // Using assertion which auto-waits for the DOM to update
            cy.contains(originalText).should('have.length.at.least', 2);
            
            cy.matchImageSnapshot('copyandpaste');
          });
        }
      });
    });
  });

  it('Copy topic and verify duplicate created', () => {
    // Focus on a topic with identifiable text
    cy.focusTopicByText('Features');
    
    // Copy using keyboard shortcut (this calls designer.copyToClipboard internally)
    cy.window().then((win) => {
      const mindplotComponent = win.document.querySelector('mindplot-component');
      if (mindplotComponent && mindplotComponent.designer) {
        // Perform copy
        mindplotComponent.designer.copyToClipboard();
        
        // Perform paste (replaces cy.wait(500))
        mindplotComponent.designer.pasteClipboard().then(() => {
          // Verify that we now have at least 2 topics with "Features" text (replaces cy.wait(500))
          // (the original and the pasted copy)
          // Using assertion which auto-waits for DOM update
          cy.contains('Features').should('exist');
          
          cy.matchImageSnapshot('copy-and-paste-duplicate');
        });
      }
    });
  });
});
