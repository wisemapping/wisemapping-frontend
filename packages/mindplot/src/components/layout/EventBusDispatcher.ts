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
import PositionType from '../PositionType';
import INodeModel from '../model/INodeModel';
import SizeType from '../SizeType';
import LayoutEventBus, { LayoutEventPayloads } from './LayoutEventBus';
import LayoutManager from './LayoutManager';
import { LayoutEventBusType } from '../LayoutEventBusType';

type BusHandler = Parameters<typeof LayoutEventBus.addEvent>[1];

/** A handler for one event, typed with the payload the bus sends for it. */
type EventHandler<T extends LayoutEventBusType> = (arg: LayoutEventPayloads[T]) => void;

const busHandler = <T extends LayoutEventBusType>(
  type: T,
  handler: EventHandler<T>,
): [LayoutEventBusType, BusHandler] => [type, handler as BusHandler];

class EventBusDispatcher {
  private _layoutManager: LayoutManager | null;

  // LayoutEventBus is module-level: keep the handlers, so that dispose() can remove them ...
  private _busHandlers: [LayoutEventBusType, BusHandler][] = [];

  // A connection asks for a layout, which is run once for a run of them (see _requestLayout).
  private _layoutPending = false;

  private _flushScheduled = false;

  private _batchDepth = 0;

  constructor() {
    this.registerBusEvents();
    this._layoutManager = null;
  }

  setLayoutManager(layoutManager: LayoutManager) {
    this._layoutManager = layoutManager;
    this._layoutPending = false;
  }

  /**
   * Holds back the layouts that connections ask for until the matching endBatch(), which lays out
   * once if any was asked for. Loading a map connects every topic: laying out after each one made
   * the load quadratic. Batches nest.
   */
  beginBatch(): void {
    this._batchDepth += 1;
  }

  endBatch(): void {
    if (this._batchDepth === 0) {
      return;
    }
    this._batchDepth -= 1;
    if (this._batchDepth === 0) {
      this.flushPendingLayout();
    }
  }

  /** Runs the layout that connections asked for, if it has not run yet. */
  flushPendingLayout(): void {
    if (this._layoutPending && this._layoutManager) {
      this._layoutPending = false;
      this._layoutManager.layout(true);
    }
  }

  registerBusEvents() {
    this.dispose();
    this._busHandlers = [
      busHandler('topicAdded', this._topicAdded.bind(this)),
      busHandler('topicRemoved', this._topicRemoved.bind(this)),
      busHandler('topicResize', this._topicResizeEvent.bind(this)),
      busHandler('topicMoved', this._topicMoved.bind(this)),
      busHandler('topicDisconect', this._topicDisconect.bind(this)),
      busHandler('topicConnected', this._topicConnected.bind(this)),
      busHandler('childShrinked', this._childShrinked.bind(this)),
      busHandler('forceLayout', this._forceLayout.bind(this)),
    ];
    this._busHandlers.forEach(([type, handler]) => LayoutEventBus.addEvent(type, handler));
  }

  /**
   * Removes the LayoutEventBus handlers, so that this dispatcher no longer drives its layout.
   */
  dispose(): void {
    this._busHandlers.forEach(([type, handler]) => LayoutEventBus.removeEvent(type, handler));
    this._busHandlers = [];
    this._layoutPending = false;
    this._batchDepth = 0;
  }

  /**
   * A connection needs a layout, but not one each: Topic.connectTo fires forceLayout right after
   * topicConnected, the commands that rebuild branches end with forceLayout, and a map load is a
   * batch. So the layout waits for the next forceLayout or the end of the batch, and at the
   * latest runs in a microtask, so that a connection made anywhere else is still laid out.
   */
  private _requestLayout(): void {
    this._layoutPending = true;
    if (this._batchDepth === 0 && !this._flushScheduled) {
      this._flushScheduled = true;
      queueMicrotask(() => {
        this._flushScheduled = false;
        this.flushPendingLayout();
      });
    }
  }

  private _topicResizeEvent(args: { node: INodeModel; size: SizeType }) {
    this.getLayoutManager().updateNodeSize(args.node.getId(), args.size);
  }

  private _topicMoved(args: { node: INodeModel; position: PositionType }) {
    this.getLayoutManager().moveNode(args.node.getId(), args.position);
  }

  private _topicDisconect(node: INodeModel) {
    this.getLayoutManager().disconnectNode(node.getId());
  }

  private _topicConnected(args: { parentNode: INodeModel; childNode: INodeModel }) {
    // Get the order, handling undefined for topics without order attribute
    let order = args.childNode.getOrder();
    if (order === undefined) {
      // If order is not set, assign the next available order
      // This can happen when loading maps where topics don't have order attributes
      const parent = args.parentNode;
      const siblings = parent.getChildren().filter((child) => child !== args.childNode);
      order = siblings.length;

      // Set the order on the child for future consistency
      args.childNode.setOrder(order);
    }

    this._layoutManager!.connectNode(args.parentNode.getId(), args.childNode.getId(), order);

    // Recalculate layout after connection to update positions
    this._requestLayout();
  }

  getLayoutManager(): LayoutManager {
    if (!this._layoutManager) {
      throw new Error('Layout not initialized');
    }
    return this._layoutManager;
  }

  private _childShrinked(node: INodeModel) {
    this.getLayoutManager().updateShrinkState(node.getId(), node.areChildrenShrunken());
  }

  // The bus hands over topic models (see LayoutEventPayloads), not topics.
  private _topicAdded(node: INodeModel) {
    // Central topic must not be added twice ...
    if (node.getId() !== 0) {
      this.getLayoutManager().addNode(
        node.getId(),
        { width: 10, height: 10 },
        EventBusDispatcher._initialPosition(node),
      );
      this.getLayoutManager().updateShrinkState(node.getId(), node.areChildrenShrunken());
    }
  }

  /**
   * A model may have no position (getPosition() is then undefined). As the Tango loader does,
   * fall back to the closest ancestor position, or the origin, so the layout gets real numbers.
   */
  private static _initialPosition(node: INodeModel): PositionType {
    let model: INodeModel | null = node;
    while (model) {
      const position = model.getPosition();
      if (position) {
        return position;
      }
      model = model.getParent();
    }
    return { x: 0, y: 0 };
  }

  private _topicRemoved(node: INodeModel) {
    this.getLayoutManager().removeNode(node.getId());
  }

  private _forceLayout(): void {
    // This layout includes any a connection asked for ...
    this._layoutPending = false;
    this.getLayoutManager().layout(true);
  }
}

export default EventBusDispatcher;
