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
import { $assert } from '@wisemapping/core-js';
import DesignerModel from './DesignerModel';
import DragTopic from './DragTopic';
import SizeType from './SizeType';
import Topic from './Topic';
import Canvas from './Canvas';
import PositionType from './PositionType';

class DragConnector {
  private _designerModel: DesignerModel;

  private _workspace: Canvas;

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
    let topics = this._designerModel.getTopics();
    const draggedNode = dragTopic.getDraggedTopic();

    // Drag node connects to the border ...
    // const dragTopicWidth = dragTopic.getSize ? dragTopic.getSize().width : 0; // Hack...
    const dragTopicWidth = 0;
    const xMouseGap = dragTopic.getPosition().x > 0 ? 0 : dragTopicWidth;
    const sPos = { x: dragTopic.getPosition().x - xMouseGap, y: dragTopic.getPosition().y };

    // Perform a initial filter to discard topics:
    //  - Exclude dragged topic
    //  - Exclude dragTopic pivot
    //  - Nodes that are collapsed
    //  - It's not part of the branch dragged itself
    topics = topics.filter((topic: Topic) => {
      let result = draggedNode !== topic;
      result = result && topic !== draggedNode;
      result = result && !topic.areChildrenShrunken() && !topic.isCollapsed();
      result = result && !draggedNode.isChildTopic(topic);
      return result;
    });

    // Filter all the nodes that are outside the vertical boundary:
    //  * The node is to out of the x scope
    //  * The x distance greater the vertical tolerated distance
    topics = topics.filter((topic: Topic) => {
      const tpos = topic.getPosition();
      // Center topic has different alignment than the rest of the nodes.
      // That's why i need to divide it by two...
      const txborder = tpos.x + (topic.getSize().width / 2) * Math.sign(sPos.x);
      const distance = (sPos.x - txborder) * Math.sign(sPos.x);
      return distance > 0 && distance < DragConnector.MAX_VERTICAL_CONNECTION_TOLERANCE;
    });

    // Assign a priority based on the distance:
    // - Alignment with the targetNode
    // - Vertical distance
    // - Horizontal proximity
    // - It's already connected.
    const currentConnection = dragTopic.getConnectedToTopic();
    const me = this;
    topics = topics.sort((a, b) => {
      const aPos = a.getPosition();
      const bPos = b.getPosition();

      const av = me._isVerticallyAligned(a.getSize(), aPos, sPos);
      const bv = me._isVerticallyAligned(b.getSize(), bPos, sPos);
      return (
        me._proximityWeight(av, a, sPos, currentConnection!) -
        me._proximityWeight(bv, b, sPos, currentConnection!)
      );
    });
    return topics;
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

  private _isVerticallyAligned(
    targetSize: SizeType,
    targetPosition: PositionType,
    sourcePosition: PositionType,
  ): boolean {
    return Math.abs(sourcePosition.y - targetPosition.y) < targetSize.height / 2;
  }

  static MAX_VERTICAL_CONNECTION_TOLERANCE = 80;
}

export default DragConnector;
