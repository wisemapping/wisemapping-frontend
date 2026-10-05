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
import { $assert, $defined } from '../util/assert';
import EventDispispatcher from '../EventDispatcher';
import RootedTreeSet, { RaphaelPaper } from './RootedTreeSet';
import OriginalLayout from './OriginalLayout';
import TreeLayout from './TreeLayout';
import ChangeEvent from './ChangeEvent';
import SizeType from '../SizeType';
import Node from './Node';
import PositionType from '../PositionType';
import LayoutEventType from './LayoutEventType';
import type { LayoutType, OrientationType } from './LayoutType';

/**
 * A layout node as LayoutManager.find gives it: without its setters. The manager tracks what
 * changes through its own methods (see needsLayout); a node changed behind its back would not be
 * laid out by the next forceLayout.
 */
export type NodeView = Omit<
  Node,
  | 'setShrunken'
  | 'setOrder'
  | 'resetPositionState'
  | 'resetOrderState'
  | 'resetFreeState'
  | 'setSize'
  | 'setFreeDisplacement'
  | 'setPosition'
  | 'setSorter'
  | '_children'
  | '_parent'
>;

class LayoutManager extends EventDispispatcher<LayoutEventType> {
  private _treeSet: RootedTreeSet;

  private _mindmapLayout: OriginalLayout;

  private _treeLayout: TreeLayout;

  private _layoutType: LayoutType;

  // The central topic: the root created with the manager. Floating topics are roots too.
  private _rootNodeId: number;

  private _events: ChangeEvent[];

  // The pending change of each node in _events: a layout that is not flushed leaves its changes
  // for the next one to update.
  private _eventsById: Map<number, ChangeEvent>;

  // Whether something the layout depends on (the trees, the orders, sizes, shrink states and the
  // positions of the roots) changed since it last ran. The layout is idempotent: without such a
  // change it would move nothing (see needsLayout).
  private _changedSinceLayout = true;

  constructor(rootNodeId: number, rootSize: SizeType, layoutType: LayoutType = 'mindmap') {
    super();
    $assert($defined(rootNodeId), 'rootNodeId can not be null');
    $assert(rootSize, 'rootSize can not be null');

    this._treeSet = new RootedTreeSet();
    this._mindmapLayout = new OriginalLayout(this._treeSet);
    this._treeLayout = new TreeLayout(this._treeSet);
    this._layoutType = layoutType;
    this._rootNodeId = rootNodeId;

    const rootNode = this._getCurrentLayout().createNode(
      rootNodeId,
      rootSize,
      { x: 0, y: 0 },
      'root',
    );
    this._treeSet.setRoot(rootNode);
    this._events = [];
    this._eventsById = new Map();
  }

  private _getCurrentLayout(): OriginalLayout | TreeLayout {
    return this._layoutType === 'mindmap' ? this._mindmapLayout : this._treeLayout;
  }

  updateNodeSize(id: number, size: SizeType): void {
    $assert($defined(id), 'id can not be null');

    const node = this._treeSet.find(id);
    const before = node.getSize();
    node.setSize(size);
    // Node.setSize ignores a change of half a pixel or less: the layout would not see it either.
    if (node.getSize() !== before) {
      this._changedSinceLayout = true;
    }
  }

  updateShrinkState(id: number, value: boolean): void {
    $assert($defined(id), 'id can not be null');
    $assert($defined(value), 'value can not be null');

    const node = this._treeSet.find(id);
    if (node.areChildrenShrunken() !== value) {
      node.setShrunken(value);
      this._changedSinceLayout = true;
    }
  }

  /** A node, to read: change it through the manager's methods, which needsLayout tracks. */
  find(id: number): NodeView {
    return this._treeSet.find(id);
  }

  /**
   * @param id
   * @param position
   * @throws will throw an error if id is null or undefined
   * @throws will throw an error if position is null or undefined
   * @throws will throw an error if the position's x property is null or undefined
   * @throws will throw an error if the position's y property is null or undefined
   */
  moveNode(id: number, position: PositionType) {
    $assert($defined(id), 'id cannot be null');
    $assert($defined(position), 'position cannot be null');
    $assert($defined(position.x), 'x can not be null');
    $assert($defined(position.y), 'y can not be null');

    const node = this._treeSet.find(id);
    const before = node.getPosition();
    node.setPosition(position);
    if (node.getPosition() !== before) {
      this._changedSinceLayout = true;
    }
  }

  connectNode(parentId: number, childId: number, order: number) {
    this._getCurrentLayout().connectNode(parentId, childId, order);
    this._changedSinceLayout = true;

    return this;
  }

  disconnectNode(id: number): void {
    $assert($defined(id), 'id can not be null');
    this._getCurrentLayout().disconnectNode(id);
    this._changedSinceLayout = true;
  }

