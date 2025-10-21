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
import AbstractBasicSorter from './AbstractBasicSorter';
import RootedTreeSet from './RootedTreeSet';
import Node from './Node';
import PositionType from '../PositionType';

class TreeSorter extends AbstractBasicSorter {
  private static INTERNODE_VERTICAL_PADDING = 70; // Increased spacing between parent and child (5x the original 14)

  private static INTERNODE_HORIZONTAL_PADDING = 5; // Very compact horizontal spacing (75% reduction)

  predict(
    graph: RootedTreeSet,
    parent: Node,
    node: Node | null,
    position: PositionType | null,
  ): [number, PositionType] {
    // If node is being added (not dragged)
    if (!node) {
      const parentChildren = graph.getChildren(parent);
      const order = parentChildren.length;

      const result = {
        x: parent.getPosition().x,
        y: parent.getPosition().y + parent.getSize().height + TreeSorter.INTERNODE_VERTICAL_PADDING,
      };
      return [order, result];
    }

    // If position not provided, keep current position
    if (!position) {
      return [node.getOrder(), node.getPosition()];
    }

    // Node is being dragged - determine order based on horizontal position
    const parentChildren = graph.getChildren(parent).filter((child) => child !== node);

    if (parentChildren.length === 0) {
      const result = {
        x: parent.getPosition().x,
        y: parent.getPosition().y + parent.getSize().height + TreeSorter.INTERNODE_VERTICAL_PADDING,
      };
      return [0, result];
    }

    // Find position in order based on X coordinate
    let order = 0;
    for (let i = 0; i < parentChildren.length; i++) {
      const child = parentChildren[i];
      if (position.x > child.getPosition().x) {
        order = child.getOrder() + 1;
      }
    }

    // Calculate Y position (all children at same level)
    const yPos =
      parent.getPosition().y + parent.getSize().height + TreeSorter.INTERNODE_VERTICAL_PADDING;

    // Calculate X position - between siblings or at edges
    let xPos: number;
    if (order === 0 && parentChildren.length > 0) {
      // Before first child
      const firstChild = parentChildren[0];
      xPos =
        firstChild.getPosition().x -
        firstChild.getSize().width / 2 -
        TreeSorter.INTERNODE_HORIZONTAL_PADDING;
    } else if (order >= parentChildren.length) {
      // After last child
      const lastChild = parentChildren[parentChildren.length - 1];
      xPos =
        lastChild.getPosition().x +
        lastChild.getSize().width / 2 +
        TreeSorter.INTERNODE_HORIZONTAL_PADDING;
    } else {
      // Between two children
      const prevChild = parentChildren[order - 1];
      const nextChild = parentChildren[order];
      xPos = (prevChild.getPosition().x + nextChild.getPosition().x) / 2;
    }

    return [order, { x: xPos, y: yPos }];
  }

  insert(treeSet: RootedTreeSet, parent: Node, child: Node, order: number): void {
    const children = this._getSortedChildren(treeSet, parent);
    $assert(
      order <= children.length,
      `Order must be continuous and can not have holes. Order:${order}`,
    );

    // Shift all elements after insertion point
    for (let i = order; i < children.length; i++) {
      const node = children[i];
      node.setOrder(i + 1);
    }
    child.setOrder(order);
  }

  detach(treeSet: RootedTreeSet, node: Node): void {
    const parent = treeSet.getParent(node);
    $assert(parent != null, 'cannot detach node with null parent');
    const children = this._getSortedChildren(treeSet, parent!);
    const order = node.getOrder();
    $assert(children[order] === node, 'Node seems not to be in the right position');

    // Shift all nodes after the removed node
    for (let i = node.getOrder() + 1; i < children.length; i++) {
      const child = children[i];
      child.setOrder(child.getOrder() - 1);
    }
    node.setOrder(0);
  }

  computeOffsets(treeSet: RootedTreeSet, node: Node): Map<number, PositionType> {
    const children = this._getSortedChildren(treeSet, node);

    // Filter out any stale references to deleted nodes
    const validChildren = children.filter((child) => {
      const exists = treeSet.find(child.getId(), false);
      if (!exists) {
        console.warn(
          `[TreeSorter] Stale child reference detected: node ${child.getId()} in parent ${node.getId()}'s children but not in tree. Skipping.`,
        );
      }
      return exists !== null;
    });

    // Calculate total width needed for all children
    const childrenWidths = validChildren.map((child) => ({
      id: child.getId(),
      order: child.getOrder(),
      width: this._computeChildrenWidth(treeSet, child),
      height: child.getSize().height,
    }));

    const totalWidth = childrenWidths.map((c) => c.width).reduce((acc, width) => acc + width, 0);

    // Start from the left, centering all children under parent
    let xOffset = -totalWidth / 2;

    const result = new Map<number, PositionType>();
    for (let i = 0; i < childrenWidths.length; i++) {
      const childData = childrenWidths[i];

      // X offset: position horizontally
      xOffset += childData.width / 2;

      // Y offset: fixed distance below parent
      const yOffset =
        node.getSize().height / 2 + TreeSorter.INTERNODE_VERTICAL_PADDING + childData.height / 2;

      result.set(childData.id, { x: xOffset, y: yOffset });

      // Move to next position
      xOffset += childData.width / 2;
    }

    return result;
  }

  private _computeChildrenWidth(
    treeSet: RootedTreeSet,
    node: Node,
    widthCache?: Map<number, number>,
  ): number {
    // Include horizontal padding
    const nodeWidth = node.getSize().width + TreeSorter.INTERNODE_HORIZONTAL_PADDING * 2;

    let result: number;
    const children = treeSet.getChildren(node);

    if (children.length === 0 || node.areChildrenShrunken()) {
      result = nodeWidth;
    } else {
      // Sum of all children widths
      const childrenWidth = children
        .map((child) => this._computeChildrenWidth(treeSet, child, widthCache))
        .reduce((acc, width) => acc + width, 0);

      // Use the larger of node width or children width
      result = Math.max(nodeWidth, childrenWidth);
    }

    if (widthCache) {
      widthCache.set(node.getId(), result);
    }

    return result;
  }

  verify(treeSet: RootedTreeSet, node: Node): void {
    // Check that all orders are consistent
    const children = this._getSortedChildren(treeSet, node);

    for (let i = 0; i < children.length; i++) {
      $assert(children[i].getOrder() === i, 'missing order elements');
    }
  }

  getChildDirection(_treeSet: RootedTreeSet, _child: Node): 1 | -1 {
    // In tree layout, all children go down (positive Y direction)
    // Return 1 for consistency with interface
    return 1;
  }

  toString(): string {
    return 'Tree Sorter';
  }

  getVerticalPadding(): number {
    return TreeSorter.INTERNODE_VERTICAL_PADDING;
  }
}

export default TreeSorter;
