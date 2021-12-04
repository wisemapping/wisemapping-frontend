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
import _ from '@libraries/underscore-min';
import { $assert, $defined } from '@wisemapping/core-js';
import Node from './Node';
import SymmetricSorter from './SymmetricSorter';
import BalancedSorter from './BalancedSorter';

const OriginalLayout = new Class({
  initialize(treeSet) {
    this._treeSet = treeSet;
  },

  /** */
  createNode(id, size, position, type) {
    $assert($defined(id), 'id can not be null');
    $assert(size, 'size can not be null');
    $assert(position, 'position can not be null');
    $assert(type, 'type can not be null');

    const strategy = type === 'root' ? OriginalLayout.BALANCED_SORTER : OriginalLayout.SYMMETRIC_SORTER;
    return new Node(id, size, position, strategy);
  },

  /** */
  connectNode(parentId, childId, order) {
    const parent = this._treeSet.find(parentId);
    const child = this._treeSet.find(childId);

    // Insert the new node ...
    const sorter = parent.getSorter();
    sorter.insert(this._treeSet, parent, child, order);

    // Connect the new node ...
    this._treeSet.connect(parentId, childId);

    // Fire a basic validation ...
    sorter.verify(this._treeSet, parent);
  },

  /** */
  disconnectNode(nodeId) {
    const node = this._treeSet.find(nodeId);
    const parent = this._treeSet.getParent(node);
    $assert(parent, 'Node already disconnected');

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
  },

  /** */
  layout() {
    const roots = this._treeSet.getTreeRoots();
    _.each(
      roots,
      function (node) {
        // Calculate all node heights ...
        const sorter = node.getSorter();

        const heightById = sorter.computeChildrenIdByHeights(this._treeSet, node);

        this._layoutChildren(node, heightById);

        this._fixOverlapping(node, heightById);
      },
      this,
    );
  },

  _layoutChildren(node, heightById) {
    const nodeId = node.getId();
    const children = this._treeSet.getChildren(node);
    const parent = this._treeSet.getParent(node);
    const childrenOrderMoved = children.some((child) => child.hasOrderChanged());
    const childrenSizeChanged = children.some((child) => child.hasSizeChanged());

    // If ether any of the nodes has been changed of position or the height of the children is not
    // the same, children nodes must be repositioned ....
    const newBranchHeight = heightById[nodeId];

    const parentHeightChanged = $defined(parent) ? parent._heightChanged : false;
    const heightChanged = node._branchHeight !== newBranchHeight;
    node._heightChanged = heightChanged || parentHeightChanged;

    if (childrenOrderMoved || childrenSizeChanged || heightChanged || parentHeightChanged) {
      const sorter = node.getSorter();
      const offsetById = sorter.computeOffsets(this._treeSet, node);
      const parentPosition = node.getPosition();
      const me = this;
      _.each(children, (child) => {
        const offset = offsetById[child.getId()];

        const childFreeDisplacement = child.getFreeDisplacement();
        const direction = node.getSorter().getChildDirection(me._treeSet, child);

        if (
          (direction > 0 && childFreeDisplacement.x < 0)
          || (direction < 0 && childFreeDisplacement.x > 0)
        ) {
          child.resetFreeDisplacement();
          child.setFreeDisplacement({
            x: -childFreeDisplacement.x,
            y: childFreeDisplacement.y,
          });
        }

        offset.x += child.getFreeDisplacement().x;
        offset.y += child.getFreeDisplacement().y;

        const parentX = parentPosition.x;
        const parentY = parentPosition.y;

        const newPos = {
          x: parentX + offset.x,
          y: parentY + offset.y + me._calculateAlignOffset(node, child, heightById),
        };
        me._treeSet.updateBranchPosition(child, newPos);
      });

      node._branchHeight = newBranchHeight;
    }

    // Continue reordering the children nodes ...
    _.each(
      children,
      function (child) {
        this._layoutChildren(child, heightById);
      },
      this,
    );
  },

  _calculateAlignOffset(node, child, heightById) {
    if (child.isFree()) {
      return 0;
    }

    let offset = 0;

    const nodeHeight = node.getSize().height;
    const childHeight = child.getSize().height;

    if (
      this._treeSet.isStartOfSubBranch(child)
      && this._branchIsTaller(child, heightById)
    ) {
      if (this._treeSet.hasSinglePathToSingleLeaf(child)) {
        offset = heightById[child.getId()] / 2
          - (childHeight + child.getSorter()._getVerticalPadding() * 2) / 2;
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
  },

  _branchIsTaller(node, heightById) {
    return (
      heightById[node.getId()]
      > node.getSize().height + node.getSorter()._getVerticalPadding() * 2
    );
  },

  _fixOverlapping(node, heightById) {
    const children = this._treeSet.getChildren(node);

    if (node.isFree()) {
      this._shiftBranches(node, heightById);
    }

    _.each(
      children,
      function (child) {
        this._fixOverlapping(child, heightById);
      },
      this,
    );
  },

  _shiftBranches(node, heightById) {
    const shiftedBranches = [node];

    const siblingsToShift = this._treeSet.getSiblingsInVerticalDirection(
      node,
      node.getFreeDisplacement().y,
    );
    let last = node;
    _.each(
      siblingsToShift,
      function (sibling) {
        const overlappingOccurs = shiftedBranches.some(function (shiftedBranch) {
          return this._branchesOverlap(shiftedBranch, sibling, heightById);
        }, this);

        if (!sibling.isFree() || overlappingOccurs) {
          const sAmount = node.getFreeDisplacement().y;
          this._treeSet.shiftBranchPosition(sibling, 0, sAmount);
          shiftedBranches.push(sibling);
        }
      },
      this,
    );

    const branchesToShift = this._treeSet
      .getBranchesInVerticalDirection(node, node.getFreeDisplacement().y)
      .filter((branch) => !shiftedBranches.contains(branch));

    _.each(
      branchesToShift,
      function (branch) {
        const bAmount = node.getFreeDisplacement().y;
        this._treeSet.shiftBranchPosition(branch, 0, bAmount);
        shiftedBranches.push(branch);
        last = branch;
      },
      this,
    );
  },

  _branchesOverlap(branchA, branchB, heightById) {
    // a branch doesn't really overlap with itself
    if (branchA === branchB) {
      return false;
    }

    const topA = branchA.getPosition().y - heightById[branchA.getId()] / 2;
    const bottomA = branchA.getPosition().y + heightById[branchA.getId()] / 2;
    const topB = branchB.getPosition().y - heightById[branchB.getId()] / 2;
    const bottomB = branchB.getPosition().y + heightById[branchB.getId()] / 2;

    return !(topA >= bottomB || bottomA <= topB);
  },
},
);

/**
 * @type {mindplot.layout.SymmetricSorter}
 */
OriginalLayout.SYMMETRIC_SORTER = new SymmetricSorter();
/**
 * @type {mindplot.layout.BalancedSorter}
 */
OriginalLayout.BALANCED_SORTER = new BalancedSorter();

export default OriginalLayout;
