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
describe('Image Emoji Suite', () => {
  beforeEach(() => {
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
  });

  it('Opens straight on the emoji picker, with no icon gallery', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Topic Image');

    cy.getEmoji().first().should('be.visible');
    cy.contains('Icons Gallery').should('not.exist');
    cy.get('input[placeholder="Search icons..."]').should('not.exist');
  });

  it('Adds an emoji to a topic and keeps the picker open for another', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Topic Image');

    cy.getEmoji().first().should('be.visible').click();

    // The picker stays open so several emojis can be tried in a row.
    cy.getEmoji().first().should('be.visible');
    cy.get('[test-id="3"]').should('be.visible');
  });
});
