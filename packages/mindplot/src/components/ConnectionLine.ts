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

import { $assert } from '@wisemapping/core-js';
import { Point, CurvedLine, PolyLine, Line } from '@wisemapping/web2d';
import { TopicShape } from './model/INodeModel';
import RelationshipModel from './model/RelationshipModel';
import Topic from './Topic';
import TopicConfig from './TopicConfig';
import Workspace from './Workspace';

// eslint-disable-next-line no-shadow
export enum LineType {
  SIMPLE,
  POLYLINE,
  CURVED,
  SIMPLE_CURVED,
}

class ConnectionLine {
  protected _targetTopic: Topic;

  protected _sourceTopic: Topic;

  protected _lineType: LineType;

  protected _line2d: Line;

  protected _model: RelationshipModel;

  constructor(sourceNode: Topic, targetNode: Topic) {
    $assert(targetNode, 'parentNode node can not be null');
    $assert(sourceNode, 'childNode node can not be null');
    $assert(sourceNode !== targetNode, 'Circular connection');

    this._targetTopic = targetNode;
    this._sourceTopic = sourceNode;

    let line: Line;
    const ctrlPoints = this._getCtrlPoints(sourceNode, targetNode);
    if (targetNode.getType() === 'CentralTopic') {
      line = this._createLine(LineType.CURVED);
      line.setSrcControlPoint(ctrlPoints[0]);
      line.setDestControlPoint(ctrlPoints[1]);
    } else {
      line = this._createLine(LineType.SIMPLE_CURVED);
      line.setSrcControlPoint(ctrlPoints[0]);
      line.setDestControlPoint(ctrlPoints[1]);
    }
    // Set line styles ...
    const strokeColor = ConnectionLine.getStrokeColor();
    line.setStroke(1, 'solid', strokeColor, 1);
    line.setFill(strokeColor, 1);

    this._line2d = line;
  }

  private _getCtrlPoints(sourceNode: Topic, targetNode: Topic) {
    const srcPos = sourceNode.workoutOutgoingConnectionPoint(targetNode.getPosition());
    const destPos = targetNode.workoutIncomingConnectionPoint(sourceNode.getPosition());
    const deltaX = (srcPos.x - destPos.x) / 3;
    return [new Point(deltaX, 0), new Point(-deltaX, 0)];
  }

  protected _createLine(lineType: LineType): Line {
    this._lineType = lineType;
    let line: ConnectionLine;
    switch (lineType) {
      case LineType.POLYLINE:
        line = new PolyLine();
        break;
      case LineType.CURVED:
        line = new CurvedLine();
        break;
      case LineType.SIMPLE_CURVED:
        line = new CurvedLine();
        (line as CurvedLine).setStyle(CurvedLine.SIMPLE_LINE);
        break;
      case LineType.SIMPLE:
        line = new Line();
        break;
      default:
        throw new Error(`Unexpected line type. ${lineType}`);
    }
    return line;
  }

  setVisibility(value: boolean, fade = 0): void {
    this._line2d.setVisibility(value, fade);
  }

  isVisible(): boolean {
    return this._line2d.isVisible();
  }

  setOpacity(opacity: number): void {
    this._line2d.setOpacity(opacity);
  }

  redraw(): void {
    const line2d = this._line2d;
    const sourceTopic = this._sourceTopic;
    const sourcePosition = sourceTopic.getPosition();

    const targetTopic = this._targetTopic;
    const targetPosition = targetTopic.getPosition();

    const sPos = sourceTopic.workoutOutgoingConnectionPoint(targetPosition);
    const tPos = targetTopic.workoutIncomingConnectionPoint(sourcePosition);

    line2d.setFrom(tPos.x, tPos.y);
    line2d.setTo(sPos.x, sPos.y);

    if (line2d.getType() === 'CurvedLine') {
      const ctrlPoints = this._getCtrlPoints(this._sourceTopic, this._targetTopic);
      line2d.setSrcControlPoint(ctrlPoints[0]);
      line2d.setDestControlPoint(ctrlPoints[1]);
    }

    // Add connector ...
    this._positionateConnector(targetTopic);
  }

  protected _positionateConnector(targetTopic: Topic): void {
    const targetPosition = targetTopic.getPosition();
    const offset = TopicConfig.CONNECTOR_WIDTH / 2;
    const targetTopicSize = targetTopic.getSize();
    let y;
    let x;
    if (targetTopic.getShapeType() === TopicShape.LINE) {
      y = targetTopicSize.height;
    } else {
      y = targetTopicSize.height / 2;
    }
    y -= offset;

    const connector = targetTopic.getShrinkConnector();
    if (connector) {
      if (Math.sign(targetPosition.x) > 0) {
        x = targetTopicSize.width;
        connector.setPosition(x, y);
      } else {
        x = -TopicConfig.CONNECTOR_WIDTH;
      }
      connector.setPosition(x, y);
    }
  }

  setStroke(color: string, style: string, opacity: number) {
    this._line2d.setStroke(null, null, color, opacity);
  }

  addToWorkspace(workspace: Workspace) {
    workspace.append(this._line2d);
    this._line2d.moveToBack();
  }

  removeFromWorkspace(workspace: Workspace) {
    workspace.removeChild(this._line2d);
  }

  getTargetTopic(): Topic {
    return this._targetTopic;
  }

  getSourceTopic(): Topic {
    return this._sourceTopic;
  }

  getLineType(): number {
    return this._lineType;
  }

  getLine(): Line {
    return this._line2d;
  }

  getModel(): RelationshipModel {
    return this._model;
  }

  setModel(model: RelationshipModel): void {
    this._model = model;
  }

  getType(): string {
    return 'ConnectionLine';
  }

  getId(): number {
    return this._model.getId();
  }

  moveToBack(): void {
    this._line2d.moveToBack();
  }

  moveToFront() {
    this._line2d.moveToFront();
  }

  static getStrokeColor = () => '#495879';
}

export default ConnectionLine;
