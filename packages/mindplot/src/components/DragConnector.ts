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
import type DesignerModel from './DesignerModel';
import type DragTopic from './DragTopic';
import type SizeType from './SizeType';
import type Topic from './Topic';
import type Canvas from './Canvas';
import type PositionType from './PositionType';
import { sideOf } from './util/side';

/** A topic a drag may connect to, with its place in the topic list, and a border along an axis. */
type Candidate = { topic: Topic; index: number; border: number };

/**
 * The topics a drag may connect to, read once per drag: not of the dragged branch, not collapsed
 * nor in a collapsed branch. Each list is sorted by one border, the one the reach test measures
 * from: the right one (topics left of the mouse), the left one (right of it), the top one (tree).
 */
type DragCandidates = { right: Candidate[]; left: Candidate[]; top: Candidate[] };

/** Index of the first candidate whose border is at least `value` (the list is sorted by it). */
const lowerBound = (list: Candidate[], value: number): number => {
  let low = 0;
  let high = list.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    // middle < high <= list.length
    if (list[middle]!.border < value) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low;
};

class DragConnector {
  private _designerModel: DesignerModel;

  private _workspace: Canvas;

  private _draggedBranches = new WeakMap<DragTopic, Set<number>>();

  private _dragCandidates = new WeakMap<DragTopic, DragCandidates>();

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
    const [best] = candidates;
    if (currentConnection && best !== currentConnection) {
      dragTopic.disconnect(this._workspace);
    }

    // Finally, connect nodes ...
    if (!dragTopic.isConnected() && best) {
      dragTopic.connectTo(best);
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

    // Only the topics whose border is within reach of the mouse along the axis are looked at:
    // they are found in the list sorted by that border, read once per drag.
    const candidates = this._getDragCandidates(dragTopic);
    let list: Candidate[];
    let from: number;
    let to: number;
    if (orientation === 'vertical') {
      list = candidates.top;
      [from, to] = [sPos.y - DragConnector.MAX_VERTICAL_CONNECTION_TOLERANCE, sPos.y];
    } else if (sideOf(sPos.x) > 0) {
      list = candidates.right;
      [from, to] = [sPos.x - DragConnector.MAX_VERTICAL_CONNECTION_TOLERANCE, sPos.x];
    } else {
      list = candidates.left;
      [from, to] = [sPos.x, sPos.x + DragConnector.MAX_VERTICAL_CONNECTION_TOLERANCE];
    }
    // A pixel more on each side: inReach, on the topics as they are, has the last word.
    const inRange: Candidate[] = [];
    let i = lowerBound(list, from - 1);
    let candidate = list[i];
    while (candidate && candidate.border <= to + 1) {
      if (inReach(candidate.topic)) {
        inRange.push(candidate);
      }
      i += 1;
      candidate = list[i];
    }
    // Back in the order of the topic list, which the sort below keeps for equal weights.
    const topics = inRange.sort((a, b) => a.index - b.index).map(({ topic }) => topic);

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
   * The topics the drag may connect to (see DragCandidates). A drag does not change the map, so
   * they and their borders are read once per drag (per DragTopic), not on every mousemove; a topic
   * that moves or collapses during the drag is not seen.
   */
  private _getDragCandidates(dragTopic: DragTopic): DragCandidates {
    let result = this._dragCandidates.get(dragTopic);
    if (!result) {
      const branch = this._getDraggedBranch(dragTopic);
      const right: Candidate[] = [];
      const left: Candidate[] = [];
      const top: Candidate[] = [];
      this._designerModel.getTopics().forEach((topic, index) => {
        if (branch.has(topic.getId()) || topic.areChildrenShrunken() || topic.isCollapsed()) {
          return;
        }
        const { x, y } = topic.getPosition();
        const { width, height } = topic.getSize();
        // As inReach works them out, x + (width / 2) * side, for either side.
        right.push({ topic, index, border: x + width / 2 });
        left.push({ topic, index, border: x - width / 2 });
        top.push({ topic, index, border: y - height / 2 });
      });
      const byBorder = (a: Candidate, b: Candidate) => a.border - b.border;
      result = { right: right.sort(byBorder), left: left.sort(byBorder), top: top.sort(byBorder) };
      this._dragCandidates.set(dragTopic, result);
    }
    return result;
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
