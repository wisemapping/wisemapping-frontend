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
import * as web2d from '@wisemapping/web2d';
import { $assert } from '@wisemapping/core-js';
import Relationship from './Relationship';
import INodeModel from './model/INodeModel';
import Shape from './util/Shape';

class RelationshipPivot {
  constructor(workspace, designer) {
    $assert(workspace, 'workspace can not be null');
    $assert(designer, 'designer can not be null');
    this._workspace = workspace;
    this._designer = designer;

    // FIXME: the aim of the migration is remove .bind mootools method, please remove these!
    this._mouseMoveEvent = this._mouseMove.bind(this);
    this._onClickEvent = this._cleanOnMouseClick.bind(this);
    this._onTopicClick = this._connectOnFocus.bind(this);
  }

  start(sourceTopic, targetPos) {
    $assert(sourceTopic, 'sourceTopic can not be null');
    $assert(targetPos, 'targetPos can not be null');

    this.dispose();
    this._sourceTopic = sourceTopic;
    if (sourceTopic != null) {
      this._workspace.enableWorkspaceEvents(false);

      const sourcePos = sourceTopic.getPosition();
      const strokeColor = Relationship.getStrokeColor();

      this._pivot = new web2d.CurvedLine();
      this._pivot.setStyle(web2d.CurvedLine.SIMPLE_LINE);

      const fromPos = this._calculateFromPosition(sourcePos);
      this._pivot.setFrom(fromPos.x, fromPos.y);

      this._pivot.setTo(targetPos.x, targetPos.y);
      this._pivot.setStroke(2, 'solid', strokeColor);
      this._pivot.setDashed(4, 2);

      this._startArrow = new web2d.Arrow();
      this._startArrow.setStrokeColor(strokeColor);
      this._startArrow.setStrokeWidth(2);
      this._startArrow.setFrom(sourcePos.x, sourcePos.y);

      this._workspace.append(this._pivot);
      this._workspace.append(this._startArrow);

      this._workspace.addEvent('mousemove', this._mouseMoveEvent);
      this._workspace.addEvent('click', this._onClickEvent);

      // Register focus events on all topics ...
      const model = this._designer.getModel();
      const topics = model.getTopics();
      _.each(topics, (topic) => {
        topic.addEvent('ontfocus', this._onTopicClick);
      });
    }
  }

  dispose() {
    const workspace = this._workspace;

    if (this._isActive()) {
      workspace.removeEvent('mousemove', this._mouseMoveEvent);
      workspace.removeEvent('click', this._onClickEvent);

      const model = this._designer.getModel();
      const topics = model.getTopics();
      const me = this;
      _.each(topics, (topic) => {
        topic.removeEvent('ontfocus', me._onTopicClick);
      });

      workspace.removeChild(this._pivot);
      workspace.removeChild(this._startArrow);
      workspace.enableWorkspaceEvents(true);

      this._sourceTopic = null;
      this._pivot = null;
      this._startArrow = null;
    }
  }

  _mouseMove(event) {
    const screen = this._workspace.getScreenManager();
    const pos = screen.getWorkspaceMousePosition(event);

    // Leave the arrow a couple of pixels away from the cursor.
    const sourcePosition = this._sourceTopic.getPosition();
    const gapDistance = Math.sign(pos.x - sourcePosition.x) * 5;

    const sPos = this._calculateFromPosition(pos);
    this._pivot.setFrom(sPos.x, sPos.y);

    // Update target position ...
    this._pivot.setTo(pos.x - gapDistance, pos.y);

    const controlPoints = this._pivot.getControlPoints();
    this._startArrow.setFrom(pos.x - gapDistance, pos.y);
    this._startArrow.setControlPoint(controlPoints[1]);

    event.stopPropagation();
    return false;
  }

  _cleanOnMouseClick(event) {
    // The user clicks on a desktop on in other element that is not a node.
    this.dispose();
    event.stopPropagation();
  }

  _calculateFromPosition(toPosition) {
    // Calculate origin position ...
    let sourcePosition = this._sourceTopic.getPosition();
    if (this._sourceTopic.getType() === INodeModel.CENTRAL_TOPIC_TYPE) {
      sourcePosition = Shape.workoutIncomingConnectionPoint(this._sourceTopic, toPosition);
    }
    const controlPoint = Shape.calculateDefaultControlPoints(sourcePosition, toPosition);

    const spoint = new web2d.Point();
    spoint.x = parseInt(controlPoint[0].x, 10) + parseInt(sourcePosition.x, 10);
    spoint.y = parseInt(controlPoint[0].y, 10) + parseInt(sourcePosition.y, 10);
    return Shape.calculateRelationShipPointCoordinates(this._sourceTopic, spoint);
  }

  _connectOnFocus(event, targetTopic) {
    const sourceTopic = this._sourceTopic;
    const mindmap = this._designer.getMindmap();

    // Avoid circular connections ...
    if (targetTopic.getId() !== sourceTopic.getId()) {
      const relModel = mindmap.createRelationship(targetTopic.getId(), sourceTopic.getId());
      this._designer._actionDispatcher.addRelationship(relModel);
    }
    this.dispose();
  }

  _isActive() {
    return this._pivot != null;
  }
}

export default RelationshipPivot;
