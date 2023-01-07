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
import { $assert, $defined } from '@wisemapping/core-js';
import { Arrow, Point, CurvedLine } from '@wisemapping/web2d';
import ConnectionLine, { LineType } from './ConnectionLine';
import RelationshipControlPoints from './RelationshipControlPoints';
import RelationshipModel from './model/RelationshipModel';
import PositionType from './PositionType';
import Topic from './Topic';
import Shape from './util/Shape';
import Workspace from './Workspace';

class Relationship extends ConnectionLine {
  private _focusShape: CurvedLine;

  private _onFocus: boolean;

  private _isInWorkspace: boolean;

  private _controlPointsController: RelationshipControlPoints;

  private _startArrow: Arrow;

  private _showEndArrow: Arrow;

  private _endArrow: Arrow;

  private _onFocusHandler: (event: MouseEvent) => void;

  private _showStartArrow: Arrow;

  private _model: RelationshipModel;

  constructor(sourceNode: Topic, targetNode: Topic, model: RelationshipModel) {
    super(sourceNode, targetNode, LineType.THIN_CURVED);
    this._model = model;

    const strokeColor = Relationship.getStrokeColor();

    // Build line ..
    this._line.setIsSrcControlPointCustom(false);
    this._line.setIsDestControlPointCustom(false);
    this._line.setCursor('pointer');
    this._line.setStroke(1, 'solid', strokeColor);
    this._line.setDashed(4, 2);
    this._line.setTestId(`${model.getFromNode()}-${model.getToNode()}-relationship`);

    // Build focus shape ...
    this._focusShape = this.createLine(LineType.THIN_CURVED);
    this._focusShape.setStroke(8, 'solid', '#3f96ff');
    this._focusShape.setIsSrcControlPointCustom(false);
    this._focusShape.setIsDestControlPointCustom(false);
    this._focusShape.setVisibility(true);
    this._focusShape.setOpacity(0);
    this._focusShape.setCursor('pointer');

    // Build arrow ...
    this._startArrow = new Arrow();
    this._startArrow.setStrokeColor(strokeColor);
    this._startArrow.setStrokeWidth(2);
    this.setShowStartArrow(true);

    // Share style is disable ...
    if (this._showEndArrow) {
      this._endArrow = new Arrow();
      this._endArrow.setStrokeColor(strokeColor);
      this._endArrow.setStrokeWidth(2);
    }
    this._onFocus = false;
    this._isInWorkspace = false;
    this._controlPointsController = new RelationshipControlPoints(this);

    // Position the line ...
    if (model.getSrcCtrlPoint()) {
      const srcPoint = { ...model.getSrcCtrlPoint() };
      this.setSrcControlPoint(srcPoint);
    }

    if (model.getDestCtrlPoint()) {
      const destPoint = { ...model.getDestCtrlPoint() };
      this.setDestControlPoint(destPoint);
    }

    // Reposition all nodes ...
    this.updatePositions();
    this._controlPointsController = new RelationshipControlPoints(this);

    // Initialize handler ..

    this._onFocusHandler = (event) => {
      this.setOnFocus(true);
      event.stopPropagation();
      event.preventDefault();
    };
  }

  setStroke(color: string, style: string, opacity: number): void {
    super.setStroke(color, style, opacity);
    this._startArrow.setStrokeColor(color);
  }

  getModel(): RelationshipModel {
    return this._model;
  }

  private updatePositions() {
    const line2d = this._line;
    const sourceTopic = this._sourceTopic;
    const sPos = sourceTopic.getPosition();

    const targetTopic = this._targetTopic;
    let tPos = targetTopic.getPosition();
    if (targetTopic.getType() === 'CentralTopic') {
      tPos = Shape.workoutIncomingConnectionPoint(targetTopic, sPos);
    }

    this._line.setStroke(2);
    let ctrlPoints: [Point, Point];

    // Position line ...
    if (!line2d.isDestControlPointCustom() && !line2d.isSrcControlPointCustom()) {
      ctrlPoints = Shape.calculateDefaultControlPoints(sPos, tPos) as [PositionType, PositionType];
    } else {
      ctrlPoints = line2d.getControlPoints();
    }

    const spointX = ctrlPoints[0].x + sPos.x;
    const spointY = ctrlPoints[0].y + sPos.y;

    const tpointX = ctrlPoints[1].x + tPos.x;
    const tpointY = ctrlPoints[1].y + tPos.y;

    const nsPos = Shape.calculateRelationShipPointCoordinates(
      sourceTopic,
      new Point(spointX, spointY),
    );
    const ntPos = Shape.calculateRelationShipPointCoordinates(
      targetTopic,
      new Point(tpointX, tpointY),
    );

    line2d.setFrom(nsPos.x, nsPos.y);
    line2d.setTo(ntPos.x, ntPos.y);

    // Positionate Arrows
    this.positionArrows();

    // Add connector ...
    this._positionLine(targetTopic);

    // Poisition refresh shape ...
    this.positionRefreshShape();
  }

  redraw(): void {
    this.updatePositions();

    this._line.moveToFront();
    this._startArrow.moveToBack();
    if (this._endArrow) {
      this._endArrow.moveToBack();
    }

    if (this._showEndArrow) {
      this._endArrow.setVisibility(this.isVisible());
    }
    this._startArrow.setVisibility(this.isVisible() && this._showStartArrow);

    this._focusShape.moveToBack();
    this._controlPointsController.redraw();
  }

