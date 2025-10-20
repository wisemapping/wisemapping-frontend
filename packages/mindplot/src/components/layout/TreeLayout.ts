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
import TreeSorter from './TreeSorter';
import RootedTreeSet from './RootedTreeSet';
import SizeType from '../SizeType';
import PositionType from '../PositionType';
import type { OrientationType } from './LayoutType';

class TreeLayout {
  private _treeSet: RootedTreeSet;

  constructor(treeSet: RootedTreeSet) {
    this._treeSet = treeSet;
  }

  getOrientation(): OrientationType {
    return 'vertical';
  }

  createNode(id: number, size: SizeType, position: PositionType, _type: string): Node {
    $assert($defined(id), 'id can not be null');
    // Tree layout uses TreeSorter for all nodes
    return new Node(id, size, position, TreeLayout.TREE_SORTER);
  }

  connectNode(parentId: number, childId: number, order: number): void {
    const parent = this._treeSet.find(parentId);
    const child = this._treeSet.find(childId);

    // Insert the new node
    const sorter = parent.getSorter();
    sorter.insert(this._treeSet, parent, child, order);

    // Connect the new node
    this._treeSet.connect(parentId, childId);

    // Fire a basic validation
    sorter.verify(this._treeSet, parent);
  }

  disconnectNode(nodeId: number): void {
    const node = this._treeSet.find(nodeId);
    const parent = this._treeSet.getParent(node);
    if (!parent) {
      throw new Error('Node already disconnected');
    }

    // Remove from children list
    const sorter = parent.getSorter();
    sorter.detach(this._treeSet, node);

    // Disconnect the node
    this._treeSet.disconnect(nodeId);

    // Fire a basic validation
    parent.getSorter().verify(this._treeSet, parent);
  }

  layout(): void {
    const roots = this._treeSet.getTreeRoots();
    roots.forEach((node) => {
      // Calculate all node widths (horizontal extent)
      const sorter = node.getSorter();
      const widthById = sorter.computeChildrenIdByHeights(this._treeSet, node);

      this.layoutChildren(node, widthById);
    });
  }

  /**
   * Migrates node ordering from another layout (e.g., BalancedSorter with gaps)
   * to TreeLayout's continuous ordering requirement
   */
  migrateFromLayout(): void {
    const roots = this._treeSet.getTreeRoots();
    roots.forEach((node) => {
      this._migrateNodeOrdering(node);
    });
  }

  private _migrateNodeOrdering(node: Node): void {
    const children = this._treeSet.getChildren(node);

    if (children.length === 0) {
      return;
    }

    // Update sorter strategy to TreeSorter for all nodes
    node.setSorter(TreeLayout.TREE_SORTER);

    // Sort children by current order
    const sortedChildren = [...children].sort((a, b) => a.getOrder() - b.getOrder());

    // Renumber sequentially
    sortedChildren.forEach((child, index) => {
      child.setOrder(index);
    });

    // Recursively fix all descendants
    children.forEach((child) => {
      this._migrateNodeOrdering(child);
    });
  }

  private layoutChildren(node: Node, widthById: Map<number, number>): void {
    const nodeId = node.getId();
    const children = this._treeSet.getChildren(node);
    const parent = this._treeSet.getParent(node);

    const childrenOrderMoved = children.some((child) => child.hasOrderChanged());
    const childrenSizeChanged = children.some((child) => child.hasSizeChanged());

    // If any of the nodes changed position or size, children must be repositioned
    const newBranchWidth = widthById.get(nodeId)!;

    const parentWidthChanged = parent ? parent._heightChanged : false;
    const widthChanged = node._branchHeight !== newBranchWidth;
    node._heightChanged = widthChanged || parentWidthChanged;

    if (childrenOrderMoved || childrenSizeChanged || widthChanged || parentWidthChanged) {
      const sorter = node.getSorter();
      const offsetById = sorter.computeOffsets(this._treeSet, node);
      const parentPosition = node.getPosition();

      children.forEach((child) => {
        const offset = offsetById.get(child.getId())!;

        const parentX = parentPosition.x;
        const parentY = parentPosition.y;

        const newPos = {
          x: parentX + offset.x,
          y: parentY + offset.y,
        };
        this._treeSet.updateBranchPosition(child, newPos);
      });

      node._branchHeight = newBranchWidth;
    }

    // Continue reordering the children nodes
    children.forEach((child) => {
      this.layoutChildren(child, widthById);
    });
  }

  static TREE_SORTER = new TreeSorter();
}

export default TreeLayout;
