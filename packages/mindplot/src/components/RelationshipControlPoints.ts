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
import Shape from './util/Shape';
import ActionDispatcher from './ActionDispatcher';
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

  private _mouseMoveHandler: (e: Event) => void;

  private _mouseUpHandler: () => void;

  private _mouseDownHandler: (event: Event) => void;

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
      stroke: '1 solid #6589de',
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

    const mouseClick = (event: MouseEvent): boolean => {
      event.preventDefault();
      event.stopPropagation();
      return false;
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

    this._isVisible = false;
    this._canvas = null;
  }

  private mouseDownHandler(event: Event) {
    const screenManager = this.getWorkspace().getScreenManager();
    screenManager.addEvent('mousemove', this._mouseMoveHandler);
    screenManager.addEvent('mouseup', this._mouseUpHandler);

    event.preventDefault();
    event.stopPropagation();
  }

  setVisibility(value: boolean) {
    if (this._isVisible !== value) {
      const screenManager = this.getWorkspace().getScreenManager();
      if (!value) {
        screenManager.removeEvent('mousemove', this._mouseMoveHandler);
        screenManager.removeEvent('mouseup', this._mouseUpHandler);
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

  redraw(): void {
    if (this._isVisible) {
      const relationshipLine = this._relationship.getLine();
      const startPosition =
        this._pivotType === PivotType.End ? relationshipLine.getTo() : relationshipLine.getFrom();
      const ctrPosition = relationshipLine.getControlPoints()[this._pivotType];

      this._line.setFrom(startPosition.x, startPosition.y);
      this._line.setTo(startPosition.x + ctrPosition.x - 5, startPosition.y + ctrPosition.y - 5);

      this._dot.setPosition(
        startPosition.x + ctrPosition.x - 5,
        startPosition.y + ctrPosition.y - 5,
      );
    }
  }

  private mouseMoveHandler(event: MouseEvent) {
    const screen = this._canvas!.getScreenManager();
    const mousePosition = screen.getWorkspaceMousePosition(event);

    // Update relatioship position ...
    const topic =
      this._pivotType === PivotType.Start
        ? this._relationship.getSourceTopic()
        : this._relationship.getTargetTopic();

    let relPos = Shape.calculateRelationShipPointCoordinates(topic, mousePosition);
    const ctlPoint = { x: mousePosition.x - relPos.x, y: mousePosition.y - relPos.y };
    this._moveRelHandler(ctlPoint);

    // Update pivot ...
    this._dot.setPosition(mousePosition.x - 5, mousePosition.y - 5);

    // Update line ...
    this._line.setTo(mousePosition.x - 5, mousePosition.y - 5);
    relPos =
      this._pivotType === PivotType.Start
        ? this._relationship.getLine().getFrom()
        : this._relationship.getLine().getTo();
    this._line.setFrom(relPos.x, relPos.y);
  }

  private mouseUpHandler() {
    const screenManager = this.getWorkspace().getScreenManager();
    screenManager.removeEvent('mousemove', this._mouseMoveHandler);
    screenManager.removeEvent('mouseup', this._mouseUpHandler);

    this._changeHander();
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

  private getWorkspace(): Canvas {
    return this._canvas!;
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
        relationship.redraw();
      },
      () => {
        const actionDispatcher = ActionDispatcher.getInstance();
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
        relationship.redraw();
      },
      () => {
        const actionDispatcher = ActionDispatcher.getInstance();
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
}

export default RelationshipControlPoints;
