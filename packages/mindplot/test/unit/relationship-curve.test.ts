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

import { CurvedLine } from '@wisemapping/web2d';
import { buildDesigner, SAMPLE_MAP } from './commands/designer-harness';
import type Relationship from '../../src/components/Relationship';
import type PositionType from '../../src/components/PositionType';
import Shape from '../../src/components/util/Shape';
import ActionDispatcher from '../../src/components/ActionDispatcher';
import { PivotType } from '../../src/components/RelationshipControlPoints';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const relationshipOf = (designer: Awaited<ReturnType<typeof buildDesigner>>['designer']) =>
  designer.getModel().getRelationships()[0];

// Absolute position of each handle, as drawn by the line.
const handles = (relationship: Relationship): [PositionType, PositionType] => {
  const line = relationship.getLine();
  const [src, dest] = line.getControlPoints();
  const from = line.getFrom();
  const to = line.getTo();
  return [
    { x: from.x + src.x, y: from.y + src.y },
    { x: to.x + dest.x, y: to.y + dest.y },
  ];
};

const expectPoint = (actual: PositionType, expected: PositionType) => {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.y).toBeCloseTo(expected.y);
};

const withControlPoints = (src: string, dest: string) =>
  SAMPLE_MAP.replace(
    'lineType="3"',
    `lineType="3"${src ? ` srcCtrlPoint="${src}"` : ''}${dest ? ` destCtrlPoint="${dest}"` : ''}`,
  );

describe('web2d CurvedLine control points', () => {
  it('does not mark a control point as custom when it is set', () => {
    const line = new CurvedLine();
    line.setSrcControlPoint({ x: 10, y: 20 });
    line.setDestControlPoint({ x: -10, y: -20 });

    expect(line.isSrcControlPointCustom()).toBe(false);
    expect(line.isDestControlPointCustom()).toBe(false);
    // The given points are still the ones drawn ...
    expect(line.getControlPoints()).toEqual([
      { x: 10, y: 20 },
      { x: -10, y: -20 },
    ]);
  });

  it('keeps a set control point when the ends move', () => {
    const line = new CurvedLine();
    line.setSrcControlPoint({ x: 10, y: 20 });
    line.setFrom(100, 100);
    line.setTo(300, 200);

    expect(line.getControlPoints()[0]).toEqual({ x: 10, y: 20 });
  });

  it('marks a control point as custom only when asked to', () => {
    const line = new CurvedLine();
    line.setIsSrcControlPointCustom(true);
    expect(line.isSrcControlPointCustom()).toBe(true);
    expect(line.isDestControlPointCustom()).toBe(false);

    line.setIsDestControlPointCustom(true);
    line.setIsSrcControlPointCustom(false);
    expect(line.isSrcControlPointCustom()).toBe(false);
    expect(line.isDestControlPointCustom()).toBe(true);
  });
});

