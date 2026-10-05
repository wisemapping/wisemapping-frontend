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

type RelationshipHandle = {
  getModel(): {
    getFromNode(): number;
    getToNode(): number;
    getSrcCtrlPoint(): { x: number; y: number } | null;
    getDestCtrlPoint(): { x: number; y: number } | null;
  };
};

type DesignerHandle = {
  getModel(): { getRelationships(): RelationshipHandle[] };
};

/** The control points the model holds for the "Features" -> "Try it Now!" relationship. */
const controlPoints = () =>
  cy.window().then((win) => {
    const relationship = (win as unknown as { designer: DesignerHandle }).designer
      .getModel()
      .getRelationships()
      .find((r) => r.getModel().getFromNode() === 15 && r.getModel().getToNode() === 11);
    expect(relationship, 'relationship 15 -> 11').to.not.equal(undefined);
    const model = relationship!.getModel();
    const copy = (point: { x: number; y: number } | null) => (point ? { ...point } : null);
    return { src: copy(model.getSrcCtrlPoint()), dest: copy(model.getDestCtrlPoint()) };
  });

const controlDot = (pivot: 0 | 1) => cy.get(`[test-id="relctl:${pivot}:15-11"]`).first();

/** The viewport centre of a control point handle. */
const dotCenter = (pivot: 0 | 1) =>
  controlDot(pivot).then(($dot) => {
    const rect = $dot[0]!.getBoundingClientRect();
    return { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
  });

/**
 * Drags a control point handle, with real pointer events, to `to`. The mousedown goes to the
 * handle itself: the end handle of this relationship lies under the app bar.
 */
const dragControlPoint = (pivot: 0 | 1, to: PointerPosition) =>
  controlDot(pivot).then(($dot) =>
    dotCenter(pivot).then((from) =>
      cy.pointerDrag({ clientX: Math.round(from.clientX), clientY: Math.round(from.clientY) }, to, {
        pressOn: $dot[0],
      }),
    ),
  );

describe('Relationship Topics', () => {
  beforeEach(() => {
    // Remove storage for autosave ...
    cy.visit('/map-render/html/editor.html');
    cy.waitEditorLoaded();
  });

  it.skip('Add Relationship', () => {
    // Create new relationship ...
    cy.focusTopicByText('Features');
    cy.onClickToolbarButton('Add Relationship');

    cy.focusTopicByText('Try it Now!');

    cy.get('[test-id="15-11-relationship"]').as('rel');
    cy.get('@rel').click({ force: true });
    cy.get('@rel').should('exist');

    cy.matchImageSnapshot('addRelationship');

    // Undo relationship ...
    cy.get('[aria-label^="Undo ').eq(1).click();
    cy.get('@rel').should('not.exist');
  });

  it('Delete Relationship', () => {
    // Add new relationship ...
    cy.focusTopicByText('Features');
    cy.onClickToolbarButton('Add Relationship');
    cy.focusTopicByText('Try it Now!');

    // Delete it ...
    cy.get('[test-id="15-11-relationship"]').as('rel');
    cy.get('@rel').should('exist');
    cy.get('@rel').first().click({ force: true });

    cy.get('body').type('{backspace}');

    cy.get('@rel').should('not.exist');
    cy.matchImageSnapshot('delete relationship');

    // Undo relationship ...
    cy.triggerUndo();
    cy.get('@rel').should('exist');
  });

  it('Change Control Point', () => {
    // Create new relationship ...
    cy.focusTopicByText('Features');
    cy.onClickToolbarButton('Add Relationship');
    cy.focusTopicByText('Try it Now!');

    // Select relationship ...
    cy.get('[test-id="15-11-relationship"]').as('rel');
    cy.get('@rel').should('exist');
    cy.get('@rel').first().click({ force: true });

    controlPoints().then((initial) => {
      // Move control point start: the handle follows the pointer, and the model records it ...
      const start = { clientX: 350, clientY: 380 };
      dragControlPoint(0, start);
      dotCenter(0).should((center) => {
        // The handle is centred on the control point, under the pointer ...
        expect(center.clientX).to.be.closeTo(start.clientX, 1);
        expect(center.clientY).to.be.closeTo(start.clientY, 1);
      });
      controlPoints().then((points) => {
        expect(points.src, 'source control point').to.not.deep.equal(initial.src);
        expect(points.dest, 'target control point').to.deep.equal(initial.dest);
      });
      cy.matchImageSnapshot('move ctl pont 0');

      // Move control point end. On release the end is placed again from the saved control point
      // (Relationship.recalculateCustomControlPoints), which can settle on another snap point of
      // "Try it Now!" than the one under the pointer: only check that the handle moved ...
      const end = { clientX: 350, clientY: 100 };
      dotCenter(1).then((before) => {
        dragControlPoint(1, end);
        dotCenter(1).should((center) => {
          const moved = Math.hypot(
            center.clientX - before.clientX,
            center.clientY - before.clientY,
          );
          expect(moved, 'end handle moved (px)').to.be.greaterThan(50);
        });
      });
      controlPoints().then((points) => {
        expect(points.src, 'source control point').to.not.deep.equal(initial.src);
        expect(points.dest, 'target control point').to.not.deep.equal(initial.dest);
      });
      cy.matchImageSnapshot('move ctl pont 1');

      // Test undo and redo ...
      cy.triggerUndo();
      cy.triggerUndo();
      cy.get('@rel').should('exist');
      controlPoints().should('deep.equal', initial);
      cy.matchImageSnapshot('rel ctl undo');
    });
  });
});
