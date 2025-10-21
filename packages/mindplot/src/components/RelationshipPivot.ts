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
import { CurvedLine, Arrow } from '@wisemapping/web2d';
import Relationship from './Relationship';
import Shape from './util/Shape';
import Canvas from './Canvas';
import { Designer } from '..';
import Topic from './Topic';
import PositionType from './PositionType';

class RelationshipPivot {
  private _canvas: Canvas;

  private _designer: Designer;

  private _mouseMoveEvent: (event: Event, detail?: unknown) => void;

  private _onClickEvent: (event: Event, detail?: unknown) => void;

  private _onTopicClick: (event: Event, targetTopic: Topic) => void;

  private _sourceTopic: Topic | null;

  private _pivot: CurvedLine | null;

  private _endArrow: Arrow | null;

  private _lastUpdateTime: number = 0;

  constructor(canvas: Canvas, designer: Designer) {
    this._canvas = canvas;
    this._designer = designer;

    this._mouseMoveEvent = this.mouseMoveHandler.bind(this);
    this._onClickEvent = this.cleanOnMouseClick.bind(this);
    this._onTopicClick = this._connectOnFocus.bind(this);
    this._sourceTopic = null;
    this._pivot = null;
    this._endArrow = null;
  }

  start(sourceTopic: Topic, targetPos: PositionType): void {
    this.dispose();
    this._sourceTopic = sourceTopic;
    this._canvas.enableWorkspaceEvents(false);
    this._lastUpdateTime = 0; // Reset throttling timer

    const strokeColor = Relationship.getStrokeColor();

    this._pivot = new CurvedLine();

    // Calculate proper connection points and control points like in Relationship
    const sPos = this._calculateFromPosition(targetPos);
    const tPos = targetPos;

    // Use the same control point calculation as Relationship
    const ctrlPoints = Shape.calculateDefaultControlPoints(sPos, tPos) as [
      PositionType,
      PositionType,
    ];

    this._pivot.setFrom(sPos.x, sPos.y);
    this._pivot.setTo(tPos.x, tPos.y);
    this._pivot.setSrcControlPoint(ctrlPoints[0]);
    this._pivot.setDestControlPoint(ctrlPoints[1]);
    this._pivot.setStroke(2, 'dash', strokeColor);

    // Only create end arrow for pivot (showing direction toward target)
    this._endArrow = new Arrow();
    this._endArrow.setStrokeColor(strokeColor);
    this._endArrow.setStrokeWidth(2);
    this._endArrow.setFrom(tPos.x, tPos.y);
    this._endArrow.setControlPoint(ctrlPoints[1]);

    this._canvas.append(this._pivot);
    this._canvas.append(this._endArrow);

    // Ensure pivot elements are rendered below topics to avoid interference
    this._pivot.moveToBack();
    this._endArrow.moveToBack();

    this._canvas.addEvent('mousemove', this._mouseMoveEvent);
    this._canvas.addEvent('click', this._onClickEvent);

    // Register focus events on all topics ...
    const model = this._designer.getModel();
    const topics = model.getTopics();
    topics.forEach((topic) => {
      topic.addEvent('ontfocus', this._onTopicClick);
    });
  }

  dispose(): void {
    const workspace = this._canvas;

    if (this._isActive()) {
      workspace.removeEvent('mousemove', this._mouseMoveEvent);
      workspace.removeEvent('click', this._onClickEvent);

      const model = this._designer.getModel();
      const topics = model.getTopics();

      topics.forEach((topic) => {
        topic.removeEvent('ontfocus', this._onTopicClick);
      });

      if (this._pivot) {
        workspace.removeChild(this._pivot);
      }
      if (this._endArrow) {
        workspace.removeChild(this._endArrow);
      }
      workspace.enableWorkspaceEvents(true);

      this._sourceTopic = null;
      this._pivot = null;
    }
  }

  private mouseMoveHandler(event: Event): boolean {
    const mouseEvent = event as MouseEvent;
    // Throttle updates to prevent excessive redraws
    const now = Date.now();
    if (now - this._lastUpdateTime < 16) {
      // ~60fps
      return false;
    }
    this._lastUpdateTime = now;

    const screen = this._canvas.getScreenManager();
    const pos = screen.getWorkspaceMousePosition(mouseEvent);

    // Calculate proper connection points and control points like in Relationship
    const sPos = this._calculateFromPosition(pos);
    const tPos = pos;

    // Use the same control point calculation as Relationship
    const ctrlPoints = Shape.calculateDefaultControlPoints(sPos, tPos) as [
      PositionType,
      PositionType,
    ];

    // Update pivot line with curved control points
    this._pivot!.setFrom(sPos.x, sPos.y);
    this._pivot!.setTo(tPos.x, tPos.y);
    this._pivot!.setSrcControlPoint(ctrlPoints[0]);
    this._pivot!.setDestControlPoint(ctrlPoints[1]);

    // Update end arrow to follow the curve
    this._endArrow!.setFrom(tPos.x, tPos.y);
    this._endArrow!.setControlPoint(ctrlPoints[1]);

    mouseEvent.stopPropagation();
    return false;
  }

  private cleanOnMouseClick(event: Event): void {
    // The user clicks on a desktop on in other element that is not a node.
    this.dispose();
    event.stopPropagation();
  }

  private _calculateFromPosition(toPosition: PositionType): PositionType {
    // Use the shared snap point calculation from Relationship
    const sourceTopic = this._sourceTopic!;
    return Relationship.calculateSnapPoint(sourceTopic, toPosition);
  }

  private _connectOnFocus(event: Event, targetTopic: Topic): void {
    const sourceTopic = this._sourceTopic;
    const mindmap = this._designer.getMindmap();

    // Avoid circular connections ...
    if (targetTopic.getId() !== sourceTopic!.getId()) {
      // Validate that both topics exist in the designer model before creating relationship
      const dmodel = this._designer.getModel();
      const sourceInModel = dmodel.findTopicById(sourceTopic!.getId());
      const targetInModel = dmodel.findTopicById(targetTopic.getId());

      if (!sourceInModel || !targetInModel) {
        console.error(
          '[RelationshipPivot] Cannot create relationship - topic not found in designer model.\n' +
            `  Source topic ID: ${sourceTopic!.getId()} (${
              sourceInModel ? 'found' : 'NOT FOUND'
            })\n` +
            `  Target topic ID: ${targetTopic.getId()} (${
              targetInModel ? 'found' : 'NOT FOUND'
            })\n` +
            `  Available topic IDs: [${dmodel
              .getTopics()
              .map((t) => t.getId())
              .join(', ')}]`,
        );
        this.dispose();
        return;
      }

      // Create relationship FROM sourceTopic TO targetTopic (arrow points to target)
      const relModel = mindmap.createRelationship(sourceTopic!.getId(), targetTopic.getId());
      this._designer.getActionDispatcher().addRelationship(relModel);
    }
    this.dispose();
  }

  private _isActive() {
    return this._pivot != null;
  }
}

export default RelationshipPivot;
