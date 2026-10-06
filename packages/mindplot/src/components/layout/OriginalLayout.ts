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
import { $assert } from '../util/assert';
import Node from './Node';
import SymmetricSorter from './SymmetricSorter';
import BalancedSorter from './BalancedSorter';
import type RootedTreeSet from './RootedTreeSet';
import type SizeType from '../SizeType';
import type PositionType from '../PositionType';
import type ChildrenSorterStrategy from './ChildrenSorterStrategy';
import AbstractBasicSorter from './AbstractBasicSorter';
import LayoutPass from './LayoutPass';
import type { OrientationType } from './LayoutType';

class OriginalLayout {
  private _treeSet: RootedTreeSet;

  constructor(treeSet: RootedTreeSet) {
    this._treeSet = treeSet;
  }

  getOrientation(): OrientationType {
    return 'horizontal';
  }

  createNode(id: number, size: SizeType, position: PositionType, type: string): Node {
    $assert(id != null, 'id can not be null');
    const strategy: ChildrenSorterStrategy =
      type === 'root' ? OriginalLayout.BALANCED_SORTER : OriginalLayout.SYMMETRIC_SORTER;
    return new Node(id, size, position, strategy);
  }

  connectNode(parentId: number, childId: number, order: number): void {
    const parent = this._treeSet.find(parentId);
    const child = this._treeSet.find(childId);

    // Insert the new node ...
    const sorter = parent.getSorter();
    sorter.insert(this._treeSet, parent, child, order);

    // Connect the new node ...
    this._treeSet.connect(parentId, childId);

    // Fire a basic validation ...
    sorter.verify(this._treeSet, parent);
  }

  disconnectNode(nodeId: number): void {
    const node = this._treeSet.find(nodeId);
    const parent = this._treeSet.getParent(node);
    if (!parent) {
      throw new Error('Node already disconnected');
    }

    // Remove from children list.
    const sorter = parent.getSorter();
    sorter.detach(this._treeSet, node);

    // Disconnect the new node ...
    this._treeSet.disconnect(nodeId);

    // Fire a basic validation ...
    parent.getSorter().verify(this._treeSet, parent);
  }

  layout(): void {
    const roots = this._treeSet.getTreeRoots();
    roots.forEach((node) => {
      // Calculate all node heights ...
      const sorter = node.getSorter();
      const heightById = sorter.computeChildrenIdByHeights(this._treeSet, node);

      // The mind map sorters lay the branches out by these same heights: measure them only once.
      const pass = new LayoutPass(this._treeSet, node);
      pass.seedExtents(
        AbstractBasicSorter.heightExtentKey(sorter.getVerticalPadding()),
        heightById,
      );

      this.layoutChildren(node, heightById, pass);
    });
  }

  /**
   * Migrates node ordering from TreeLayout's continuous ordering
   * to OriginalLayout's balanced ordering (even/odd for the central topic's children).
   * The other tree roots, floating topics, get the sorter of a topic, as createNode gives them.
   */
  migrateFromLayout(centralId: number): void {
    const roots = this._treeSet.getTreeRoots();
    roots.forEach((node) => {
      this._migrateNodeOrdering(node, node.getId() === centralId);
    });
  }

  private _migrateNodeOrdering(node: Node, isRoot: boolean): void {
    // Update sorter strategy based on node type, also for a node without children yet: it would
    // otherwise keep the sorter of the other layout for the children it gets.
    node.setSorter(isRoot ? OriginalLayout.BALANCED_SORTER : OriginalLayout.SYMMETRIC_SORTER);

    const children = this._treeSet.getChildren(node);
    if (children.length === 0) {
      return;
    }

    if (isRoot) {
      // Sort children by current order
      const sortedChildren = [...children].sort(
        (a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0),
      );

      // Redistribute: first half to right (even), second half to left (odd)
      const midpoint = Math.ceil(sortedChildren.length / 2);

      sortedChildren.forEach((child, index) => {
        if (index < midpoint) {
          // Right side: 0, 2, 4, 6...
          child.setOrder(index * 2);
        } else {
          // Left side: 1, 3, 5, 7...
          child.setOrder((index - midpoint) * 2 + 1);
        }
      });
    } else {
      // For non-root nodes, ensure continuous ordering
      const sortedChildren = [...children].sort(
        (a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0),
      );
      sortedChildren.forEach((child, index) => {
        child.setOrder(index);
      });
    }

    // Recursively fix all descendants
    children.forEach((child) => {
      this._migrateNodeOrdering(child, false);
    });
  }

  /**
   * Places the children of `node` around it, then their own children, down the tree. Every
   * parent is laid out on every pass: where its children go depends on their sizes, orders and
   * branches, on its own size, position and side, and on the shape of the tree, which is more
   * than a change flag can tell. With the branches measured once per pass, laying a parent out
   * costs a walk of its children, and a child already in place is not moved, so a pass that
   * changes nothing moves nothing.
   */
  private layoutChildren(node: Node, heightById: Map<number, number>, pass: LayoutPass): void {
    const children = this._treeSet.getChildren(node);
    if (children.length === 0) {
      return;
    }

    const sorter = node.getSorter();
    const offsetById = sorter.computeOffsets(this._treeSet, node, pass.extentsFor(sorter));
    const parentPosition = node.getPosition();
    const hasSiblings = children.length > 1;

    children.forEach((child) => {
      const offset = offsetById.get(child.getId())!;

      const newPos = {
        x: parentPosition.x + offset.x,
        y:
          parentPosition.y +
          offset.y +
          this.calculateAlignOffset(node, child, heightById, hasSiblings),
      };
      pass.moveBranch(child, newPos);
    });

    // Continue reordering the children nodes ...
    children.forEach((child) => {
      this.layoutChildren(child, heightById, pass);
    });
  }

  /**
   * @param hasSiblings whether `node` has other children than `child`, as getSiblings(child)
   * would tell, without filtering the children of `node` for each of them.
   */
  private calculateAlignOffset(
    node: Node,
    child: Node,
    heightById: Map<number, number>,
    hasSiblings: boolean,
  ): number {
    let offset = 0;

    const nodeHeight = node.getSize().height;
    const childHeight = child.getSize().height;

    // The start of a sub-branch: a child with siblings and a single child of its own.
    const isStartOfSubBranch = hasSiblings && this._treeSet.getChildren(child).length === 1;
    if (isStartOfSubBranch && OriginalLayout._branchIsTaller(child, heightById)) {
      if (this._treeSet.hasSinglePathToSingleLeaf(child)) {
        offset =
          heightById.get(child.getId())! / 2 -
          (childHeight + child.getSorter().getVerticalPadding() * 2) / 2;
      } else {
        offset = this._treeSet.isLeaf(child) ? 0 : -(childHeight - nodeHeight) / 2;
      }
    } else if (nodeHeight > childHeight) {
      if (hasSiblings) {
        offset = 0;
      } else {
        offset = nodeHeight / 2 - childHeight / 2;
      }
    } else if (childHeight > nodeHeight) {
      if (hasSiblings) {
        offset = 0;
      } else {
        offset = -(childHeight / 2 - nodeHeight / 2);
      }
    }

    return offset;
  }

  static _branchIsTaller(node: Node, heightById: Map<number, number>): boolean {
    return (
      heightById.get(node.getId())! >
      node.getSize().height + node.getSorter().getVerticalPadding() * 2
    );
  }

  static SYMMETRIC_SORTER: ChildrenSorterStrategy = new SymmetricSorter();

  static BALANCED_SORTER: ChildrenSorterStrategy = new BalancedSorter();
}
export default OriginalLayout;
