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
import Node from './Node';
import SymmetricSorter from './SymmetricSorter';
import BalancedSorter from './BalancedSorter';
import RootedTreeSet from './RootedTreeSet';
import SizeType from '../SizeType';
import PositionType from '../PositionType';
import ChildrenSorterStrategy from './ChildrenSorterStrategy';

class OriginalLayout {
  private _treeSet: RootedTreeSet;

  constructor(treeSet: RootedTreeSet) {
    this._treeSet = treeSet;
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

    // Make it fixed
    node.setFree(false);
    node.resetFreeDisplacement();

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

    if (node.isFree()) {
      this._shiftBranches(node, heightById);
    }
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
      /* eslint-disable */
      const overlappingOccurs = shiftedBranches.some((shiftedBranch) =>
        OriginalLayout._branchesOverlap(shiftedBranch, sibling, heightById),
      );
      /* eslint-enable */
      if (!sibling.isFree() || overlappingOccurs) {
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
