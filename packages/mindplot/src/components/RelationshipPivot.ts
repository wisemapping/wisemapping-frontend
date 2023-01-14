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
import { CurvedLine, Arrow, Point } from '@wisemapping/web2d';
import { $assert } from '@wisemapping/core-js';
import Relationship from './Relationship';
import Shape from './util/Shape';
import Workspace from './Workspace';
import { Designer } from '..';
import Topic from './Topic';

class RelationshipPivot {
  private _workspace: Workspace;

  private _designer: Designer;

  private _mouseMoveEvent;

  private _onClickEvent: (event: MouseEvent) => void;

  private _onTopicClick: (event: MouseEvent, targetTopic: Topic) => void;

  private _sourceTopic: Topic | null;

  private _pivot: CurvedLine;

  private _startArrow: Arrow;

  constructor(workspace: Workspace, designer: Designer) {
    $assert(workspace, 'workspace can not be null');
    $assert(designer, 'designer can not be null');
    this._workspace = workspace;
    this._designer = designer;

    this._mouseMoveEvent = this.mouseMoveHandler.bind(this);
    this._onClickEvent = this.cleanOnMouseClick.bind(this);
    this._onTopicClick = this._connectOnFocus.bind(this);
    this._sourceTopic = null;
  }

  start(sourceTopic: Topic, targetPos: Point) {
    $assert(sourceTopic, 'sourceTopic can not be null');
    $assert(targetPos, 'targetPos can not be null');

    this.dispose();
    this._sourceTopic = sourceTopic;
    this._workspace.enableWorkspaceEvents(false);

    const sourcePos = sourceTopic.getPosition();
    const strokeColor = Relationship.getStrokeColor();

    this._pivot = new CurvedLine();
    const fromPos = this._calculateFromPosition(sourcePos);
    this._pivot.setFrom(fromPos.x, fromPos.y);

    this._pivot.setTo(targetPos.x, targetPos.y);
    this._pivot.setStroke(2, 'solid', strokeColor);
    this._pivot.setDashed(4, 2);

    this._startArrow = new Arrow();
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
    topics.forEach((topic) => {
      topic.addEvent('ontfocus', this._onTopicClick);
    });
  }

  dispose(): void {
    const workspace = this._workspace;

    if (this._isActive()) {
      workspace.removeEvent('mousemove', this._mouseMoveEvent);
      workspace.removeEvent('click', this._onClickEvent);

      const model = this._designer.getModel();
      const topics = model.getTopics();

      topics.forEach((topic) => {
        topic.removeEvent('ontfocus', this._onTopicClick);
      });

      workspace.removeChild(this._pivot);
      workspace.removeChild(this._startArrow);
      workspace.enableWorkspaceEvents(true);

      this._sourceTopic = null;
      this._pivot = null;
      this._startArrow = null;
    }
  }

  private mouseMoveHandler(event: MouseEvent): boolean {
    const screen = this._workspace.getScreenManager();
    const pos = screen.getWorkspaceMousePosition(event);

    // Leave the arrow a couple of pixels away from the cursor.
    const sourcePosition = this._sourceTopic!.getPosition();
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

  private cleanOnMouseClick(event: MouseEvent): void {
    // The user clicks on a desktop on in other element that is not a node.
    this.dispose();
    event.stopPropagation();
  }

  private _calculateFromPosition(toPosition: Point): Point {
    // Calculate origin position ...
    const sourceTopic = this._sourceTopic!;
    let sourcePosition = this._sourceTopic!.getPosition();
    if (sourceTopic!.getType() === 'CentralTopic') {
      sourcePosition = Shape.workoutIncomingConnectionPoint(sourceTopic, toPosition);
    }
    const controlPoint = Shape.calculateDefaultControlPoints(sourcePosition, toPosition);
    const point = {
      x: controlPoint[0].x + sourcePosition.x,
      y: controlPoint[0].y + sourcePosition.y,
    };
    return Shape.calculateRelationShipPointCoordinates(sourceTopic, point);
  }

  private _connectOnFocus(event: MouseEvent, targetTopic: Topic): void {
    const sourceTopic = this._sourceTopic;
    const mindmap = this._designer.getMindmap();

    // Avoid circular connections ...
    if (targetTopic.getId() !== sourceTopic!.getId()) {
      const relModel = mindmap.createRelationship(targetTopic.getId(), sourceTopic!.getId());
      this._designer.getActionDispatcher().addRelationship(relModel);
    }
    this.dispose();
  }

  private _isActive() {
    return this._pivot != null;
  }
}

export default RelationshipPivot;