describe('Relationship curve after load (BL-69, BL-70)', () => {
  it('uses default control points when the model has none', async () => {
    const { designer } = await buildDesigner();
    const relationship = relationshipOf(designer);

    expect(relationship!.isSrcControlPointCustom()).toBe(false);
    expect(relationship!.isDestControlPointCustom()).toBe(false);
  });

  it('follows a moved topic when the model has no control points', async () => {
    const { designer, topic } = await buildDesigner();
    const relationship = relationshipOf(designer);

    const target = topic(5);
    const pos = target.getPosition();
    designer.getActionDispatcher().moveTopic(5, { x: pos.x + 300, y: pos.y + 200 });

    // The curve is the default one for the new ends: it does not keep its old shape ...
    expect(relationship!.isDestControlPointCustom()).toBe(false);
    const line = relationship!.getLine();
    const expected = Shape.calculateDefaultControlPoints(line.getFrom(), line.getTo());
    expect(line.getControlPoints()).toEqual(expected);
  });

  it('applies the control points stored in the model', async () => {
    const { designer } = await buildDesigner(withControlPoints('-80,-56', '110,-116'));
    const relationship = relationshipOf(designer);

    expect(relationship!.isSrcControlPointCustom()).toBe(true);
    expect(relationship!.isDestControlPointCustom()).toBe(true);
    const [src, dest] = relationship!.getLine().getControlPoints();
    expectPoint(src, { x: -80, y: -56 });
    expectPoint(dest, { x: 110, y: -116 });
  });

  it('saves the stored control points back unchanged', async () => {
    const { save } = await buildDesigner(withControlPoints('-80,-56', '110,-116'));

    expect(save()).toContain('srcCtrlPoint="-80,-56"');
    expect(save()).toContain('destCtrlPoint="110,-116"');
  });

  it('keeps a stored control point while the other end follows its topic', async () => {
    const { designer, topic } = await buildDesigner(withControlPoints('-80,-56', ''));
    const relationship = relationshipOf(designer);
    expect(relationship!.isSrcControlPointCustom()).toBe(true);
    expect(relationship!.isDestControlPointCustom()).toBe(false);
    const [srcHandleBefore] = handles(relationship!);

    const target = topic(5);
    const pos = target.getPosition();
    designer.getActionDispatcher().moveTopic(5, { x: pos.x + 300, y: pos.y + 200 });

    const [srcHandle, destHandle] = handles(relationship!);
    // The custom handle keeps its place ...
    expectPoint(srcHandle, srcHandleBefore);
    // ... and the default one follows the topic.
    const line = relationship!.getLine();
    const expected = Shape.calculateDefaultControlPoints(line.getFrom(), line.getTo());
    expect(line.getControlPoints()[1]).toEqual(expected[1]);
    expectPoint(destHandle, {
      x: line.getTo().x + expected[1].x,
      y: line.getTo().y + expected[1].y,
    });
  });
});

describe('Relationship control point drag (BL-52)', () => {
  type Pivot = { mouseDownHandler(event: Event): void };
  const pivotOf = (relationship: Relationship, type: PivotType): Pivot =>
    (relationship as unknown as { _controlPointsController: { _pivotLines: Pivot[] } })
      ._controlPointsController._pivotLines[type]!;

  const drag = (relationship: Relationship, type: PivotType) => {
    relationship.setOnFocus(true);
    pivotOf(relationship, type).mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 520, clientY: 480 }));
  };

  it('marks a dragged control point as custom, and undo puts the default back', async () => {
    const { designer } = await buildDesigner();
    const relationship = relationshipOf(designer);

    drag(relationship!, PivotType.Start);
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 520, clientY: 480 }));

    expect(relationship!.isSrcControlPointCustom()).toBe(true);
    expect(relationship!.isDestControlPointCustom()).toBe(false);
    expect(relationship!.getModel().getSrcCtrlPoint()).not.toBeNull();

    designer.undo();
    expect(relationship!.isSrcControlPointCustom()).toBe(false);
    const line = relationship!.getLine();
    expect(line.getControlPoints()).toEqual(
      Shape.calculateDefaultControlPoints(line.getFrom(), line.getTo()),
    );
  });

  it.each([PivotType.Start, PivotType.End])(
    'redo puts the dragged curve back where it was (pivot %s)',
    async (type) => {
      const { designer } = await buildDesigner();
      const relationship = relationshipOf(designer);
      const line = relationship!.getLine();

      drag(relationship!, type);
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 520, clientY: 480 }));
      const dragged = handles(relationship!);

      designer.undo();
      designer.redo();

      const [src, dest] = handles(relationship!);
      expectPoint(src, dragged[0]);
      expectPoint(dest, dragged[1]);
      expect(line.getControlPoints()[type]).toEqual(
        type === PivotType.Start
          ? relationship!.getModel().getSrcCtrlPoint()
          : relationship!.getModel().getDestCtrlPoint(),
      );
    },
  );

  it.each([PivotType.Start, PivotType.End])(
    'puts the curve back and records nothing when Escape abandons the drag (pivot %s)',
    async (type) => {
      const { designer, save } = await buildDesigner(withControlPoints('-80,-56', ''));
      const relationship = relationshipOf(designer);
      const line = relationship!.getLine();
      const before = {
        from: line.getFrom(),
        to: line.getTo(),
        controlPoints: line.getControlPoints(),
      };
      const saved = save();
      const moveControlPoint = jest.spyOn(ActionDispatcher.getInstance(), 'moveControlPoint');

      drag(relationship!, type);
      expect(line.getControlPoints()).not.toEqual(before.controlPoints);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 520, clientY: 480 }));

      expect(relationship!.isSrcControlPointCustom()).toBe(true);
      expect(relationship!.isDestControlPointCustom()).toBe(false);
      expectPoint(line.getFrom(), before.from);
      expectPoint(line.getTo(), before.to);
      expectPoint(line.getControlPoints()[0], before.controlPoints[0]);
      expectPoint(line.getControlPoints()[1], before.controlPoints[1]);
      expect(save()).toEqual(saved);
      expect(moveControlPoint).not.toHaveBeenCalled();
    },
  );
});

