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

// A module, so that the types and helpers below stay local to this spec.
export {};

/**
 * Drags "Mind Mapping" (a child of the central topic on its left side, under "Try it Now!") with
 * real pointer events (see the pointerDrag command) and checks where the drop left it: its new
 * parent, and its position in the model.
 *
 * A topic connects to a candidate when it is dropped outside the candidate's outer border, at
 * most 80 px away (DragConnector.MAX_VERTICAL_CONNECTION_TOLERANCE). The drop points are taken
 * from the rendered text of the target topics, so they follow the welcome map's layout.
 */
type TopicHandle = {
  getText(): string;
  getPosition(): { x: number; y: number };
  getOutgoingConnectedTopic(): TopicHandle | null;
};

type DesignerHandle = {
  getModel(): { getTopics(): TopicHandle[] };
};

const designer = (win: Cypress.AUTWindow): DesignerHandle =>
  (win as unknown as { designer: DesignerHandle }).designer;

const topicByText = (win: Cypress.AUTWindow, text: string): TopicHandle => {
  const topic = designer(win)
    .getModel()
    .getTopics()
    .find((t) => t.getText() === text);
  expect(topic, `topic "${text}"`).to.not.equal(undefined);
  return topic!;
};

/** The parent's text, and the topic's position, as the model has them. */
const topicState = (text: string) =>
  cy.window().then((win) => {
    const topic = topicByText(win, text);
    return {
      parent: topic.getOutgoingConnectedTopic()?.getText() ?? null,
      position: { ...topic.getPosition() },
    };
  });

/** The viewport rectangle of a topic's text. */
const textRect = (text: string) =>
  cy
    .contains(text)
    .then(($el) => ($el as unknown as JQuery<HTMLElement>)[0]!.getBoundingClientRect());

const centerOf = (rect: DOMRect): PointerPosition => ({
  clientX: Math.round(rect.left + rect.width / 2),
  clientY: Math.round(rect.top + rect.height / 2),
});

const DRAGGED = 'Mind Mapping';
const CENTRAL = 'Welcome To WiseMapping';

describe('Topic Drag and Drop', () => {
  beforeEach(() => {
    // Remove storage for autosave ...
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();

    topicState(DRAGGED).its('parent').should('equal', CENTRAL);
  });

  /** Drags "Mind Mapping" from the middle of its text to `to`. */
  const dragTo = (to: PointerPosition) =>
    textRect(DRAGGED).then((rect) => cy.pointerDrag(centerOf(rect), to));

  it('Move up node "Mind Mapping" under "Try it Now!"', () => {
    // Drop it left of "Try it Now!", the topic above it ...
    textRect('Try it Now!').then((target) =>
      dragTo({ clientX: Math.round(target.left - 60), clientY: centerOf(target).clientY }),
    );

    topicState(DRAGGED).its('parent').should('equal', 'Try it Now!');
    cy.matchImageSnapshot('moveupNode');
  });

  it('Move down node "Mind Mapping" below "Install In Your Server"', () => {
    // Drop it next to the central topic, just below "Install In Your Server" ...
    textRect(CENTRAL).then((central) =>
      textRect('Install In Your Server').then((install) =>
        dragTo({
          clientX: Math.round(central.left - 50),
          clientY: Math.round(install.bottom + 25),
        }),
      ),
    );

    topicState(DRAGGED).its('parent').should('equal', CENTRAL);
    cy.window().then((win) => {
      const moved = topicByText(win, DRAGGED).getPosition();
      const install = topicByText(win, 'Install In Your Server').getPosition();
      expect(moved.y, 'below "Install In Your Server"').to.be.greaterThan(install.y);
    });
    cy.matchImageSnapshot('movedownNode');
  });

  it('Move node "Mind Mapping" back to its default position', () => {
    // A drop always records a move, even onto the place it came from: Undo tells that the drag
    // ended with a drop, the model that it left the topic where it was.
    cy.get('[aria-label^="Undo "]').eq(1).should('be.disabled');
    topicState(DRAGGED).then((before) => {
      // Drop it next to the central topic, at the height it already has ...
      textRect(CENTRAL).then((central) =>
        textRect(DRAGGED).then((dragged) =>
          dragTo({ clientX: Math.round(central.left - 50), clientY: centerOf(dragged).clientY }),
        ),
      );

      cy.get('[aria-label^="Undo "]').eq(1).should('not.be.disabled');
      topicState(DRAGGED).should('deep.equal', before);
    });
    cy.matchImageSnapshot('moveDefaultPosition');
  });

  it('Move node "Mind Mapping" to the right side, under "Features"', () => {
    // Drop it right of "Features", on the other side of the central topic ...
    textRect('Features').then((target) =>
      dragTo({ clientX: Math.round(target.right + 60), clientY: centerOf(target).clientY }),
    );

    topicState(DRAGGED).its('parent').should('equal', 'Features');
    cy.window().then((win) => {
      const moved = topicByText(win, DRAGGED).getPosition();
      const central = topicByText(win, CENTRAL).getPosition();
      expect(moved.x, 'right of the central topic').to.be.greaterThan(central.x);
    });
    cy.matchImageSnapshot('moveleftNode');
  });
});
