/*
 *    Copyright [2015] [wisemapping]
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
import * as web2d from '@wisemapping/web2d';

import INodeModel, { TopicShape } from './model/INodeModel';
import TopicConfig from './TopicConfig';

class ConnectionLine {
  constructor(sourceNode, targetNode, lineType) {
    $assert(targetNode, 'parentNode node can not be null');
    $assert(sourceNode, 'childNode node can not be null');
    $assert(sourceNode !== targetNode, 'Circular connection');

    this._targetTopic = targetNode;
    this._sourceTopic = sourceNode;

    let line;
    const ctrlPoints = this._getCtrlPoints(sourceNode, targetNode);
    if (targetNode.getType() === INodeModel.CENTRAL_TOPIC_TYPE) {
      line = this._createLine(lineType, ConnectionLine.CURVED);
      line.setSrcControlPoint(ctrlPoints[0]);
      line.setDestControlPoint(ctrlPoints[1]);
    } else {
      line = this._createLine(lineType, ConnectionLine.SIMPLE_CURVED);
      line.setSrcControlPoint(ctrlPoints[0]);
      line.setDestControlPoint(ctrlPoints[1]);
    }
    // Set line styles ...
    const strokeColor = ConnectionLine.getStrokeColor();
    line.setStroke(1, 'solid', strokeColor, 1);
    line.setFill(strokeColor, 1);

    this._line2d = line;
  }

  _getCtrlPoints(sourceNode, targetNode) {
    const srcPos = sourceNode.workoutOutgoingConnectionPoint(targetNode.getPosition());
    const destPos = targetNode.workoutIncomingConnectionPoint(sourceNode.getPosition());
    const deltaX = (srcPos.x - destPos.x) / 3;
    return [new web2d.Point(deltaX, 0), new web2d.Point(-deltaX, 0)];
  }

  _createLine(lineType, defaultStyle) {
    if (!$defined(lineType)) {
      lineType = defaultStyle;
    }
    lineType = parseInt(lineType, 10);
    this._lineType = lineType;
    let line = null;
    switch (lineType) {
      case ConnectionLine.POLYLINE:
        line = new web2d.PolyLine();
        break;
      case ConnectionLine.CURVED:
        line = new web2d.CurvedLine();
        break;
      case ConnectionLine.SIMPLE_CURVED:
        line = new web2d.CurvedLine();
        line.setStyle(web2d.CurvedLine.SIMPLE_LINE);
        break;
      default:
        line = new web2d.Line();
        break;
    }
    return line;
  }

  setVisibility(value) {
    this._line2d.setVisibility(value);
  }

  isVisible() {
    return this._line2d.isVisible();
  }

  setOpacity(opacity) {
    this._line2d.setOpacity(opacity);
  }

  redraw() {
    const line2d = this._line2d;
    const sourceTopic = this._sourceTopic;
    const sourcePosition = sourceTopic.getPosition();

    const targetTopic = this._targetTopic;
    const targetPosition = targetTopic.getPosition();

    let sPos;
    let tPos;
    sPos = sourceTopic.workoutOutgoingConnectionPoint(targetPosition);
    tPos = targetTopic.workoutIncomingConnectionPoint(sourcePosition);

    line2d.setFrom(tPos.x, tPos.y);
    line2d.setTo(sPos.x, sPos.y);

    if (line2d.getType() == 'CurvedLine') {
      const ctrlPoints = this._getCtrlPoints(this._sourceTopic, this._targetTopic);
      line2d.setSrcControlPoint(ctrlPoints[0]);
      line2d.setDestControlPoint(ctrlPoints[1]);
    }

    // Add connector ...
    this._positionateConnector(targetTopic);
  }

  _positionateConnector(targetTopic) {
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
    if ($defined(connector)) {
      if (Math.sign(targetPosition.x) > 0) {
        x = targetTopicSize.width;
        connector.setPosition(x, y);
      } else {
        x = -TopicConfig.CONNECTOR_WIDTH;
      }
      connector.setPosition(x, y);
    }
  }

  setStroke(color, style, opacity) {
    this._line2d.setStroke(null, null, color, opacity);
  }

  addToWorkspace(workspace) {
    workspace.append(this._line2d);
    this._line2d.moveToBack();
  }

  removeFromWorkspace(workspace) {
    workspace.removeChild(this._line2d);
  }

  getTargetTopic() {
    return this._targetTopic;
  }

  getSourceTopic() {
    return this._sourceTopic;
  }

  getLineType() {
    return this._lineType;
  }

  getLine() {
    return this._line2d;
  }

  getModel() {
    return this._model;
  }

  setModel(model) {
    this._model = model;
  }

  getType() {
    return 'ConnectionLine';
  }

  getId() {
    return this._model.getId();
  }

  moveToBack() {
    this._line2d.moveToBack();
  }

  moveToFront() {
    this._line2d.moveToFront();
  }
}

ConnectionLine.getStrokeColor = () => '#495879';

ConnectionLine.SIMPLE = 0;
ConnectionLine.POLYLINE = 1;
ConnectionLine.CURVED = 2;
ConnectionLine.SIMPLE_CURVED = 3;

export default ConnectionLine;