describe('Relationship custom curve when a topic moves (BL4-29)', () => {
  // The relationship goes from B (3) to Floating (5). Floating can be moved freely, so it is
  // used as the end that moves: the target end as loaded, the source end when swapped.
  const swapped = (xml: string) =>
    xml.replace('srcTopicId="3" destTopicId="5"', 'srcTopicId="5" destTopicId="3"');

  it.each([
    ['target', PivotType.End, withControlPoints('', '110,-116')],
    ['source', PivotType.Start, swapped(withControlPoints('110,-116', ''))],
  ])(
    'keeps the %s control point relative to its topic, as it is saved',
    async (_end, pivot, xml) => {
      const { designer, save, topic } = await buildDesigner(xml);
      const relationship = relationshipOf(designer);
      expect(
        pivot === PivotType.Start
          ? relationship!.isSrcControlPointCustom()
          : relationship!.isDestControlPointCustom(),
      ).toBe(true);
      const handleBefore = handles(relationship!)[pivot]!;

      const before = topic(5).getPosition();
      const delta = { x: 300, y: 200 };
      designer.getActionDispatcher().moveTopic(5, { x: before.x + delta.x, y: before.y + delta.y });
      // Topic.setPosition does not redraw the relationships of a topic the layout moves ...
      relationship!.redraw();

      // The custom handle moves with its topic: the curve keeps its shape ...
      const handle = handles(relationship!)[pivot]!;
      expectPoint(handle, { x: handleBefore.x + delta.x, y: handleBefore.y + delta.y });
      expectPoint(relationship!.getLine().getControlPoints()[pivot]!, { x: 110, y: -116 });

      // ... and it is where the saved map puts it.
      const saved = save();
      expect(saved).toContain(
        pivot === PivotType.Start ? 'srcCtrlPoint="110,-116"' : 'destCtrlPoint="110,-116"',
      );
      const reloaded = relationshipOf((await buildDesigner(saved)).designer);
      expectPoint(handles(reloaded!)[pivot]!, handle);
      expectPoint(reloaded!.getLine().getControlPoints()[pivot]!, { x: 110, y: -116 });
    },
  );
});

describe('Relationship control point handle follows the cursor (BL4-30)', () => {
  type Pivot = { mouseDownHandler(event: Event): void; _dot: { getPosition(): PositionType } };
  const pivotOf = (relationship: Relationship, type: PivotType): Pivot =>
    (relationship as unknown as { _controlPointsController: { _pivotLines: Pivot[] } })
      ._controlPointsController._pivotLines[type]!;

  it.each([
    [PivotType.Start, 520, 480],
    [PivotType.End, 520, 480],
    [PivotType.Start, 100, 900],
    [PivotType.End, 900, 100],
  ])('puts the handle under the cursor while dragging (pivot %s, %s,%s)', async (type, x, y) => {
    const { designer } = await buildDesigner();
    const relationship = relationshipOf(designer);
    relationship!.setOnFocus(true);
    const pivot = pivotOf(relationship!, type);

    pivot.mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
    const move = new MouseEvent('mousemove', { clientX: x, clientY: y });
    document.dispatchEvent(move);
    const cursor = designer.getScreenManager().getWorkspaceMousePosition(move);

    // The curve is drawn with its handle under the cursor, where the dot is centred (BL5-100) ...
    expectPoint(handles(relationship!)[type]!, cursor);
    expectPoint(pivot._dot.getPosition(), cursor);

    document.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y }));
  });
});

