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
import { CurvedLine, PolyLine } from '@wisemapping/web2d';
import type { Line } from '@wisemapping/web2d';
import PositionType from './PositionType';
import Topic from './Topic';
import TopicConfig from './TopicConfig';
import Canvas from './Canvas';
import ArcLine from './model/ArcLine';

export enum LineType {
  THIN_CURVED,
  POLYLINE_MIDDLE,
  POLYLINE_CURVED,
  THICK_CURVED,
  ARC,
}

class ConnectionLine {
  protected _targetTopic: Topic;

  protected _sourceTopic: Topic;

  protected _line: Line;

  private _type: LineType;

  private _color: string;

  constructor(sourceNode: Topic, targetNode: Topic, type: LineType = LineType.THIN_CURVED) {
    $assert(sourceNode !== targetNode, 'Circular connection');

    this._targetTopic = targetNode;
    this._sourceTopic = sourceNode;
    this._type = type;
    this._line = this.createLine(type);
    this._color = this.updateColor();
  }

  private _getCtrlPoints(sourceNode: Topic, targetNode: Topic): [PositionType, PositionType] {
    const srcPos = sourceNode.workoutOutgoingConnectionPoint(targetNode.getPosition());
    const destPos = targetNode.workoutIncomingConnectionPoint(sourceNode.getPosition());
    const deltaX = (srcPos.x - destPos.x) / 3;
    return [
      { x: deltaX, y: 0 },
      { x: -deltaX, y: 0 },
    ];
  }

  protected createLine(lineType: LineType): Line {
    let line: Line;
    switch (lineType) {
      case LineType.POLYLINE_MIDDLE:
        line = new PolyLine();
        (line as PolyLine).setStyle('MiddleStraight');
        break;
      case LineType.POLYLINE_CURVED:
        line = new PolyLine();
        (line as PolyLine).setStyle('Curved');
        break;
      case LineType.THIN_CURVED:
        line = new CurvedLine();
        (line as CurvedLine).setWidth(1);
        break;
      case LineType.THICK_CURVED:
        line = new CurvedLine();
        (line as CurvedLine).setWidth(this._targetTopic.isCentralTopic() ? 15 : 3);
        break;
      case LineType.ARC:
        line = new ArcLine(this._sourceTopic, this._targetTopic);
        break;
      default: {
        const exhaustiveCheck: never = lineType;
        throw new Error(exhaustiveCheck);
      }
    }
    return line;
  }

  private updateColor(): string {
    // In case that the main topic has changed the color, overwrite the main topic definiton.
    const color = this._sourceTopic.getConnectionColor();

    this._color = color;
    switch (this._type) {
      case LineType.POLYLINE_MIDDLE:
        this._line.setStroke(2, 'solid', color, 1);
        break;
      case LineType.POLYLINE_CURVED:
        this._line.setStroke(2, 'solid', color, 1);
        break;
      case LineType.THIN_CURVED:
        this._line.setStroke(2, 'solid', color, 1);
        this._line.setFill(color, 1);
        break;
      case LineType.THICK_CURVED:
        this._line.setStroke(2, 'solid', color, 1);
        this._line.setFill(color, 1);
        break;
      case LineType.ARC:
        this._line.setStroke(2, 'solid', color, 1);
        break;
      default: {
        const exhaustiveCheck: never = this._type;
        throw new Error(exhaustiveCheck);
      }
    }
    return color;
  }

  setVisibility(value: boolean, fade = 0): void {
    this._line.setVisibility(value, fade);
  }

  isVisible(): boolean {
    return this._line.isVisible();
  }

  setOpacity(opacity: number): void {
    this._line.setOpacity(opacity);
  }

  redraw(): void {
    const line2d = this._line;
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
      (line2d as CurvedLine).setSrcControlPoint(ctrlPoints[0]);
      (line2d as CurvedLine).setDestControlPoint(ctrlPoints[1]);
    }

    // Add connector ...
    this._positionLine(targetTopic);

    // Update color ...
    this.updateColor();
  }

  protected _positionLine(targetTopic: Topic): void {
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
    this._line.setStroke(1, style, color, opacity);
    this._color = color;
  }

  getStrokeColor(): string {
    return this._color;
  }

  addToWorkspace(workspace: Canvas) {
    workspace.append(this._line.getElementClass());
    this._line.moveToBack();
  }

  removeFromWorkspace(workspace: Canvas) {
    workspace.removeChild(this._line.getElementClass());
  }

  getTargetTopic(): Topic {
    return this._targetTopic;
  }

  getSourceTopic(): Topic {
    return this._sourceTopic;
  }

  getLineType(): number {
    return this._type;
  }

  getLine(): Line {
    return this._line;
  }

  getType(): string {
    return 'ConnectionLine';
  }

  moveToBack(): void {
    this._line.moveToBack();
  }

  moveToFront() {
    this._line.moveToFront();
  }
}

export default ConnectionLine;
