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
import { Elipse, Line, Point } from '@wisemapping/web2d';
import { $defined } from '@wisemapping/core-js';

import Shape from './util/Shape';
import ActionDispatcher from './ActionDispatcher';
import Workspace from './Workspace';

class ControlPoint {
  private control1: Elipse;

  private control2: Elipse;

  private _controlPointsController: Elipse[];

  private _controlLines: Line[];

  private _isBinded: boolean;

  _line: Line;

  private _workspace: Workspace;

  private _endPoint: any[];

  private _orignalCtrlPoint: any;

  private _controls: any;

  private _mouseMoveFunction: (e: Event) => void;

  private _mouseUpFunction: (e: Event) => void;

  constructor() {
    this.control1 = new Elipse({
      width: 6,
      height: 6,
      stroke: '1 solid #6589de',
      fillColor: 'gray',
      visibility: false,
    });
    this.control1.setCursor('pointer');

    this.control2 = new Elipse({
      width: 6,
      height: 6,
      stroke: '1 solid #6589de',
      fillColor: 'gray',
      visibility: false,
    });
    this.control2.setCursor('pointer');

    this._controlPointsController = [this.control1, this.control2];
    this._controlLines = [
      new Line({ strokeColor: '#6589de', strokeWidth: 1, opacity: 0.3 }),
      new Line({ strokeColor: '#6589de', strokeWidth: 1, opacity: 0.3 }),
    ];

    this._isBinded = false;
    const me = this;
    this._controlPointsController[0].addEvent('mousedown', (event) => {
      me._mouseDown(event, ControlPoint.FROM, me);
    });
    this._controlPointsController[0].addEvent('click', (event) => {
      me._mouseClick(event);
    });
    this._controlPointsController[0].addEvent('dblclick', (event) => {
      me._mouseClick(event);
    });

    this._controlPointsController[1].addEvent('mousedown', (event) => {
      me._mouseDown(event, ControlPoint.TO, me);
    });
    this._controlPointsController[1].addEvent('click', (event) => {
      me._mouseClick(event);
    });
    this._controlPointsController[1].addEvent('dblclick', (event) => {
      me._mouseClick(event);
    });
  }

  setLine(line: Line) {
    if ($defined(this._line)) {
      this._removeLine();
    }
    this._line = line;
    this._createControlPoint();
    this._endPoint = [];
    this._orignalCtrlPoint = [];
    this._orignalCtrlPoint[0] = { ...this._controls[0] };
    this._orignalCtrlPoint[1] = { ...this._controls[1] };
    this._endPoint[0] = { ...this._line.getLine().getFrom() };
    this._endPoint[1] = { ...this._line.getLine().getTo() };
  }

  setControlPointTestId(ctrlPoint1, ctrlPoint2) {
    this.control1.setTestId(ctrlPoint1);
    this.control2.setTestId(ctrlPoint2);
  }

  redraw() {
    if ($defined(this._line)) this._createControlPoint();
  }

  private _createControlPoint() {
    this._controls = this._line.getLine().getControlPoints();
    let pos = this._line.getLine().getFrom();
    this._controlPointsController[0].setPosition(
      this._controls[ControlPoint.FROM].x + pos.x,
      this._controls[ControlPoint.FROM].y + pos.y - 3,
    );
    this._controlLines[0].setFrom(pos.x, pos.y);
    this._controlLines[0].setTo(
      this._controls[ControlPoint.FROM].x + pos.x + 3,
      this._controls[ControlPoint.FROM].y + pos.y,
    );
    pos = this._line.getLine().getTo();
    this._controlLines[1].setFrom(pos.x, pos.y);
    this._controlLines[1].setTo(
      this._controls[ControlPoint.TO].x + pos.x + 3,
      this._controls[ControlPoint.TO].y + pos.y,
    );
    this._controlPointsController[1].setPosition(
      this._controls[ControlPoint.TO].x + pos.x,
      this._controls[ControlPoint.TO].y + pos.y - 3,
    );
  }

  private _removeLine() {
    // Overwrite default behaviour ...
  }

  private _mouseDown(event: Event, point, me) {
    if (!this._isBinded) {
      this._isBinded = true;
      this._mouseMoveFunction = (e) => {
        me._mouseMoveEvent(e, point, me);
      };

      this._workspace.getScreenManager().addEvent('mousemove', this._mouseMoveFunction);
      this._mouseUpFunction = (e: Event) => {
        me._mouseUp(e, point, me);
      };
      this._workspace.getScreenManager().addEvent('mouseup', this._mouseUpFunction);
    }
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  private _mouseMoveEvent(event: MouseEvent, point: Point) {
    const screen = this._workspace.getScreenManager();
    const pos = screen.getWorkspaceMousePosition(event);

    let cords;
    if (point === 0) {
      cords = Shape.calculateRelationShipPointCoordinates(this._line.getSourceTopic(), pos);
      this._line.setFrom(cords.x, cords.y);
      this._line.setSrcControlPoint(new Point(pos.x - cords.x, pos.y - cords.y));
    } else {
      cords = Shape.calculateRelationShipPointCoordinates(this._line.getTargetTopic(), pos);
      this._line.setTo(cords.x, cords.y);
      this._line.setDestControlPoint(new Point(pos.x - cords.x, pos.y - cords.y));
    }

    this._controls[point].x = pos.x - cords.x;
    this._controls[point].y = pos.y - cords.y;
    this._controlPointsController[point].setPosition(pos.x - 5, pos.y - 3);
    this._controlLines[point].setFrom(cords.x, cords.y);
    this._controlLines[point].setTo(pos.x - 2, pos.y);
    this._line.getLine().updateLine(point);
  }

  private _mouseUp(event: MouseEvent, point: Point) {
    this._workspace.getScreenManager().removeEvent('mousemove', this._mouseMoveFunction);
    this._workspace.getScreenManager().removeEvent('mouseup', this._mouseUpFunction);

    const actionDispatcher = ActionDispatcher.getInstance();
    actionDispatcher.moveControlPoint(this, point);
    this._isBinded = false;
  }

  _mouseClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  setVisibility(visible: boolean) {
    if (visible) {
      this._controlLines[0].moveToFront();
      this._controlLines[1].moveToFront();
      this._controlPointsController[0].moveToFront();
      this._controlPointsController[1].moveToFront();
    }
    this._controlPointsController[0].setVisibility(visible);
    this._controlPointsController[1].setVisibility(visible);
    this._controlLines[0].setVisibility(visible);
    this._controlLines[1].setVisibility(visible);
  }

  addToWorkspace(workspace: Workspace): void {
    this._workspace = workspace;
    workspace.append(this._controlPointsController[0]);
    workspace.append(this._controlPointsController[1]);
    workspace.append(this._controlLines[0]);
    workspace.append(this._controlLines[1]);
  }

  removeFromWorkspace(workspace: Workspace) {
    this._workspace = null;
    workspace.removeChild(this._controlPointsController[0]);
    workspace.removeChild(this._controlPointsController[1]);
    workspace.removeChild(this._controlLines[0]);
    workspace.removeChild(this._controlLines[1]);
  }

  getControlPoint(index: number): ControlPoint {
    return this._controls[index];
  }

  getOriginalEndPoint(index: number) {
    return this._endPoint[index];
  }

  getOriginalCtrlPoint(index: number): ControlPoint {
    return this._orignalCtrlPoint[index];
  }

  static FROM = 0;

  static TO = 1;
}

export default ControlPoint;
