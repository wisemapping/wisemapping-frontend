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
    const relationship = designerIn<DesignerHandle>(win)
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

/** The element a real pointer at `point` hits, looking inside open shadow roots. */
const elementAt = (doc: Document, { clientX, clientY }: PointerPosition): Element | null => {
  let target = doc.elementFromPoint(clientX, clientY);
  while (target?.shadowRoot) {
    const inner = target.shadowRoot.elementFromPoint(clientX, clientY);
    if (!inner || inner === target) {
      break;
    }
    target = inner;
  }
  return target;
};

/** Whether `point` is on the empty canvas: the root <svg> of the mindplot workspace. */
const isEmptyCanvas = (doc: Document, point: PointerPosition): boolean => {
  const hit = elementAt(doc, point);
  return (
    hit?.tagName.toLowerCase() === 'svg' &&
    (hit as SVGElement).ownerSVGElement === null &&
    hit.getRootNode() !== doc
  );
};

/** Asserts that a real pointer at the centre of a control point handle hits the handle. */
const assertReachable = (pivot: 0 | 1) =>
  controlDot(pivot).then(($dot) =>
    dotCenter(pivot).then((center) =>
      cy.document().should((doc) => {
        expect(elementAt(doc, center), `element under control point ${pivot}`).to.equal($dot[0]);
      }),
    ),
  );

/**
 * Pans the canvas, dragging its background with real pointer events, until the end handle is
 * `margin` px below the app bar. Created on "Try it Now!", that handle starts under the app bar,
 * out of reach of a real pointer. A pan does not change the selection (no click on a drag).
 */
const panEndHandleBelowAppBar = (margin = 60) =>
  // Everything docked over the top of the canvas: the app bar, and a toolbar placed at the top.
  cy.get('[data-canvas-inset="top"]').then(($insets) => {
    const barBottom = Math.max(...$insets.toArray().map((el) => el.getBoundingClientRect().bottom));
    dotCenter(1).then((handle) => {
      const dy = Math.ceil(barBottom + margin - handle.clientY);
      if (dy <= 0) {
        return;
      }
      cy.window().then((win) => {
        const doc = win.document;
        const candidates: PointerPosition[] = [];
        for (
          let clientY = Math.ceil(barBottom) + 20;
          clientY < win.innerHeight - 20;
          clientY += 20
        ) {
          for (let clientX = 20; clientX < win.innerWidth - 20; clientX += 20) {
            candidates.push({ clientX, clientY });
          }
        }
        const from = candidates.find((point) => isEmptyCanvas(doc, point));
        expect(from, 'an empty spot of the canvas to pan from').to.not.equal(undefined);
        cy.pointerDrag(from!, { clientX: from!.clientX, clientY: from!.clientY + dy });
      });
      // The canvas follows the pointer one to one: the handle moves by exactly dy.
      dotCenter(1).should((moved) => {
        expect(moved.clientY, 'end handle panned by the pointer move').to.be.closeTo(
          handle.clientY + dy,
          1,
        );
      });
    });
    dotCenter(1).should((handle) => {
      expect(handle.clientY, 'end handle below the app bar').to.be.greaterThan(barBottom);
    });
  });

/** Drags a control point handle to `to` with real pointer events: press, moves and release. */
const dragControlPoint = (pivot: 0 | 1, to: PointerPosition) => {
  assertReachable(pivot);
  dotCenter(pivot).then((from) =>
    cy.pointerDrag({ clientX: Math.round(from.clientX), clientY: Math.round(from.clientY) }, to),
  );
};

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

      // Move control point end. Bring its handle out from under the app bar first. On release
      // the handle stays under the pointer (BL5-99) ...
      panEndHandleBelowAppBar();
      dotCenter(1).then((before) => {
        const end = {
          clientX: Math.round(before.clientX) + 150,
          clientY: Math.round(before.clientY) + 150,
        };
        dragControlPoint(1, end);
        dotCenter(1).should((center) => {
          expect(center.clientX).to.be.closeTo(end.clientX, 1);
          expect(center.clientY).to.be.closeTo(end.clientY, 1);
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