  private positionArrows(): void {
    const tpos = this._line.getTo();
    const spos = this._line.getFrom();

    this._startArrow.setFrom(spos.x, spos.y);
    if (this._endArrow) {
      this._endArrow.setFrom(tpos.x, tpos.y);
    }

    if (this._line.getType() === 'CurvedLine') {
      const controlPoints = this._line.getControlPoints();
      this._startArrow.setControlPoint(controlPoints[0]);
      if (this._endArrow) {
        this._endArrow.setControlPoint(controlPoints[1]);
      }
    } else {
      this._startArrow.setControlPoint(this._line.getTo());
      if (this._endArrow) {
        this._endArrow.setControlPoint(this._line.getFrom());
      }
    }
  }

  addToWorkspace(workspace: Workspace): void {
    this.updatePositions();

    workspace.append(this._focusShape);
    workspace.append(this._controlPointsController);

    if (workspace.isReadOnly()) {
      this._line.setCursor('default');
    } else {
      this._line.addEvent('click', this._onFocusHandler);
      this._focusShape.addEvent('click', this._onFocusHandler);
    }
    this._isInWorkspace = true;

    workspace.append(this._startArrow);
    if (this._endArrow) workspace.append(this._endArrow);

    super.addToWorkspace(workspace);
    this.positionArrows();
    this.redraw();
  }

  removeFromWorkspace(workspace: Workspace): void {
    workspace.removeChild(this._focusShape);
    workspace.removeChild(this._controlPointsController);

    this._line.removeEvent('click', this._onFocusHandler);
    this._isInWorkspace = false;
    workspace.removeChild(this._startArrow);
    if (this._endArrow) {
      workspace.removeChild(this._endArrow);
    }

    super.removeFromWorkspace(workspace);
  }

  getType() {
    return 'Relationship';
  }

  setOnFocus(focus: boolean): void {
    if (focus) {
      this.positionRefreshShape();
    }
    // Change focus shape
    if (this.isOnFocus() !== focus) {
      // Focus is always present to support on over
      this._focusShape.setOpacity(focus ? 1 : 0);
      this._focusShape.setStroke(focus ? 2 : 8, 'solid', '#3f96ff');

      this._controlPointsController.setVisibility(focus);
      this._onFocus = focus;
      this.fireEvent(focus ? 'ontfocus' : 'ontblur', this);
    }
  }

  private positionRefreshShape(): void {
    const sPos = this._line.getFrom();
    const tPos = this._line.getTo();

    const ctrlPoints = this._line.getControlPoints();
    this._focusShape.setFrom(sPos.x, sPos.y);
    this._focusShape.setTo(tPos.x, tPos.y);

    this._focusShape.setSrcControlPoint(ctrlPoints[0]);
    this._focusShape.setDestControlPoint(ctrlPoints[1]);

    this._focusShape.updateLine();
  }

  addEvent(eventType: string, listener: () => void) {
    let type = eventType;
    // Translate to web 2d events ...
    if (type === 'onfocus') {
      type = 'mousedown';
    }

    const line = this._line;
    line.addEvent(type, listener);
  }

  isOnFocus(): boolean {
    return this._onFocus;
  }

  isInWorkspace(): boolean {
    return this._isInWorkspace;
  }

  setVisibility(value: boolean, fade = 0) {
    super.setVisibility(value, fade);

    // If visibility change, remove the on focus.
    this.setOnFocus(false);

    // Hide on gocus shade ...

    if (this._showEndArrow) {
      this._endArrow.setVisibility(this._showEndArrow);
    }
    this._startArrow.setVisibility(this._showStartArrow && value, fade);
    this._focusShape.setVisibility(value);
  }

  setOpacity(opacity: number): void {
    super.setOpacity(opacity);
    if (this._showEndArrow) {
      this._endArrow.setOpacity(opacity);
    }
    if (this._showStartArrow) {
      this._startArrow.setOpacity(opacity);
    }
  }

  setShowEndArrow(visible: boolean) {
    this._showEndArrow = visible;
    if (this._isInWorkspace) {
      this.redraw();
    }
  }

  setShowStartArrow(visible: boolean): void {
    this._showStartArrow = visible;
    if (this._isInWorkspace) this.redraw();
  }

  setFrom(x: number, y: number): void {
    $assert($defined(x), 'x must be defined');
    $assert($defined(y), 'y must be defined');

    this._line.setFrom(x, y);
    this._startArrow.setFrom(x, y);
  }

  setTo(x: number, y: number) {
    $assert($defined(x), 'x must be defined');
    $assert($defined(y), 'y must be defined');

    this._line.setTo(x, y);
    if (this._endArrow) this._endArrow.setFrom(x, y);
  }

  setSrcControlPoint(control: PositionType): void {
    this._line.setSrcControlPoint(control);
    this._focusShape.setSrcControlPoint(control);
    this._startArrow.setControlPoint(control);
  }

  setDestControlPoint(control: PositionType) {
    this._line.setDestControlPoint(control);
    this._focusShape.setSrcControlPoint(control);
    if (this._showEndArrow) {
      this._endArrow.setControlPoint(control);
    }
  }

  getControlPoints(): PositionType {
    return this._line.getControlPoints();
  }

  isSrcControlPointCustom(): boolean {
    return this._line.isSrcControlPointCustom();
  }

  isDestControlPointCustom(): boolean {
    return this._line.isDestControlPointCustom();
  }

  setIsSrcControlPointCustom(isCustom: boolean) {
    this._line.setIsSrcControlPointCustom(isCustom);
  }

  setIsDestControlPointCustom(isCustom: boolean) {
    this._line.setIsDestControlPointCustom(isCustom);
  }

  getId(): number {
    return this._model.getId();
  }

  fireEvent(type: string, event): void {
    const elem = this._line;
    elem.trigger(type, event);
  }

  static getStrokeColor() {
    return '#9b74e6';
  }
}

export default Relationship;
