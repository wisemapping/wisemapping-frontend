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
import EventBus from './EventBus';

class EventBusDispatcher {
  constructor() {
    this.registerBusEvents();
  }

  /**
     * @param {mindplot.layout.LayoutManager} layoutManager
     */
  setLayoutManager(layoutManager) {
    this._layoutManager = layoutManager;
  }

  /**
     * register bus events
     */
  registerBusEvents() {
    EventBus.instance.addEvent(EventBus.events.NodeAdded, this._nodeAdded.bind(this));
    EventBus.instance.addEvent(EventBus.events.NodeRemoved, this._nodeRemoved.bind(this));
    EventBus.instance.addEvent(EventBus.events.NodeResizeEvent, this._nodeResizeEvent.bind(this));
    EventBus.instance.addEvent(EventBus.events.NodeMoveEvent, this._nodeMoveEvent.bind(this));
    EventBus.instance.addEvent(
      EventBus.events.NodeDisconnectEvent, this._nodeDisconnectEvent.bind(this),
    );
    EventBus.instance.addEvent(EventBus.events.NodeConnectEvent, this._nodeConnectEvent.bind(this));
    EventBus.instance.addEvent(EventBus.events.NodeShrinkEvent, this._nodeShrinkEvent.bind(this));
    EventBus.instance.addEvent(EventBus.events.DoLayout, this._doLayout.bind(this));
  }

  _nodeResizeEvent(args) {
    this._layoutManager.updateNodeSize(args.node.getId(), args.size);
  }

  _nodeMoveEvent(args) {
    this._layoutManager.moveNode(args.node.getId(), args.position);
  }

  _nodeDisconnectEvent(node) {
    this._layoutManager.disconnectNode(node.getId());
  }

  _nodeConnectEvent(args) {
    this._layoutManager.connectNode(
      args.parentNode.getId(), args.childNode.getId(), args.childNode.getOrder(),
    );
  }

  _nodeShrinkEvent(node) {
    this._layoutManager.updateShrinkState(node.getId(), node.areChildrenShrunken());
  }

  _nodeAdded(node) {
    // Central topic must not be added twice ...
    if (node.getId() !== 0) {
      this._layoutManager.addNode(node.getId(), { width: 10, height: 10 }, node.getPosition());
      this._layoutManager.updateShrinkState(node.getId(), node.areChildrenShrunken());
    }
  }

  _nodeRemoved(node) {
    this._layoutManager.removeNode(node.getId());
  }

  _doLayout() {
    //        (function() {
    this._layoutManager.layout(true);
    //        console.log("---------");
    //        this._layoutManager.dump();
    //        console.log("---------");
    //        console.log("---------");
    //        }).delay(0, this);
  }

  /** @return layout manager */
  getLayoutManager() {
    return this._layoutManager;
  }
}

export default EventBusDispatcher;
