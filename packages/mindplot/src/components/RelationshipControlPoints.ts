/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
// eslint-disable-next-line max-classes-per-file
import { Elipse, Line } from '@wisemapping/web2d';
import Shape from './util/Shape';
import ActionDispatcher from './ActionDispatcher';
import Workspace from './Workspace';
import PositionType from './PositionType';
import Relationship from './Relationship';

// eslint-disable-next-line no-shadow
export enum PivotType {
  Start = 0,
  End = 1,
}

class ControlPivotLine {
  private _dot: Elipse;

  private _line: Line;

  private _pivotType: PivotType;

  private _workspace: Workspace;

  private _relationship: Relationship;

  private _changeHander: () => void;

  private _moveRelHandler: (controlPointPosition: PositionType) => void;

  private _isVisible: boolean;

  private _mouseMoveHandler: (e: MouseEvent) => void;

  private _mouseUpHandler: () => void;

  private _mouseDownHandler: (event: MouseEvent) => void;

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
    this._dot = new Elipse({
      width: 6,
      height: 6,
      stroke: '1 solid #6589de',
      fillColor: 'gray',
      visibility: false,
    });
    this._dot.setCursor('pointer');

    // Build line ...
    this._line = new Line({ strokeColor: '#6589de', strokeWidth: 1, opacity: 0.3 });

    const mouseClick = (event: MouseEvent): boolean => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };
    this._dot.addEvent('click', mouseClick);
    this._dot.addEvent('dblclick', mouseClick);

    // Register handled ...
    this._mouseMoveHandler = (e: MouseEvent) => this.mouseMoveHandler(e);
    this._mouseUpHandler = () => this.mouseUpHandler();
    this._mouseDownHandler = (event: MouseEvent) => this.mouseDownHandler(event);
  }

  private mouseDownHandler(event: MouseEvent) {
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
        startPosition.x + ctrPosition.x - 8,
        startPosition.y + ctrPosition.y - 8,
      );
    }
  }

  private mouseMoveHandler(event: MouseEvent) {
    const screen = this._workspace.getScreenManager();
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
    this._dot.setPosition(mousePosition.x - 8, mousePosition.y - 8);

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

  addToWorkspace(workspace: Workspace): void {
    this._workspace = workspace;

    workspace.append(this._line);
    workspace.append(this._dot);
  }

  removeFromWorkspace(workspace: Workspace) {
    // Hide all elements ...
    this.setVisibility(false);

    // Remove elements ...
    workspace.removeChild(this._line);
    workspace.removeChild(this._dot);
  }

  private getWorkspace(): Workspace {
    return this._workspace!;
  }
}

class RelationshipControlPoints {
  // Visual element ...
  private _pivotLines: [ControlPivotLine, ControlPivotLine];

  private _relationship: Relationship;

  private _relationshipLinePositions: [PositionType, PositionType];

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
        actionDispatcher.moveControlPoint(this, PivotType.Start);

        relationship.setOnFocus(true);
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
        actionDispatcher.moveControlPoint(this, PivotType.End);

        relationship.setOnFocus(true);
      },
    );
    this._pivotLines = [startControlLine, endControlLine];
  }

  addToWorkspace(workspace: Workspace): void {
    this._pivotLines.forEach((pivot) => workspace.append(pivot));
  }

  removeFromWorkspace(workspace: Workspace) {
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

  getRelationshipPosition(index: number): PositionType {
    return { ...this._relationshipLinePositions[index] };
  }
}

export default RelationshipControlPoints;
