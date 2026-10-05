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
import TreeSorter from './TreeSorter';
import LayoutPass from './LayoutPass';
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
    $assert(id != null, 'id can not be null');
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
      // The branch widths are measured once, the first time a parent needs them.
      this.layoutChildren(node, new LayoutPass(this._treeSet, node));
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
    // Update sorter strategy to TreeSorter for all nodes, also the ones without children yet
    node.setSorter(TreeLayout.TREE_SORTER);

    const children = this._treeSet.getChildren(node);
    if (children.length === 0) {
      return;
    }

    // Sort children by current order
    const sortedChildren = [...children].sort((a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0));

    // Renumber sequentially
    sortedChildren.forEach((child, index) => {
      child.setOrder(index);
    });

    // Recursively fix all descendants
    children.forEach((child) => {
      this._migrateNodeOrdering(child);
    });
  }

  /**
   * Places the children of `node` under it, then their own children, down the tree. Every
   * parent is laid out on every pass, as in OriginalLayout.layoutChildren: with the branches
   * measured once per pass it costs a walk of its children, and a child already in place is not
   * moved.
   */
  private layoutChildren(node: Node, pass: LayoutPass): void {
    const children = this._treeSet.getChildren(node);
    if (children.length === 0) {
      return;
    }

    const sorter = node.getSorter();
    const offsetById = sorter.computeOffsets(this._treeSet, node, pass.extentsFor(sorter));
    const parentPosition = node.getPosition();

    children.forEach((child) => {
      const offset = offsetById.get(child.getId())!;
      pass.moveBranch(child, { x: parentPosition.x + offset.x, y: parentPosition.y + offset.y });
    });

    // Continue reordering the children nodes
    children.forEach((child) => {
      this.layoutChildren(child, pass);
    });
  }

  static TREE_SORTER = new TreeSorter();
}

export default TreeLayout;
