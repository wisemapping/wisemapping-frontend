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

import { designerIn } from '../support/designer';

/**
 * Structural keyboard moves, end to end through the real KeyboardManager,
 * Designer, DragTopicCommand and layout manager.
 *
 * Topic ids come from the welcome map the playground editor loads:
 *
 *   1  Welcome To WiseMapping   (central)
 *   ├── 30                      order 0
 *   ├── 11 Try it Now!          order 1
 *   │   ├── 12 Double Click     order 0
 *   │   ├── 13 (Press "enter")  order 1
 *   │   └── 14 Drag map to move order 2
 *   └── 15 Features             order 2
 */
type TopicHandle = {
  getParent(): { getId(): number } | null;
  getOrder(): number | undefined;
  getId(): number;
};

type DesignerHandle = {
  getModel(): {
    findTopicById(id: number): TopicHandle;
    selectedTopic(): TopicHandle | null;
  };
};

/** The designer of the page's `mindplot-component`, through its `getDesigner()`. */
const designer = (win: Cypress.AUTWindow): DesignerHandle => designerIn<DesignerHandle>(win);

describe('Topic Keyboard Move Suite', () => {
  /** Reads a topic's parent id and order straight off the designer model. */
  const topicState = (id: number) =>
    cy.window().then((win) => {
      const topic = designer(win).getModel().findTopicById(id);
      return {
        parentId: topic.getParent()?.getId() ?? null,
        order: topic.getOrder(),
      };
    });

  const pressMove = (key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') => {
    // Dispatched on document, which is where KeyboardManager listens.
    cy.document().trigger('keydown', {
      key,
      altKey: true,
      shiftKey: true,
      bubbles: true,
    });
  };

  beforeEach(() => {
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
  });

  it('moves a topic up among its siblings', () => {
    cy.focusTopicById(13);
    topicState(13).should('deep.equal', { parentId: 11, order: 1 });

    pressMove('ArrowUp');

    topicState(13).should('deep.equal', { parentId: 11, order: 0 });
    // The displaced sibling takes the vacated slot.
    topicState(12).should('deep.equal', { parentId: 11, order: 1 });
  });

  it('moves a topic down among its siblings', () => {
    cy.focusTopicById(13);

    pressMove('ArrowDown');

    topicState(13).should('deep.equal', { parentId: 11, order: 2 });
    topicState(14).should('deep.equal', { parentId: 11, order: 1 });
  });

  it('indents a topic under the sibling above it', () => {
    cy.focusTopicById(13);

    pressMove('ArrowRight');

    // 12 was 13's preceding sibling, so it becomes its parent.
    topicState(13).should((state) => {
      expect(state.parentId).to.equal(12);
    });
  });

  it('outdents a topic to its grandparent', () => {
    cy.focusTopicById(13);

    pressMove('ArrowLeft');

    // 13 hung off 11, whose parent is the central topic.
    topicState(13).should((state) => {
      expect(state.parentId).to.equal(1);
    });
  });

  it('leaves the first sibling alone when asked to move up', () => {
    cy.focusTopicById(12);
    topicState(12).should('deep.equal', { parentId: 11, order: 0 });

    pressMove('ArrowUp');

    topicState(12).should('deep.equal', { parentId: 11, order: 0 });
  });

  it('leaves the last sibling alone when asked to move down', () => {
    cy.focusTopicById(14);

    pressMove('ArrowDown');

    topicState(14).should('deep.equal', { parentId: 11, order: 2 });
  });

  it('refuses to indent the first sibling, which has nothing above it', () => {
    cy.focusTopicById(12);

    pressMove('ArrowRight');

    topicState(12).should('deep.equal', { parentId: 11, order: 0 });
  });

  it('refuses to outdent a direct child of the central topic', () => {
    cy.focusTopicById(11);
    topicState(11).should((state) => {
      expect(state.parentId).to.equal(1);
    });

    pressMove('ArrowLeft');

    // Still attached to the root -- outdenting further would orphan it.
    topicState(11).should((state) => {
      expect(state.parentId).to.equal(1);
    });
  });

  it('puts a reorder on the undo stack', () => {
    cy.focusTopicById(13);

    pressMove('ArrowDown');
    topicState(13).should('deep.equal', { parentId: 11, order: 2 });

    cy.triggerUndo();

    topicState(13).should('deep.equal', { parentId: 11, order: 1 });
  });

  it('puts a reparent on the undo stack', () => {
    cy.focusTopicById(13);

    pressMove('ArrowRight');
    topicState(13).should((state) => {
      expect(state.parentId).to.equal(12);
    });

    cy.triggerUndo();

    topicState(13).should((state) => {
      expect(state.parentId).to.equal(11);
    });
  });

  it('does nothing when no topic is selected', () => {
    // Clicking empty canvas clears the selection.
    cy.get('body').click(5, 5);

    pressMove('ArrowUp');

    topicState(13).should('deep.equal', { parentId: 11, order: 1 });
  });

  it('keeps the moved topic selected and on screen', () => {
    cy.focusTopicById(13);

    pressMove('ArrowRight');

    cy.window().then((win) => {
      expect(designer(win).getModel().selectedTopic()?.getId()).to.equal(13);
    });
  });
});
