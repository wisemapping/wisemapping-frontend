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
import { $assert } from './util/assert';
import DesignerModel from './DesignerModel';
import DragTopic from './DragTopic';
import SizeType from './SizeType';
import Topic from './Topic';
import Canvas from './Canvas';
import PositionType from './PositionType';
import { sideOf } from './util/side';

class DragConnector {
  private _designerModel: DesignerModel;

  private _workspace: Canvas;

  private _draggedBranches = new WeakMap<DragTopic, Set<number>>();

  constructor(designerModel: DesignerModel, workspace: Canvas) {
    $assert(designerModel, 'designerModel can not be null');
    $assert(workspace, 'workspace can not be null');

    this._designerModel = designerModel;
    this._workspace = workspace;
  }

  checkConnection(dragTopic: DragTopic, forceDisconnected: boolean): void {
    // Is forced disconexion enabled ?
    let candidates: Topic[] = [];
    if (!forceDisconnected) {
      candidates = this._searchConnectionCandidates(dragTopic);
    }

    // Must be disconnected from their current connection ?.
    const currentConnection = dragTopic.getConnectedToTopic();
    if (currentConnection && (candidates.length === 0 || candidates[0] !== currentConnection)) {
      dragTopic.disconnect(this._workspace);
    }

    // Finally, connect nodes ...
    if (!dragTopic.isConnected() && candidates.length > 0) {
      dragTopic.connectTo(candidates[0]);
    }
  }

  private _searchConnectionCandidates(dragTopic: DragTopic): Topic[] {
    const draggedNode = dragTopic.getDraggedTopic();
    // Get orientation from topic - it should be updated when layout changes
    const orientation = draggedNode.getOrientation();

    const sPos = dragTopic.getPosition();

    // Filter based on layout orientation first: it is the cheap test, and it leaves few topics.
    let inReach: (topic: Topic) => boolean;
    if (orientation === 'vertical') {
      // Tree layout: filter by vertical position (Y axis)
      // Only consider topics that are above the dragged topic
      inReach = (topic: Topic) => {
        const tpos = topic.getPosition();
        const tborder = tpos.y - topic.getSize().height / 2;
        const distance = sPos.y - tborder;
        return distance > 0 && distance < DragConnector.MAX_VERTICAL_CONNECTION_TOLERANCE;
      };
    } else {
      // Mindmap layout: filter by horizontal position (X axis)
      // Filter all the nodes that are outside the horizontal boundary:
      //  * The node is to out of the x scope
      //  * The x distance greater the tolerated distance
      // Not Math.sign: at x === 0 it zeroed the distance and left no candidates.
      const side = sideOf(sPos.x);
      inReach = (topic: Topic) => {
        const tpos = topic.getPosition();
        // Center topic has different alignment than the rest of the nodes.
        // That's why i need to divide it by two...
        const txborder = tpos.x + (topic.getSize().width / 2) * side;
        const distance = (sPos.x - txborder) * side;
        return distance > 0 && distance < DragConnector.MAX_VERTICAL_CONNECTION_TOLERANCE;
      };
    }

    // Then discard, of the topics in reach:
    //  - the dragged topic and its branch, which it can not be connected to
    //  - the collapsed ones, and the ones inside a collapsed branch
    const branch = this._getDraggedBranch(dragTopic);
    const topics = this._designerModel
      .getTopics()
      .filter(
        (topic: Topic) =>
          inReach(topic) &&
          !branch.has(topic.getId()) &&
          !topic.areChildrenShrunken() &&
          !topic.isCollapsed(),
      );

    // Assign a priority based on the distance:
    // - Alignment with the targetNode
    // - Vertical/Horizontal distance (depending on orientation)
    // - Proximity
    // - It's already connected.
    // Weighed once per topic, not on each comparison. The sort is stable, so ties keep their order.
    const currentConnection = dragTopic.getConnectedToTopic();
    return topics
      .map((topic) => ({
        topic,
        weight: this._proximityWeight(
          this._isAligned(topic.getSize(), topic.getPosition(), sPos, orientation),
          topic,
          sPos,
          currentConnection!,
        ),
      }))
      .sort((a, b) => a.weight - b.weight)
      .map(({ topic }) => topic);
  }

  /**
   * Ids of the dragged topic and of every topic of its branch, as Topic.isChildTopic tells them.
   * A drag does not change the branch, so it is walked once per drag (per DragTopic), not for
   * every topic on every mousemove.
   */
  private _getDraggedBranch(dragTopic: DragTopic): Set<number> {
    let result = this._draggedBranches.get(dragTopic);
    if (!result) {
      const ids = new Set<number>();
      const pending: Topic[] = [dragTopic.getDraggedTopic()];
      while (pending.length > 0) {
        const topic = pending.pop()!;
        ids.add(topic.getId());
        pending.push(...topic.getChildren());
      }
      result = ids;
      this._draggedBranches.set(dragTopic, result);
    }
    return result;
  }

  private _proximityWeight(
    isAligned: boolean,
    target: Topic,
    sPos: PositionType,
    currentConnection: Topic,
  ): number {
    const tPos = target.getPosition();
    return (
      (isAligned ? 0 : 200) +
      Math.abs(tPos.x - sPos.x) +
      Math.abs(tPos.y - sPos.y) +
      (currentConnection === target ? 0 : 100)
    );
  }

  private _isAligned(
    targetSize: SizeType,
    targetPosition: PositionType,
    sourcePosition: PositionType,
    orientation: 'horizontal' | 'vertical',
  ): boolean {
    if (orientation === 'vertical') {
      // Tree layout: check horizontal alignment (X axis)
      return Math.abs(sourcePosition.x - targetPosition.x) < targetSize.width / 2;
    }
    // Mindmap layout: check vertical alignment (Y axis)
    return Math.abs(sourcePosition.y - targetPosition.y) < targetSize.height / 2;
  }

  static MAX_VERTICAL_CONNECTION_TOLERANCE = 80;
}

export default DragConnector;
