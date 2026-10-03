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

/**
 * Deselecting leaves the toolbar property models with no selected topic.
 * `color-picker` reads `colorModel.getValue()` while rendering and
 * `topic-font-editor` re-reads its models from an `onblur` listener, so a
 * non-total getter surfaces here as a render-time throw rather than a quiet
 * undefined. The suite's global afterEach fails on any console.error, which is
 * where such a throw lands.
 */
describe('Topic Deselection Suite', () => {
  beforeEach(() => {
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();

    // A non-central topic: the central topic hides most of the style controls.
    cy.focusTopicById(3);
  });

  it('survives deselecting while the topic style panel is open', () => {
    cy.onClickToolbarButton('Style Topic & Connections');
    // The swatches only appear once the colour picker has read its model.
    cy.get('[aria-label="Rectangle shape"]').should('be.visible').first().click({ force: true });
    cy.get('[title="#cc0000"]').should('be.visible');

    // Clicking empty canvas routes through the screen manager's click handler,
    // which calls Designer.onObjectFocusEvent(undefined) and clears selection.
    cy.get('svg').first().click(10, 10, { force: true });

    cy.contains('Mind Mapping').should('be.visible');
  });

  it('reopens the topic style panel after a deselect', () => {
    cy.onClickToolbarButton('Style Topic & Connections');
    cy.get('[aria-label="Rectangle shape"]').should('be.visible').first().click({ force: true });

    cy.get('svg').first().click(10, 10, { force: true });

    // The property models are cached on the builder, so a getter left in a
    // throwing state would resurface on this second open.
    cy.focusTopicById(3);
    cy.onClickToolbarButton('Style Topic & Connections');
    cy.get('[title="#ff0000"]').should('be.visible').click({ force: true });

    cy.contains('Mind Mapping').should('be.visible');
  });

  it('survives deselecting while the font style panel is open', () => {
    cy.onClickToolbarButton('Font Style');

    cy.get('svg').first().click(10, 10, { force: true });

    cy.contains('Mind Mapping').should('be.visible');
  });
});
