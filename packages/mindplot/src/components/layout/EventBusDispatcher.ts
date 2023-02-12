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
import PositionType from '../PositionType';
import SizeType from '../SizeType';
import Topic from '../Topic';
import EventBus from './EventBus';
import LayoutManager from './LayoutManager';

class EventBusDispatcher {
  private _layoutManager: LayoutManager | null;

  constructor() {
    this.registerBusEvents();
    this._layoutManager = null;
  }

  setLayoutManager(layoutManager: LayoutManager) {
    this._layoutManager = layoutManager;
  }

  registerBusEvents() {
    EventBus.instance.addEvent('topicAdded', this._topicAdded.bind(this));
    EventBus.instance.addEvent('topicRemoved', this._topicRemoved.bind(this));
    EventBus.instance.addEvent('topicResize', this._topicResizeEvent.bind(this));
    EventBus.instance.addEvent('topicMoved', this._topicMoved.bind(this));
    EventBus.instance.addEvent('topicDisconect', this._topicDisconect.bind(this));
    EventBus.instance.addEvent('topicConnected', this._topicConnected.bind(this));
    EventBus.instance.addEvent('childShrinked', this._childShrinked.bind(this));
    EventBus.instance.addEvent('forceLayout', this._forceLayout.bind(this));
  }

  private _topicResizeEvent(args: { node: Topic; size: SizeType }) {
    this._layoutManager!.updateNodeSize(args.node.getId(), args.size);
  }

  private _topicMoved(args: { node: Topic; position: PositionType }) {
    this._layoutManager!.moveNode(args.node.getId(), args.position);
  }

  private _topicDisconect(node: Topic) {
    this._layoutManager!.disconnectNode(node.getId());
  }

  private _topicConnected(args: { parentNode: Topic; childNode: Topic }) {
    this._layoutManager!.connectNode(
      args.parentNode.getId(),
      args.childNode.getId(),
      args.childNode.getOrder()!, // @todo: This can be a issue ...
    );
  }

  private _childShrinked(node: Topic) {
    this._layoutManager!.updateShrinkState(node.getId(), node.areChildrenShrunken());
  }

  private _topicAdded(node: Topic) {
    // Central topic must not be added twice ...
    if (node.getId() !== 0) {
      this._layoutManager!.addNode(node.getId(), { width: 10, height: 10 }, node.getPosition());
      this._layoutManager!.updateShrinkState(node.getId(), node.areChildrenShrunken());
    }
  }

  private _topicRemoved(node: Topic) {
    this._layoutManager!.removeNode(node.getId());
  }

  private _forceLayout() {
    this._layoutManager!.layout(true);
  }

  getLayoutManager(): LayoutManager {
    return this._layoutManager!;
  }
}

export default EventBusDispatcher;
