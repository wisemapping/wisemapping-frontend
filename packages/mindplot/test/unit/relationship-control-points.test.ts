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

import { Ellipse } from '@wisemapping/web2d';
import ActionDispatcher, { CommandDispatcher } from '../../src/components/ActionDispatcher';
import Canvas from '../../src/components/Canvas';
import Relationship from '../../src/components/Relationship';
import RelationshipControlPoints, {
  PivotType,
} from '../../src/components/RelationshipControlPoints';
import ScreenManager from '../../src/components/ScreenManager';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {},
}));

describe('Relationship control points', () => {
  describe('Relationship.setDestControlPoint', () => {
    const buildRelationship = () => {
      const relationship = Object.create(Relationship.prototype);
      relationship._line = { setSrcControlPoint: jest.fn(), setDestControlPoint: jest.fn() };
      relationship._focusShape = { setSrcControlPoint: jest.fn(), setDestControlPoint: jest.fn() };
      relationship._startArrow = { setControlPoint: jest.fn() };
      relationship._endArrow = { setControlPoint: jest.fn() };
      return relationship;
    };

    it('updates the destination control point of the focus shape', () => {
      const relationship = buildRelationship();
      const control = { x: 12, y: -7 };

      relationship.setDestControlPoint(control);

      expect(relationship._line.setDestControlPoint).toHaveBeenCalledWith(control);
      expect(relationship._focusShape.setDestControlPoint).toHaveBeenCalledWith(control);
      expect(relationship._focusShape.setSrcControlPoint).not.toHaveBeenCalled();
      expect(relationship._endArrow.setControlPoint).toHaveBeenCalledWith(control);
    });

    it('updates the source control point of the focus shape', () => {
      const relationship = buildRelationship();
      const control = { x: 3, y: 4 };

      relationship.setSrcControlPoint(control);

      expect(relationship._focusShape.setSrcControlPoint).toHaveBeenCalledWith(control);
      expect(relationship._focusShape.setDestControlPoint).not.toHaveBeenCalled();
    });
  });

  describe('dragging a control point', () => {
    let container: HTMLDivElement;
    let moveControlPoint: jest.Mock;
    let controlPoints: RelationshipControlPoints;
    let line: {
      getControlPoints: jest.Mock;
      getFrom: jest.Mock;
      getTo: jest.Mock;
      setSrcControlPoint: jest.Mock;
      setDestControlPoint: jest.Mock;
      setIsSrcControlPointCustom: jest.Mock;
      setIsDestControlPointCustom: jest.Mock;
      isSrcControlPointCustom: jest.Mock;
      isDestControlPointCustom: jest.Mock;
      setFrom: jest.Mock;
      setTo: jest.Mock;
    };
    let redraw: jest.Mock;
    let rememberReleasedControlPoint: jest.Mock;

    const pivot = (type: PivotType) =>
      (
        controlPoints as unknown as {
          _pivotLines: { mouseDownHandler(event: Event): void }[];
        }
      )._pivotLines[type];

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
      const screenManager = new ScreenManager(container);

      moveControlPoint = jest.fn();
      jest
        .spyOn(ActionDispatcher, 'getInstance')
        .mockReturnValue({ moveControlPoint } as unknown as CommandDispatcher);
      jest.spyOn(Relationship, 'calculateSnapPoint').mockReturnValue({ x: 0, y: 0 });

      line = {
        getControlPoints: jest.fn().mockReturnValue([
          { x: 10, y: 10 },
          { x: -10, y: -10 },
        ]),
        getFrom: jest.fn().mockReturnValue({ x: 0, y: 0 }),
        getTo: jest.fn().mockReturnValue({ x: 100, y: 100 }),
        setSrcControlPoint: jest.fn(),
        setDestControlPoint: jest.fn(),
        setIsSrcControlPointCustom: jest.fn(),
        setIsDestControlPointCustom: jest.fn(),
        isSrcControlPointCustom: jest.fn().mockReturnValue(false),
        isDestControlPointCustom: jest.fn().mockReturnValue(true),
        setFrom: jest.fn(),
        setTo: jest.fn(),
      };
      redraw = jest.fn();
      rememberReleasedControlPoint = jest.fn();
      // A topic without a designer: it runs its commands through ActionDispatcher.getInstance().
      const topic = { getId: () => 1, getActionDispatcher: () => ActionDispatcher.getInstance() };
      const relationship = {
        getSourceTopic: () => topic,
        getTargetTopic: () => topic,
        getLine: () => line,
        getModel: () => ({ getId: () => 7 }),
        redraw,
        rememberReleasedControlPoint,
      } as unknown as Relationship;

      controlPoints = new RelationshipControlPoints(relationship);
      const canvas = {
        getScreenManager: () => screenManager,
        append: (elem: { addToWorkspace?: (c: unknown) => void }) => elem.addToWorkspace?.(canvas),
      };
      controlPoints.addToWorkspace(canvas as unknown as Canvas);
    });

    // W4: the dot stroke is given with typed keys instead of the '1 solid #6589de' string.
    it('draws the handle dots with a 1 px solid #6589de stroke', () => {
      const { _dot: dot } = pivot(PivotType.Start) as unknown as { _dot: Ellipse };
      expect(dot.getStroke()).toEqual({ color: '#6589de', style: 'solid', opacity: 1, width: 1 });
    });

    afterEach(() => {
      container.remove();
      jest.restoreAllMocks();
    });

    it.each([PivotType.Start, PivotType.End])(
      'does not dispatch a move when the dot is clicked without dragging (pivot %s)',
      (type) => {
        pivot(type)!.mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
        container.dispatchEvent(
          new MouseEvent('mouseup', { clientX: 5, clientY: 5, bubbles: true }),
        );

        expect(moveControlPoint).not.toHaveBeenCalled();
      },
    );

    it.each([PivotType.Start, PivotType.End])(
      'dispatches a move when the dot is dragged (pivot %s)',
      (type) => {
        pivot(type)!.mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
        container.dispatchEvent(
          new MouseEvent('mousemove', { clientX: 40, clientY: 30, bubbles: true }),
        );
        container.dispatchEvent(
          new MouseEvent('mouseup', { clientX: 40, clientY: 30, bubbles: true }),
        );

        expect(moveControlPoint).toHaveBeenCalledTimes(1);
        expect(moveControlPoint.mock.calls[0][2]).toBe(type);
        // ... where the drag left the end, before the move places it again (BL5-99).
        expect(rememberReleasedControlPoint).toHaveBeenCalledWith(type);
        expect(rememberReleasedControlPoint.mock.invocationCallOrder[0]).toBeLessThan(
          moveControlPoint.mock.invocationCallOrder[0]!,
        );
      },
    );

    it('does not dispatch again on a later click after a drag', () => {
      const start = pivot(PivotType.Start);
      start!.mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
      container.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 40, clientY: 30, bubbles: true }),
      );
      container.dispatchEvent(
        new MouseEvent('mouseup', { clientX: 40, clientY: 30, bubbles: true }),
      );
      moveControlPoint.mockClear();

      start!.mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
      container.dispatchEvent(
        new MouseEvent('mouseup', { clientX: 40, clientY: 30, bubbles: true }),
      );

      expect(moveControlPoint).not.toHaveBeenCalled();
    });

    it('ends the drag when the button is released outside the container', () => {
      pivot(PivotType.Start)!.mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
      container.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 40, clientY: 30, bubbles: true }),
      );
      document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      expect(moveControlPoint).toHaveBeenCalledTimes(1);

      // With the button up the control point must no longer follow the cursor ...
      line.setSrcControlPoint.mockClear();
      container.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 60, clientY: 60, bubbles: true }),
      );
      expect(line.setSrcControlPoint).not.toHaveBeenCalled();
    });

    it('keeps following the cursor while it is outside the container', () => {
      pivot(PivotType.End)!.mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
      document.body.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 900, clientY: 900, bubbles: true }),
      );

      expect(line.setDestControlPoint).toHaveBeenCalledWith({ x: 900, y: 900 });
      document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    it('ends the drag when the window loses focus', () => {
      pivot(PivotType.Start)!.mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
      container.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 40, clientY: 30, bubbles: true }),
      );
      window.dispatchEvent(new Event('blur'));

      // The line already shows the new control point, so it is recorded as on a release ...
      expect(moveControlPoint).toHaveBeenCalledTimes(1);

      line.setSrcControlPoint.mockClear();
      container.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 60, clientY: 60, bubbles: true }),
      );
      container.dispatchEvent(
        new MouseEvent('mouseup', { clientX: 60, clientY: 60, bubbles: true }),
      );
      expect(line.setSrcControlPoint).not.toHaveBeenCalled();
      expect(moveControlPoint).toHaveBeenCalledTimes(1);
    });

    it('puts the start control point back when Escape abandons the drag', () => {
      pivot(PivotType.Start)!.mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
      container.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 40, clientY: 30, bubbles: true }),
      );
      expect(line.setIsSrcControlPointCustom).toHaveBeenLastCalledWith(true);
      redraw.mockClear();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      expect(line.setFrom).toHaveBeenLastCalledWith(0, 0);
      expect(line.setSrcControlPoint).toHaveBeenLastCalledWith({ x: 10, y: 10 });
      expect(line.setIsSrcControlPointCustom).toHaveBeenLastCalledWith(false);
      expect(redraw).toHaveBeenCalled();
      expect(moveControlPoint).not.toHaveBeenCalled();

      // The drag is over: neither moving nor releasing the button records anything ...
      line.setSrcControlPoint.mockClear();
      container.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 60, clientY: 60, bubbles: true }),
      );
      container.dispatchEvent(
        new MouseEvent('mouseup', { clientX: 60, clientY: 60, bubbles: true }),
      );
      expect(line.setSrcControlPoint).not.toHaveBeenCalled();
      expect(moveControlPoint).not.toHaveBeenCalled();
    });

    it('puts a custom end control point back as custom when Escape abandons the drag', () => {
      pivot(PivotType.End)!.mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
      container.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 40, clientY: 30, bubbles: true }),
      );

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      expect(line.setTo).toHaveBeenLastCalledWith(100, 100);
      expect(line.setDestControlPoint).toHaveBeenLastCalledWith({ x: -10, y: -10 });
      expect(line.setIsDestControlPointCustom).toHaveBeenLastCalledWith(true);
      expect(moveControlPoint).not.toHaveBeenCalled();
    });

    // The handle is an ellipse, positioned by its centre: it is drawn on the control point
    // (BL5-100), at its end of the guide line.
    type Handle = {
      _isVisible: boolean;
      redraw(): void;
      _dot: { getPosition(): { x: number; y: number } };
      _line: { getTo(): { x: number; y: number } };
    };
    const handle = (type: PivotType) =>
      (controlPoints as unknown as { _pivotLines: Handle[] })._pivotLines[type];
    // Shown as when the relationship is focused (the stub canvas holds no SVG nodes) ...
    const show = (type: PivotType) => {
      handle(type)!._isVisible = true;
      handle(type)!.redraw();
    };

    it.each([
      [PivotType.Start, { x: 10, y: 10 }],
      [PivotType.End, { x: 90, y: 90 }],
    ])('centres the handle on the control point (pivot %s)', (type, expected) => {
      show(type);

      expect(handle(type)!._dot.getPosition()).toEqual(expected);
      expect(handle(type)!._line.getTo()).toEqual(expected);
    });

    it('keeps the handle centred under the cursor while dragging', () => {
      show(PivotType.End);
      pivot(PivotType.End)!.mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
      container.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 40, clientY: 30, bubbles: true }),
      );

      expect(handle(PivotType.End)!._dot.getPosition()).toEqual({ x: 40, y: 30 });
      expect(handle(PivotType.End)!._line.getTo()).toEqual({ x: 40, y: 30 });
      document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    it('ignores other keys during the drag', () => {
      pivot(PivotType.Start)!.mouseDownHandler(new MouseEvent('mousedown', { cancelable: true }));
      container.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 40, clientY: 30, bubbles: true }),
      );
      // The drag moves the line end to the snap point under the cursor (BL4-30) ...
      expect(line.setFrom).toHaveBeenLastCalledWith(0, 0);
      line.setFrom.mockClear();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      container.dispatchEvent(
        new MouseEvent('mouseup', { clientX: 40, clientY: 30, bubbles: true }),
      );

      expect(line.setFrom).not.toHaveBeenCalled();
      expect(moveControlPoint).toHaveBeenCalledTimes(1);
    });
  });
});
