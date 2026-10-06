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

/*
 * A released control point keeps its end where the drag left it (BL5-41). Once the topic is
 * resized that point is no longer a snap point, and the end was placed again from the centre of
 * the topic, which can land on another edge. The search now starts from the released end, so the
 * end stays on its edge, at the same place along it (BL5-125).
 */
import { buildDesigner } from './commands/designer-harness';
import type Relationship from '../../src/components/Relationship';
import type Topic from '../../src/components/Topic';
import type PositionType from '../../src/components/PositionType';
import { PivotType } from '../../src/components/RelationshipControlPoints';
import RelationshipSnap from '../../src/components/RelationshipSnap';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

// The gap between a topic border and its snap points (RelationshipSnap.calculateSnapPoint).
const GAP = 7;

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  // Text as wide as its characters, so that a longer text resizes the topic.
  (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = function getBBox(
    this: SVGElement,
  ) {
    if (this.tagName.toLowerCase() !== 'text') {
      return { x: 0, y: 0, width: 60, height: 14 } as DOMRect;
    }
    return { x: 0, y: 0, width: (this.textContent || '').length * 7, height: 12 } as DOMRect;
  };
});

afterAll(() => {
  jest.restoreAllMocks();
});

type Pivot = { mouseDownHandler(event: Event): void };
const pivotOf = (relationship: Relationship, type: PivotType): Pivot =>
  (relationship as unknown as { _controlPointsController: { _pivotLines: Pivot[] } })
    ._controlPointsController._pivotLines[type]!;

const endOf = (relationship: Relationship, type: PivotType): PositionType => {
  const line = relationship.getLine();
  return { ...(type === PivotType.Start ? line.getFrom() : line.getTo()) };
};

/** The edge of the topic a snap point is on, and where along it (0 to 1). */
const placeOn = (topic: Topic, point: PositionType): { edge: string; along: number } => {
  const pos = topic.getPosition();
  const { width, height } = topic.getSize();
  const dx = point.x - pos.x;
  const dy = point.y - pos.y;
  if (Math.abs(Math.abs(dx) - (width / 2 + GAP)) < 0.01) {
    return { edge: dx < 0 ? 'left' : 'right', along: (dy + height / 2) / height };
  }
  expect(Math.abs(dy)).toBeCloseTo(height / 2 + GAP);
  return { edge: dy < 0 ? 'top' : 'bottom', along: (dx + width / 2) / width };
};

describe('Relationship released end after its topic is resized (BL5-125)', () => {
  // Releases over and beside the target topic (Floating, 5) and beside the source (B, 3). From the
  // centre, the end of the release at 400,400 moved from the left edge to the top one. The control
  // point released at 100,-100 fits no snap point of the top edge of the wider topic: its end
  // moves to the right edge, the only one it fits.
  it.each([
    [PivotType.End, 0, 0, true],
    [PivotType.End, 400, 400, true],
    [PivotType.End, 600, 300, true],
    [PivotType.End, 700, 200, true],
    [PivotType.Start, -300, 200, true],
    [PivotType.Start, 100, -100, false],
  ])('keeps the end on its edge if it fits (pivot %s, %s,%s)', async (type, x, y, fits) => {
    const { designer, topic } = await buildDesigner();
    const relationship = designer.getModel().getRelationships()[0]!;
    const end = topic(type === PivotType.End ? 5 : 3);
    relationship.setOnFocus(true);
    pivotOf(relationship, type).mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y }));
    const released = placeOn(end, endOf(relationship, type));
    const ctrlPoint = { ...relationship.getLine().getControlPoints()[type] };

    end.setText(`${end.getText()} with a much longer text`);
    end.redraw(end.getThemeVariant(), false);
    relationship.redraw();

    // The control point is kept, relative to an end it fits: the snap point facing it.
    const placedEnd = endOf(relationship, type);
    expect(relationship.getLine().getControlPoints()[type]).toEqual(ctrlPoint);
    const facing = RelationshipSnap.calculateSnapPoint(end, {
      x: placedEnd.x + ctrlPoint.x!,
      y: placedEnd.y + ctrlPoint.y!,
    });
    expect(facing.x).toBeCloseTo(placedEnd.x);
    expect(facing.y).toBeCloseTo(placedEnd.y);

    const placed = placeOn(end, placedEnd);
    if (fits) {
      expect(placed.edge).toBe(released.edge);
      expect(placed.along).toBeCloseTo(released.along);
    } else {
      expect(placed.edge).not.toBe(released.edge);
    }
  });
});
