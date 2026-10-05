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

// The part of the mindplot Designer these tests drive.
type ClipboardDesigner = {
  copyToClipboard(): Promise<void>;
  pasteClipboard(): Promise<void>;
};

// <mindplot-component> exposes its designer through getDesigner() (MindplotWebComponent).
type DesignerHost = HTMLElement & { getDesigner(): ClipboardDesigner };

// Copies the selected topics and pastes them through the designer, as Ctrl+C / Ctrl+V do.
// Headless Chrome usually denies the system clipboard, so both fall back to the internal one.
const copyAndPaste = () => {
  cy.get<DesignerHost>('mindplot-component').then(async ($host) => {
    const designer = $host[0].getDesigner();
    await designer.copyToClipboard();

    // The paste offsets each pasted topic by a random amount: pin it so the snapshot is stable.
    const win = $host[0].ownerDocument.defaultView as Window & typeof globalThis;
    const { random } = win.Math;
    win.Math.random = () => 0.5;
    try {
      await designer.pasteClipboard();
    } finally {
      win.Math.random = random;
    }
  });
};

// The text of every topic whose text is exactly `text`.
const topicsWithText = (text: string) =>
  cy.get('[test-id] > text').filter((_, el) => el.textContent === text);

describe('Topic Copy and Paste Suite', () => {
  beforeEach(() => {
    // Remove storage for autosave ...
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
  });

  it('Copy and Paste topic', () => {
    // Topic 2 is "Productivity", with its subtopics.
    cy.focusTopicById(2);
    cy.get('[test-id="2"] > text')
      .invoke('text')
      .then((originalText) => {
        topicsWithText(originalText).should('have.length', 1);

        copyAndPaste();

        // The original and the pasted copy.
        topicsWithText(originalText).should('have.length', 2);
        cy.matchImageSnapshot('copyandpaste');
      });
  });

  it('Copy topic and verify duplicate created', () => {
    cy.focusTopicByText('Features');
    topicsWithText('Features').should('have.length', 1);

    copyAndPaste();

    // The original and the pasted copy.
    topicsWithText('Features').should('have.length', 2);
    cy.matchImageSnapshot('copy-and-paste-duplicate');
  });
});
