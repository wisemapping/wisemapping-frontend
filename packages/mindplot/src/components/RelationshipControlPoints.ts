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
// eslint-disable-next-line max-classes-per-file
import { Ellipse, StraightLine } from '@wisemapping/web2d';
import Canvas from './Canvas';
import PositionType from './PositionType';
import Relationship from './Relationship';

export enum PivotType {
  Start = 0,
  End = 1,
}

class ControlPivotLine {
  private _dot: Ellipse;

  private _line: StraightLine;

  private _pivotType: PivotType;

  private _canvas: Canvas | null;

  private _relationship: Relationship;

  private _changeHander: () => void;

  private _moveRelHandler: (controlPointPosition: PositionType) => void;

  private _isVisible: boolean;

  private _wasDragged: boolean;

  private _mouseMoveHandler: (e: Event) => void;

  private _mouseUpHandler: () => void;

  private _mouseDownHandler: (event: Event) => void;

  private _keyDownHandler: (event: KeyboardEvent) => void;

  // The control point as it was when the drag started, put back if Escape abandons the drag ...
  private _dragStart: {
    controlPoint: PositionType;
    isCustom: boolean;
    linePosition: PositionType;
  } | null;

  constructor(
    pivotType: PivotType,
    relationship: Relationship,
    mouseMoveHandler: (controlPointPosition: PositionType) => void,
    changeHander: () => void,
  ) {
    this._pivotType = pivotType;
    this._changeHander = changeHander;
    this._moveRelHandler = mouseMoveHandler;
    this._relationship = relationship;

    // Build dot controller ...
    this._dot = new Ellipse({
      width: 6,
      height: 6,
      strokeWidth: 1,
      strokeStyle: 'solid',
      strokeColor: '#6589de',
      fillColor: 'gray',
      visibility: false,
    });
    this._dot.setCursor('pointer');
    this._dot.setTestId(
      `relctl:${pivotType}:${relationship.getSourceTopic()?.getId()}-${relationship
        .getTargetTopic()
        ?.getId()}`,
    );

    // Build line ...
    this._line = new StraightLine({ strokeColor: '#6589de', strokeWidth: 1, opacity: 0.3 });

    const mouseClick = (event: Event): void => {
      event.preventDefault();
      event.stopPropagation();
    };
    this._dot.addEvent('click', mouseClick);
    this._dot.addEvent('dblclick', mouseClick);

    // Register handled ...
    this._mouseMoveHandler = (e: Event) => {
      const originalEvent = e;
      return this.mouseMoveHandler(originalEvent as MouseEvent);
    };
    this._mouseUpHandler = () => this.mouseUpHandler();
    this._mouseDownHandler = (event: Event) => this.mouseDownHandler(event);
    this._keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.cancelDrag();
      }
    };
    this._dragStart = null;

    this._isVisible = false;
    this._wasDragged = false;
    this._canvas = null;
  }

  private mouseDownHandler(event: Event) {
    this._wasDragged = false;
    const line = this._relationship.getLine();
    const isStart = this._pivotType === PivotType.Start;
    this._dragStart = {
      controlPoint: line.getControlPoints()[this._pivotType],
      isCustom: isStart ? line.isSrcControlPointCustom() : line.isDestControlPointCustom(),
      linePosition: isStart ? line.getFrom() : line.getTo(),
    };
    // Listen on the document, so that a release outside the container still ends the drag. If the
    // window loses focus the release may never reach the page, so the drag ends there too ...
    window.document.addEventListener('mousemove', this._mouseMoveHandler);
    window.document.addEventListener('mouseup', this._mouseUpHandler);
    window.addEventListener('blur', this._mouseUpHandler);
    // ... and Escape abandons it, leaving the control point where it was.
    window.document.addEventListener('keydown', this._keyDownHandler);

    event.preventDefault();
    event.stopPropagation();
  }

  setVisibility(value: boolean) {
    if (this._isVisible !== value) {
      if (!value) {
        // Hiding the dot ends a drag ...
        this.removeDragListeners();
        this._dragStart = null;
        this._dot.removeEvent('mousedown', this._mouseDownHandler);
      } else {
        // Register events ...
        this._dot.addEvent('mousedown', this._mouseDownHandler);
      }

      // Make it visible ...
      this._dot.setVisibility(value);
      this._line.setVisibility(value);
    }

    this._isVisible = value;
    if (value) {
      // Register events ...
      this.redraw();
      this._line.moveToFront();
      this._dot.moveToFront();
    }
  }

  getPosition(): PositionType {
    const line = this._relationship.getLine();
    return line.getControlPoints()[this._pivotType];
  }

  /** True from the mousedown on the dot until the drag ends. */
  isDragging(): boolean {
    return this._dragStart !== null;
  }

  redraw(): void {
    if (this._isVisible) {
      const relationshipLine = this._relationship.getLine();
      const startPosition =
        this._pivotType === PivotType.End ? relationshipLine.getTo() : relationshipLine.getFrom();
      const ctrPosition = relationshipLine.getControlPoints()[this._pivotType];

      // The dot is an ellipse, positioned by its centre: on the control point ...
      const x = startPosition.x + ctrPosition.x;
      const y = startPosition.y + ctrPosition.y;
      this._line.setFrom(startPosition.x, startPosition.y);
      this._line.setTo(x, y);
      this._dot.setPosition(x, y);
    }
  }

  private mouseMoveHandler(event: MouseEvent) {
    const screen = this._canvas!.getScreenManager();
    const mousePosition = screen.getWorkspaceMousePosition(event);

    // Update relationship position ...
    const topic =
      this._pivotType === PivotType.Start
        ? this._relationship.getSourceTopic()
        : this._relationship.getTargetTopic();

    // Use the shared snap point calculation from Relationship
    const relPos = Relationship.calculateSnapPoint(topic, mousePosition);

    // The control point is relative to that snap point: move the line end there, so that the
    // handle of the curve is under the cursor ...
    const line = this._relationship.getLine();
    if (this._pivotType === PivotType.Start) {
      line.setFrom(relPos.x, relPos.y);
    } else {
      line.setTo(relPos.x, relPos.y);
    }

    const ctlPoint = { x: mousePosition.x - relPos.x, y: mousePosition.y - relPos.y };
    this._moveRelHandler(ctlPoint);

    // Update pivot, centred under the cursor ...
    this._dot.setPosition(mousePosition.x, mousePosition.y);

    // Update line ...
    this._line.setTo(mousePosition.x, mousePosition.y);
    const linePos =
      this._pivotType === PivotType.Start
        ? this._relationship.getLine().getFrom()
        : this._relationship.getLine().getTo();
    this._line.setFrom(linePos.x, linePos.y);
    this._wasDragged = true;
  }

  private removeDragListeners(): void {
    window.document.removeEventListener('mousemove', this._mouseMoveHandler);
    window.document.removeEventListener('mouseup', this._mouseUpHandler);
    window.removeEventListener('blur', this._mouseUpHandler);
    window.document.removeEventListener('keydown', this._keyDownHandler);
  }

  private cancelDrag() {
    this.removeDragListeners();

    const dragStart = this._dragStart;
    if (this._wasDragged && dragStart) {
      // Put the control point back, without recording a move ...
      const line = this._relationship.getLine();
      const { controlPoint, isCustom, linePosition } = dragStart;
      if (this._pivotType === PivotType.Start) {
        line.setFrom(linePosition.x, linePosition.y);
        line.setSrcControlPoint(controlPoint);
        line.setIsSrcControlPointCustom(isCustom);
      } else {
        line.setTo(linePosition.x, linePosition.y);
        line.setDestControlPoint(controlPoint);
        line.setIsDestControlPointCustom(isCustom);
      }
      this._relationship.redraw();
    }
    this._wasDragged = false;
    this._dragStart = null;
  }

  private mouseUpHandler() {
    this.removeDragListeners();
    this._dragStart = null;

    // A plain click on the dot does not move the control point, so there is nothing to record ...
    if (this._wasDragged) {
      this._wasDragged = false;
      this._changeHander();
    }
  }

  addToWorkspace(workspace: Canvas): void {
    this._canvas = workspace;

    workspace.append(this._line);
    workspace.append(this._dot);
  }

  removeFromWorkspace(workspace: Canvas) {
    // Hide all elements ...
    this.setVisibility(false);

    // Remove elements ...
    workspace.removeChild(this._line);
    workspace.removeChild(this._dot);
  }
}

