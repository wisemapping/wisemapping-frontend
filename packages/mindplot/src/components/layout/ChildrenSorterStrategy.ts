/**
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
import RootedTreeSet from './RootedTreeSet';
import Node from './Node';
import PositionType from '../PositionType';

/** Where a new or dragged child of a parent goes: its order among the siblings and its position. */
export type SorterPrediction = { order: number; position: Readonly<PositionType> };

abstract class ChildrenSorterStrategy {
  /** Height of the branch of every node under `node` (and of its own), by node id. */
  abstract computeChildrenIdByHeights(treeSet: RootedTreeSet, node: Node): Map<number, number>;

  /**
   * Extent of the branch of every node under `node` (and of its own), by node id, along the axis
   * this sorter lays siblings out on: their height for the mind map sorters, their width for the
   * tree one. It is what computeOffsets measures each child branch by.
   */
  abstract computeBranchExtents(treeSet: RootedTreeSet, node: Node): Map<number, number>;

  /**
   * Names how computeBranchExtents measures a branch. Sorters with the same key measure branches
   * the same way, so the extents one of them computed can be given to the other's computeOffsets.
   */
  abstract getBranchExtentKey(): string;

  /**
   * Offset of each child of `node` from it, by child id. Sorts the children of `node` by order.
   * @param extentById the extents of the branches under `node`, from computeBranchExtents of a
   * sorter with the same getBranchExtentKey. Without them, every child branch is measured here.
   */
  abstract computeOffsets(
    treeSet: RootedTreeSet,
    node: Node,
    extentById?: Map<number, number>,
  ): Map<number, PositionType>;

  abstract insert(treeSet: RootedTreeSet, parent: Node, child: Node, order?: number): void;

  abstract detach(treeSet: RootedTreeSet, node: Node): void;

  abstract predict(
    treeSet: RootedTreeSet,
    parent: Node,
    node: Node | null,
    position: PositionType | null,
  ): SorterPrediction;

  abstract verify(treeSet: RootedTreeSet, node: Node): void;

  abstract getChildDirection(treeSet: RootedTreeSet, node: Node): 1 | -1;

  /**
   * Order a new child must be inserted with to sit right after the sibling with the given
   * order. Children orders are contiguous by default, so it is the next one.
   */
  getOrderAfter(order: number): number {
    return order + 1;
  }

  /**
   * Orders for `count` new children appended to `parent` in one go, before any is inserted.
   * By default they follow each other, after the slot the layout predicts for the first.
   */
  getOrdersForNewChildren(treeSet: RootedTreeSet, parent: Node, count: number): number[] {
    const orders: number[] = [];
    let { order } = this.predict(treeSet, parent, null, null);
    for (let i = 0; i < count; i++) {
      if (i > 0) {
        order = this.getOrderAfter(order);
      }
      orders.push(order);
    }
    return orders;
  }

  abstract toString(): string;

  abstract getVerticalPadding(): number;
}

export default ChildrenSorterStrategy;
