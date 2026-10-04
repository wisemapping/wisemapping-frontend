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

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import { CurvedLine } from '@wisemapping/web2d';
import { buildDesigner, SAMPLE_MAP } from './commands/designer-harness';
import Relationship from '../../src/components/Relationship';
import PositionType from '../../src/components/PositionType';
import Shape from '../../src/components/util/Shape';
import ActionDispatcher from '../../src/components/ActionDispatcher';
import { PivotType } from '../../src/components/RelationshipControlPoints';

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

    expect(relationship.isSrcControlPointCustom()).toBe(false);
    expect(relationship.isDestControlPointCustom()).toBe(false);
  });

  it('follows a moved topic when the model has no control points', async () => {
    const { designer, topic } = await buildDesigner();
    const relationship = relationshipOf(designer);

    const target = topic(5);
    const pos = target.getPosition();
    designer.getActionDispatcher().moveTopic(5, { x: pos.x + 300, y: pos.y + 200 });

    // The curve is the default one for the new ends: it does not keep its old shape ...
    expect(relationship.isDestControlPointCustom()).toBe(false);
    const line = relationship.getLine();
    const expected = Shape.calculateDefaultControlPoints(line.getFrom(), line.getTo());
    expect(line.getControlPoints()).toEqual(expected);
  });

  it('applies the control points stored in the model', async () => {
    const { designer } = await buildDesigner(withControlPoints('-80,-56', '110,-116'));
    const relationship = relationshipOf(designer);

    expect(relationship.isSrcControlPointCustom()).toBe(true);
    expect(relationship.isDestControlPointCustom()).toBe(true);
    const [src, dest] = relationship.getLine().getControlPoints();
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
    expect(relationship.isSrcControlPointCustom()).toBe(true);
    expect(relationship.isDestControlPointCustom()).toBe(false);
    const [srcHandleBefore] = handles(relationship);

    const target = topic(5);
    const pos = target.getPosition();
    designer.getActionDispatcher().moveTopic(5, { x: pos.x + 300, y: pos.y + 200 });

    const [srcHandle, destHandle] = handles(relationship);
    // The custom handle keeps its place ...
    expectPoint(srcHandle, srcHandleBefore);
    // ... and the default one follows the topic.
    const line = relationship.getLine();
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
      ._controlPointsController._pivotLines[type];

  const drag = (relationship: Relationship, type: PivotType) => {
    relationship.setOnFocus(true);
    pivotOf(relationship, type).mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 520, clientY: 480 }));
  };

  it('marks a dragged control point as custom, and undo puts the default back', async () => {
    const { designer } = await buildDesigner();
    const relationship = relationshipOf(designer);

    drag(relationship, PivotType.Start);
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 520, clientY: 480 }));

    expect(relationship.isSrcControlPointCustom()).toBe(true);
    expect(relationship.isDestControlPointCustom()).toBe(false);
    expect(relationship.getModel().getSrcCtrlPoint()).not.toBeNull();

    designer.undo();
    expect(relationship.isSrcControlPointCustom()).toBe(false);
    const line = relationship.getLine();
    expect(line.getControlPoints()).toEqual(
      Shape.calculateDefaultControlPoints(line.getFrom(), line.getTo()),
    );
  });

  it.each([PivotType.Start, PivotType.End])(
    'redo puts the dragged curve back where it was (pivot %s)',
    async (type) => {
      const { designer } = await buildDesigner();
      const relationship = relationshipOf(designer);
      const line = relationship.getLine();

      drag(relationship, type);
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 520, clientY: 480 }));
      const dragged = handles(relationship);

      designer.undo();
      designer.redo();

      const [src, dest] = handles(relationship);
      expectPoint(src, dragged[0]);
      expectPoint(dest, dragged[1]);
      expect(line.getControlPoints()[type]).toEqual(
        type === PivotType.Start
          ? relationship.getModel().getSrcCtrlPoint()
          : relationship.getModel().getDestCtrlPoint(),
      );
    },
  );

  it.each([PivotType.Start, PivotType.End])(
    'puts the curve back and records nothing when Escape abandons the drag (pivot %s)',
    async (type) => {
      const { designer, save } = await buildDesigner(withControlPoints('-80,-56', ''));
      const relationship = relationshipOf(designer);
      const line = relationship.getLine();
      const before = {
        from: line.getFrom(),
        to: line.getTo(),
        controlPoints: line.getControlPoints(),
      };
      const saved = save();
      const moveControlPoint = jest.spyOn(ActionDispatcher.getInstance(), 'moveControlPoint');

      drag(relationship, type);
      expect(line.getControlPoints()).not.toEqual(before.controlPoints);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 520, clientY: 480 }));

      expect(relationship.isSrcControlPointCustom()).toBe(true);
      expect(relationship.isDestControlPointCustom()).toBe(false);
      expectPoint(line.getFrom(), before.from);
      expectPoint(line.getTo(), before.to);
      expectPoint(line.getControlPoints()[0], before.controlPoints[0]);
      expectPoint(line.getControlPoints()[1], before.controlPoints[1]);
      expect(save()).toEqual(saved);
      expect(moveControlPoint).not.toHaveBeenCalled();
    },
  );
});