describe('Relationship custom end after an interrupted drag (BL4-30)', () => {
  type Pivot = { mouseDownHandler(event: Event): void };
  const pivotOf = (relationship: Relationship, type: PivotType): Pivot =>
    (relationship as unknown as { _controlPointsController: { _pivotLines: Pivot[] } })
      ._controlPointsController._pivotLines[type]!;

  it('follows its topic again once the control points are hidden during a drag', async () => {
    const { designer, topic } = await buildDesigner(withControlPoints('', '110,-116'));
    const relationship = relationshipOf(designer);
    relationship!.setOnFocus(true);
    pivotOf(relationship!, PivotType.End).mouseDownHandler(
      new MouseEvent('mousedown', { cancelable: true }),
    );
    relationship!.setOnFocus(false);
    const handleBefore = handles(relationship!)[PivotType.End];

    const before = topic(5).getPosition();
    designer.getActionDispatcher().moveTopic(5, { x: before.x + 300, y: before.y + 200 });
    relationship!.redraw();

    expectPoint(handles(relationship!)[PivotType.End], {
      x: handleBefore.x + 300,
      y: handleBefore.y + 200,
    });
  });
});

describe('Relationship control point release (BL5-99, BL5-41)', () => {
  type Pivot = { mouseDownHandler(event: Event): void };
  const pivotOf = (relationship: Relationship, type: PivotType): Pivot =>
    (relationship as unknown as { _controlPointsController: { _pivotLines: Pivot[] } })
      ._controlPointsController._pivotLines[type]!;

  const endOf = (relationship: Relationship, type: PivotType): PositionType => {
    const line = relationship.getLine();
    return { ...(type === PivotType.Start ? line.getFrom() : line.getTo()) };
  };

  /** Drags a handle to a client position and releases it there. Returns what the drag drew. */
  const dragAndRelease = (relationship: Relationship, type: PivotType, x: number, y: number) => {
    pivotOf(relationship, type).mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y }));
    const dragged = { end: endOf(relationship, type), handle: handles(relationship)[type] };
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y }));
    return dragged;
  };

  // Releases over and beside the target topic, at (400,400), and beside the source: a control
  // point relative to a snap point fits several snap points of an edge, and placing it again
  // from the centre of the topic picked another one ...
  it.each([
    [PivotType.End, 0, 0],
    [PivotType.End, 400, 400],
    [PivotType.End, 600, 300],
    [PivotType.End, 700, 200],
    [PivotType.Start, -300, 200],
    [PivotType.Start, 100, -100],
  ])(
    'keeps the end and the handle where the drag left them (pivot %s, %s,%s)',
    async (type, x, y) => {
      const { designer } = await buildDesigner();
      const relationship = relationshipOf(designer);
      relationship!.setOnFocus(true);

      const dragged = dragAndRelease(relationship!, type, x, y);

      expectPoint(endOf(relationship!, type), dragged.end);
      expectPoint(handles(relationship!)[type]!, dragged.handle);
    },
  );

  it.each([PivotType.Start, PivotType.End])(
    'gives back each dragged curve on undo and redo (pivot %s)',
    async (type) => {
      const { designer } = await buildDesigner();
      const relationship = relationshipOf(designer);
      relationship!.setOnFocus(true);

      const first = dragAndRelease(relationship!, type, 400, 400);
      const second = dragAndRelease(relationship!, type, 700, 200);

      designer.undo();
      expectPoint(endOf(relationship!, type), first.end);
      expectPoint(handles(relationship!)[type]!, first.handle);

      designer.redo();
      expectPoint(endOf(relationship!, type), second.end);
      expectPoint(handles(relationship!)[type]!, second.handle);
    },
  );

  it('keeps the released end on its topic when the topic moves', async () => {
    const { designer, topic } = await buildDesigner();
    const relationship = relationshipOf(designer);
    relationship!.setOnFocus(true);
    const dragged = dragAndRelease(relationship!, PivotType.End, 400, 400);

    const before = topic(5).getPosition();
    designer.getActionDispatcher().moveTopic(5, { x: before.x + 300, y: before.y + 200 });

    expectPoint(endOf(relationship!, PivotType.End), {
      x: dragged.end.x + 300,
      y: dragged.end.y + 200,
    });
    expectPoint(handles(relationship!)[PivotType.End], {
      x: dragged.handle.x + 300,
      y: dragged.handle.y + 200,
    });
  });
});
