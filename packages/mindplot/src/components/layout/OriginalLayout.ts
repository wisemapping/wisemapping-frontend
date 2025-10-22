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
import Node from './Node';
import SymmetricSorter from './SymmetricSorter';
import BalancedSorter from './BalancedSorter';
import RootedTreeSet from './RootedTreeSet';
import SizeType from '../SizeType';
import PositionType from '../PositionType';
import ChildrenSorterStrategy from './ChildrenSorterStrategy';
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
    $assert($defined(id), 'id can not be null');
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

      this.layoutChildren(node, heightById);
      // this.fixOverlapping(node, heightById);
    });
  }

  /**
   * Migrates node ordering from TreeLayout's continuous ordering
   * to OriginalLayout's balanced ordering (even/odd for root children)
   */
  migrateFromLayout(): void {
    const roots = this._treeSet.getTreeRoots();
    roots.forEach((node) => {
      this._migrateNodeOrdering(node, true);
    });
  }

  private _migrateNodeOrdering(node: Node, isRoot: boolean): void {
    const children = this._treeSet.getChildren(node);

    if (children.length === 0) {
      return;
    }

    // Update sorter strategy based on node type
    if (isRoot) {
      node.setSorter(OriginalLayout.BALANCED_SORTER);

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
      // For non-root nodes, use SymmetricSorter and ensure continuous ordering
      node.setSorter(OriginalLayout.SYMMETRIC_SORTER);

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

  private layoutChildren(node: Node, heightById: Map<number, number>): void {
    const nodeId = node.getId();
    const children = this._treeSet.getChildren(node);
    const parent = this._treeSet.getParent(node);

    const childrenOrderMoved = children.some((child) => child.hasOrderChanged());
    const childrenSizeChanged = children.some((child) => child.hasSizeChanged());

    // If ether any of the nodes has been changed of position or the height of the children is not
    // the same, children nodes must be repositioned ....
    const newBranchHeight = heightById.get(nodeId)!;

    const parentHeightChanged = parent ? parent._heightChanged : false;
    const heightChanged = node._branchHeight !== newBranchHeight;
    node._heightChanged = heightChanged || parentHeightChanged;

    if (childrenOrderMoved || childrenSizeChanged || heightChanged || parentHeightChanged) {
      const sorter = node.getSorter();
      const offsetById = sorter.computeOffsets(this._treeSet, node);
      const parentPosition = node.getPosition();

      children.forEach((child) => {
        const offset = offsetById.get(child.getId())!;

        const parentX = parentPosition.x;
        const parentY = parentPosition.y;

        const newPos = {
          x: parentX + offset.x,
          y: parentY + offset.y + this.calculateAlignOffset(node, child, heightById),
        };
        this._treeSet.updateBranchPosition(child, newPos);
      });

      node._branchHeight = newBranchHeight;
    }

    // Continue reordering the children nodes ...
    children.forEach((child) => {
      this.layoutChildren(child, heightById);
    });
  }

  private calculateAlignOffset(node: Node, child: Node, heightById: Map<number, number>): number {
    let offset = 0;

    const nodeHeight = node.getSize().height;
    const childHeight = child.getSize().height;

    if (
      this._treeSet.isStartOfSubBranch(child) &&
      OriginalLayout._branchIsTaller(child, heightById)
    ) {
      if (this._treeSet.hasSinglePathToSingleLeaf(child)) {
        offset =
          heightById.get(child.getId())! / 2 -
          (childHeight + child.getSorter().getVerticalPadding() * 2) / 2;
      } else {
        offset = this._treeSet.isLeaf(child) ? 0 : -(childHeight - nodeHeight) / 2;
      }
    } else if (nodeHeight > childHeight) {
      if (this._treeSet.getSiblings(child).length > 0) {
        offset = 0;
      } else {
        offset = nodeHeight / 2 - childHeight / 2;
      }
    } else if (childHeight > nodeHeight) {
      if (this._treeSet.getSiblings(child).length > 0) {
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

  private fixOverlapping(node: Node, heightById: Map<number, number>): void {
    const children = this._treeSet.getChildren(node);

    children.forEach((child) => {
      this.fixOverlapping(child, heightById);
    });
  }

  _shiftBranches(node: Node, heightById: Map<number, number>): void {
    const shiftedBranches = [node];

    const siblingsToShift = this._treeSet.getSiblingsInVerticalDirection(
      node,
      node.getFreeDisplacement().y,
    );

    siblingsToShift.forEach((sibling) => {
      const overlappingOccurs = shiftedBranches.some((shiftedBranch) =>
        OriginalLayout._branchesOverlap(shiftedBranch, sibling, heightById),
      );
      if (overlappingOccurs) {
        const sAmount = node.getFreeDisplacement().y;
        this._treeSet.shiftBranchPosition(sibling, 0, sAmount);
        shiftedBranches.push(sibling);
      }
    });

    const branchesToShift = this._treeSet
      .getBranchesInVerticalDirection(node, node.getFreeDisplacement().y)
      .filter((branch) => !shiftedBranches.includes(branch));

    branchesToShift.forEach((branch) => {
      const bAmount = node.getFreeDisplacement().y;
      this._treeSet.shiftBranchPosition(branch, 0, bAmount);
      shiftedBranches.push(branch);
    });
  }

  static _branchesOverlap(branchA: Node, branchB: Node, heightById: Map<number, number>): boolean {
    // a branch doesn't really overlap with itself
    if (branchA === branchB) {
      return false;
    }

    const topA = branchA.getPosition().y - heightById.get(branchA.getId())! / 2;
    const bottomA = branchA.getPosition().y + heightById.get(branchA.getId())! / 2;
    const topB = branchB.getPosition().y - heightById.get(branchB.getId())! / 2;
    const bottomB = branchB.getPosition().y + heightById.get(branchB.getId())! / 2;

    return !(topA >= bottomB || bottomA <= topB);
  }

  static SYMMETRIC_SORTER: ChildrenSorterStrategy = new SymmetricSorter();

  static BALANCED_SORTER: ChildrenSorterStrategy = new BalancedSorter();
}
export default OriginalLayout;
