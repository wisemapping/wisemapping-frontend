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
describe('Topic Icon Suite', () => {
  beforeEach(() => {
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
  });

  it('Open panel with emojis tab', () => {
    cy.onClickToolbarButton('Add Icon');
    cy.waitForEmojiTab();
    cy.matchImageSnapshot('icons-panel-emojis');
  });

  it('Add new emoji icon', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    cy.waitForEmojiTab();
    cy.getEmoji().first().should('be.visible').click();
    cy.matchImageSnapshot('add-new-emoji-icon');
  });

  it('Offers emojis only: the icon gallery is gone for new icons', () => {
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Add Icon');

    cy.waitForEmojiTab();
    cy.contains('Icons Gallery').should('not.exist');
    cy.get('input[placeholder="Search icons..."]').should('not.exist');
  });

  it('Replace emoji with different emoji', () => {
    // Add first emoji
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Icon');

    cy.waitForEmojiTab();
    cy.getEmoji().first().should('be.visible').click({ force: true });

    // Replace with a different emoji
    cy.focusTopicById(4);
    cy.onClickToolbarButton('Add Icon');

    cy.waitForEmojiTab();
    // Click a different emoji (force in case of backdrop overlay)
    cy.getEmoji().eq(1).click({ force: true });

    cy.matchImageSnapshot('emoji-replaced-with-different-emoji');
  });
});
