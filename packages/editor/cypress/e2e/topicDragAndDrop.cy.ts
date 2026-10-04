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
describe('Topic Drag and Drop', () => {
  beforeEach(() => {
    // Remove storage for autosave ...
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
  });

  it('Move up node "Mind Mapping"', () => {
    const position = { clientX: 270, clientY: 160 };
    cy.contains('Mind Mapping').trigger('mousedown');
    cy.get('body').trigger('mousemove', position);
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('moveupNode');
  });

  it('Move down node "Mind Mapping"', () => {
    cy.contains('Mind Mapping').trigger('mousedown');
    cy.get('body').trigger('mousemove', { clientX: 350, clientY: 380 });
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('movedownNode');
  });

  it('Move default position node "Mind Mapping"', () => {
    cy.contains('Mind Mapping').trigger('mousedown');
    cy.get('body').trigger('mousemove', { clientX: 270, clientY: 240 });
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('moveDefaultPosition');
  });

  it('Move left node "Mind Mapping"', () => {
    cy.contains('Mind Mapping').trigger('mousedown');
    cy.get('body').trigger('mousemove', { clientX: 700, clientY: 240 });
    cy.get('body').trigger('mouseup');
    cy.matchImageSnapshot('moveleftNode');
  });
});
