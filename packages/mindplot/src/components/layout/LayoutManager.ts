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
import { $assert, $defined } from '@wisemapping/core-js';
import Events from '../Events';
import RootedTreeSet from './RootedTreeSet';
import OriginalLayout from './OriginalLayout';
import ChangeEvent from './ChangeEvent';
import SizeType from '../SizeType';
import Node from './Node';
import PositionType from '../PositionType';

class LayoutManager extends Events {
  private _treeSet: RootedTreeSet;

  private _layout: OriginalLayout;

  private _events: ChangeEvent[];

  constructor(rootNodeId: number, rootSize: SizeType) {
    super();
    $assert($defined(rootNodeId), 'rootNodeId can not be null');
    $assert(rootSize, 'rootSize can not be null');

    this._treeSet = new RootedTreeSet();
    this._layout = new OriginalLayout(this._treeSet);

    const rootNode = this._layout.createNode(rootNodeId, rootSize, { x: 0, y: 0 }, 'root');
    this._treeSet.setRoot(rootNode);
    this._events = [];
  }

  updateNodeSize(id: number, size: SizeType): void {
    $assert($defined(id), 'id can not be null');

    const node = this._treeSet.find(id);
    node.setSize(size);
  }

  updateShrinkState(id: number, value: boolean): void {
    $assert($defined(id), 'id can not be null');
    $assert($defined(value), 'value can not be null');

    const node = this._treeSet.find(id);
    node.setShrunken(value);
  }

  find(id: number): Node {
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
    node.setPosition(position);
  }

  connectNode(parentId: number, childId: number, order: number) {
    $assert($defined(parentId), 'parentId cannot be null');
    $assert($defined(childId), 'childId cannot be null');
    $assert($defined(order), 'order cannot be null');

    this._layout.connectNode(parentId, childId, order);

    return this;
  }

  disconnectNode(id: number): void {
    $assert($defined(id), 'id can not be null');
    this._layout.disconnectNode(id);
  }

  /**
   * @param id
   * @param size
   * @param position
   * @throws will throw an error if id is null or undefined
   * @return this
   */
  addNode(id: number, size: SizeType, position: PositionType) {
    $assert($defined(id), 'id can not be null');
    const result = this._layout.createNode(id, size, position, 'topic');
    this._treeSet.add(result);

    return this;
  }

  removeNode(id: number) {
    $assert($defined(id), 'id can not be null');
    const node = this._treeSet.find(id);

    // Is It connected ?
    if (this._treeSet.getParent(node)) {
      this.disconnectNode(id);
    }

    // Remove the all the branch ...
    this._treeSet.remove(id);

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

  dump() {
    console.log(this._treeSet.dump());
  }

  plot(containerId: string, size = { width: 200, height: 200 }) {
    // this method is only used from tests that include Raphael

    if (!globalThis.Raphael) {
      console.warn('Raphael.js not found, exiting plot()');
      return null;
    }
    $assert(containerId, 'containerId cannot be null');
    const squaresize = 10;
    const canvas = globalThis.Raphael(containerId, size.width, size.height);
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

  layout(flush: boolean): LayoutManager {
    // File repositioning ...
    this._layout.layout();

    // Collect changes ...
    this._collectChanges(this._treeSet.getTreeRoots());

    if (flush) {
      this._flushEvents();
    }

    return this;
  }

  private _flushEvents() {
    this._events.forEach((event) => {
      this.fireEvent('change', event);
    });
    this._events = [];
  }

  private _collectChanges(nodes: Node[]) {
    nodes.forEach((node) => {
      if (node.hasOrderChanged() || node.hasPositionChanged()) {
        // Find or create a event ...
        const id = node.getId();
        let event: ChangeEvent | undefined = this._events.find((e) => e.getId() === id);
        if (!event) {
          event = new ChangeEvent(id);
        }

        // Update nodes ...
        event.setOrder(node.getOrder());
        event.setPosition(node.getPosition());

        node.resetPositionState();
        node.resetOrderState();
        node.resetFreeState();
        this._events.push(event);
      }
      this._collectChanges(this._treeSet.getChildren(node));
    });
  }
}

export default LayoutManager;