  /**
   * @param id
   * @param size
   * @param position
   * @throws will throw an error if id is null or undefined
   * @throws will throw an error if position is missing, or its x or y is not a finite number
   * @return this
   */
  addNode(id: number, size: SizeType, position: PositionType) {
    $assert($defined(id), 'id can not be null');
    $assert(
      $defined(position) && Number.isFinite(position.x) && Number.isFinite(position.y),
      'position must have finite x and y',
    );
    const result = this._getCurrentLayout().createNode(id, size, position, 'topic');
    this._treeSet.add(result);
    this._changedSinceLayout = true;

    return this;
  }

  removeNode(id: number): LayoutManager {
    const node = this._treeSet.find(id);

    // Is It connected ?
    if (this._treeSet.getParent(node)) {
      this.disconnectNode(id);
    }

    // Remove the all the branch ...
    this._treeSet.remove(id);
    this._changedSinceLayout = true;

    return this;
  }

  predict(
    parentId: number,
    nodeId: number | null,
    position: PositionType | null,
  ): { order: number; position: PositionType } {
    const parent = this._treeSet.find(parentId);
    const node = nodeId ? this._treeSet.find(nodeId) : null;
    const sorter = parent.getSorter();

    const result = sorter.predict(this._treeSet, parent, node, position);
    return { order: result[0], position: result[1] };
  }

  /**
   * Order that inserts a new child of the parent right after its child with the given order.
   */
  getOrderAfter(parentId: number, order: number): number {
    const parent = this._treeSet.find(parentId);
    return parent.getSorter().getOrderAfter(order);
  }

  /** Orders for `count` new children of `parentId` added in one go (see the sorter). */
  getOrdersForNewChildren(parentId: number, count: number): number[] {
    const parent = this._treeSet.find(parentId);
    return parent.getSorter().getOrdersForNewChildren(this._treeSet, parent, count);
  }

  dump() {
    console.log(this._treeSet.dump());
  }

  plot(containerId: string, size = { width: 200, height: 200 }) {
    // this method is only used from tests that include Raphael

    const global = globalThis as typeof globalThis & {
      Raphael?: (container: string, width: number, height: number) => RaphaelPaper;
    };
    if (!global.Raphael) {
      console.warn('Raphael.js not found, exiting plot()');
      return null;
    }
    $assert(containerId, 'containerId cannot be null');
    const squaresize = 10;
    const canvas = global.Raphael(containerId, size.width, size.height);
    canvas.drawGrid(
      0,
      0,
      size.width,
      size.height,
      size.width / squaresize,
      size.height / squaresize,
    );
    this._treeSet.plot(canvas);

    return canvas;
  }

  /**
   * Whether a layout would do anything: something it depends on changed since it last ran, through
   * this manager, or a layout that was not flushed left changes to fire. find() gives the nodes
   * without their setters, so that they are not changed behind the manager's back.
   */
  needsLayout(): boolean {
    return this._changedSinceLayout || this._events.length > 0;
  }

  layout(flush?: boolean): LayoutManager {
    // File repositioning ...
    this._getCurrentLayout().layout();
    this._changedSinceLayout = false;

    // Collect changes ...
    this._collectChanges(this._treeSet.getTreeRoots());

    if (flush) {
      this._flushEvents();
    }

    return this;
  }

  setLayoutType(layoutType: LayoutType): void {
    if (this._layoutType !== layoutType) {
      this._layoutType = layoutType;

      // Migrate node ordering when switching layouts
      if (layoutType === 'tree') {
        // Switching to tree: fix ordering gaps from BalancedSorter
        this._treeLayout.migrateFromLayout();
      } else if (layoutType === 'mindmap') {
        // Switching to mindmap: redistribute for balanced sorter
        this._mindmapLayout.migrateFromLayout(this._rootNodeId);
      }

      // Trigger re-layout with new layout type
      this.layout(true);
    }
  }

  getLayoutType(): LayoutType {
    return this._layoutType;
  }

  getOrientation(): OrientationType {
    return this._getCurrentLayout().getOrientation();
  }

  private _flushEvents() {
    this._events.forEach((event) => {
      this.fireEvent('change', event);
    });
    this._events = [];
    this._eventsById.clear();
  }

  private _collectChanges(nodes: Node[]) {
    nodes.forEach((node) => {
      if (node.hasOrderChanged() || node.hasPositionChanged()) {
        // Find or create a event ...
        const id = node.getId();
        // A change left by a layout that was not flushed is queued already: update it only.
        let event = this._eventsById.get(id);
        if (!event) {
          event = new ChangeEvent(id);
          this._eventsById.set(id, event);
          this._events.push(event);
        }

        // Update nodes ...
        const nodeOrder = node.getOrder();
        if (nodeOrder !== undefined) {
          event.setOrder(nodeOrder);
        }
        event.setPosition(node.getPosition());

        node.resetPositionState();
        node.resetOrderState();
      }
      this._collectChanges(this._treeSet.getChildren(node));
    });
  }
}

export default LayoutManager;
