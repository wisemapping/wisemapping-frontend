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
import { CurvedLine, PolyLine, Line } from '@wisemapping/web2d';
import Topic from './Topic';
import TopicConfig from './TopicConfig';
import Workspace from './Workspace';

// eslint-disable-next-line no-shadow
export enum LineType {
  THIN_CURVED,
  POLYLINE_MIDDLE,
  POLYLINE_CURVED,
  THICK_CURVED,
}

class ConnectionLine {
  protected _targetTopic: Topic;

  protected _sourceTopic: Topic;

  protected _lineType: LineType;

  protected _line2d: Line;

  private _type: LineType;

  constructor(sourceNode: Topic, targetNode: Topic, type: LineType = LineType.THIN_CURVED) {
    $assert(targetNode, 'parentNode node can not be null');
    $assert(sourceNode, 'childNode node can not be null');
    $assert(sourceNode !== targetNode, 'Circular connection');

    this._targetTopic = targetNode;
    this._sourceTopic = sourceNode;
    this._type = type;

    const line = this._createLine(type);

    // Set line styles ...
    this._line2d = line;
  }

  private _getCtrlPoints(sourceNode: Topic, targetNode: Topic) {
    const srcPos = sourceNode.workoutOutgoingConnectionPoint(targetNode.getPosition());
    const destPos = targetNode.workoutIncomingConnectionPoint(sourceNode.getPosition());
    const deltaX = (srcPos.x - destPos.x) / 3;
    return [
      { x: deltaX, y: 0 },
      { x: -deltaX, y: 0 },
    ];
  }

  protected _createLine(lineType: LineType): ConnectionLine {
    this._lineType = lineType;
    let line: ConnectionLine;
    const strokeColor = ConnectionLine.getStrokeColor();
    switch (lineType) {
      case LineType.POLYLINE_MIDDLE:
        line = new PolyLine();
        (line as PolyLine).setStyle('MiddleStraight');
        (line as PolyLine).setStroke(1, 'solid', strokeColor, 1);
        break;
      case LineType.POLYLINE_CURVED:
        line = new PolyLine();
        (line as PolyLine).setStyle('Curved');
        (line as PolyLine).setStroke(1, 'solid', strokeColor, 1);
        break;
      case LineType.THIN_CURVED:
        line = new CurvedLine();
        (line as CurvedLine).setStroke(1, 'solid', strokeColor, 1);
        (line as CurvedLine).setFill(strokeColor, 1);
        break;
      case LineType.THICK_CURVED:
        line = new CurvedLine();
        (line as CurvedLine).setStroke(1, 'solid', strokeColor, 1);
        (line as CurvedLine).setFill(strokeColor, 1);
        (line as CurvedLine).setWidth(this._targetTopic.isCentralTopic() ? 15 : 3);
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

    if (this._type === LineType.THICK_CURVED || this._type === LineType.THIN_CURVED) {
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
    let y: number;
    let x: number;
    if (targetTopic.getShapeType() === 'line') {
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

  getType(): string {
    return 'ConnectionLine';
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
