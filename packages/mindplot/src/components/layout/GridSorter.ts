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
import { $assert } from '@wisemapping/core-js';
import AbstractBasicSorter from './AbstractBasicSorter';
import RootedTreeSet from './RootedTreeSet';
import Node from './Node';
import PositionType from '../PositionType';

/**
 * @class
 * @extends mindplot.layout.AbstractBasicSorter
 */
class GridSorter extends AbstractBasicSorter {
  computeOffsets(treeSet: RootedTreeSet, node: Node): Map<number, PositionType> {
    $assert(treeSet, 'treeSet can no be null.');
    $assert(node, 'node can no be null.');
    // $assert('order can no be null.'); // This assertion seems incorrect, removing it

    const children = this._getSortedChildren(treeSet, node);

    // Compute heights ...
    const me = this;
    const heights = children.map((child) => ({
      id: child.getId(),
      height: me._computeChildrenHeight(treeSet, child),
    }));

    // Calculate the offsets ...
    const result = new Map<number, PositionType>();
    for (let i = 0; i < heights.length; i++) {
      const even = i % 2 === 0 ? 1 : -1;

      const zeroHeight = i === 0 ? 0 : (heights[0].height / 2) * even;
      let middleHeight = 0;
      for (let j = i - 2; j > 0; j -= 2) {
        middleHeight += heights[j].height * even;
      }
      const finalHeight = i === 0 ? 0 : (heights[i].height / 2) * even;

      const yOffset = zeroHeight + middleHeight + finalHeight;
      const xOffset = node.getSize().width + (GridSorter as any).GRID_HORIZONTAR_SIZE;

      $assert(!Number.isNaN(xOffset), 'xOffset can not be null');
      $assert(!Number.isNaN(yOffset), 'yOffset can not be null');

      result.set(heights[i].id, { x: xOffset, y: yOffset });
    }
    return result;
  }

  /**
   * @return {String} the print name of this class
   */
  toString(): string {
    return 'Grid Sorter';
  }

  // Abstract methods from ChildrenSorterStrategy
  insert(treeSet: RootedTreeSet, parent: Node, child: Node, order?: number): void {
    // Implementation needed
    throw new Error('Method not implemented.');
  }

  detach(treeSet: RootedTreeSet, node: Node): void {
    // Implementation needed
    throw new Error('Method not implemented.');
  }

  predict(
    treeSet: RootedTreeSet,
    parent: Node,
    node: Node | null,
    position: PositionType | null,
  ): void {
    // Implementation needed
    throw new Error('Method not implemented.');
  }

  verify(treeSet: RootedTreeSet, node: Node): void {
    // Implementation needed
    throw new Error('Method not implemented.');
  }

  getChildDirection(treeSet: RootedTreeSet, node: Node): 1 | -1 {
    // Implementation needed
    throw new Error('Method not implemented.');
  }
}

/**
 * @constant
 * @type {Number}
 * @default
 */
(GridSorter as any).GRID_HORIZONTAR_SIZE = 20;
/**
 * @constant
 * @type {Number}
 * @default
 */
(GridSorter as any).INTER_NODE_VERTICAL_DISTANCE = 50;

export default GridSorter;