class RelationshipControlPoints {
  // Visual element ...
  private _pivotLines: [ControlPivotLine, ControlPivotLine];

  private _relationship: Relationship;

  constructor(relationship: Relationship) {
    this._relationship = relationship;
    const startControlLine = new ControlPivotLine(
      PivotType.Start,
      relationship,
      (controlPointPosition) => {
        const line = this._relationship.getLine();
        line.setSrcControlPoint(controlPointPosition);
        line.setIsSrcControlPointCustom(true);
        relationship.redraw();
      },
      () => {
        relationship.rememberReleasedControlPoint(PivotType.Start);
        const actionDispatcher = relationship.getSourceTopic().getActionDispatcher();
        actionDispatcher.moveControlPoint(
          relationship.getModel(),
          this.getControlPointPosition(PivotType.Start),
          PivotType.Start,
        );
      },
    );

    const endControlLine = new ControlPivotLine(
      PivotType.End,
      relationship,
      (controlPointPosition) => {
        const line = this._relationship.getLine();
        line.setDestControlPoint(controlPointPosition);
        line.setIsDestControlPointCustom(true);
        relationship.redraw();
      },
      () => {
        relationship.rememberReleasedControlPoint(PivotType.End);
        const actionDispatcher = relationship.getSourceTopic().getActionDispatcher();
        actionDispatcher.moveControlPoint(
          relationship.getModel(),
          this.getControlPointPosition(PivotType.End),
          PivotType.End,
        );
      },
    );
    this._pivotLines = [startControlLine, endControlLine];
  }

  addToWorkspace(workspace: Canvas): void {
    this._pivotLines.forEach((pivot) => workspace.append(pivot));
  }

  removeFromWorkspace(workspace: Canvas) {
    this._pivotLines.forEach((pivot) => workspace.removeChild(pivot));
  }

  getRelationship() {
    return this._relationship;
  }

  redraw() {
    this._pivotLines.forEach((pivot) => pivot.redraw());
  }

  setVisibility(value: boolean) {
    this._pivotLines.forEach((pivot) => pivot.setVisibility(value));
  }

  getControlPointPosition(pivotType: PivotType): PositionType {
    return this._pivotLines[pivotType].getPosition();
  }

  /** True while the control point of that end is being dragged. */
  isDragging(pivotType: PivotType): boolean {
    return this._pivotLines[pivotType].isDragging();
  }
}

export default RelationshipControlPoints;
