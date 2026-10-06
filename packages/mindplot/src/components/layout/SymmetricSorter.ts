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
import type { SorterPrediction } from './ChildrenSorterStrategy';
import RootedTreeSet from './RootedTreeSet';
import Node from './Node';
import PositionType from '../PositionType';
import { sideOf } from '../util/side';

class SymmetricSorter extends AbstractBasicSorter {
  /**
   * Predict the order and position of a dragged node.
   */
  predict(
    graph: RootedTreeSet,
    parent: Node,
    node: Node | null,
    position: PositionType | null,
  ): SorterPrediction {
    const self = this;
    const rootNode = graph.getRootNode(parent);

    // Its not a dragged node (it is being added)
    if (!node) {
      const parentDirection = self._getChildrenDirection(graph, parent);

      const result = {
        x:
          parent.getPosition().x +
          parentDirection * (parent.getSize().width + SymmetricSorter.INTERNODE_HORIZONTAL_PADDING),
        y: parent.getPosition().y,
      };
      return { order: graph.getChildren(parent).length, position: result };
    }

    // If it is a dragged node...
    $assert(position, 'position cannot be null for predict in dragging');
    const nodeDirection = this._getRelativeDirection(rootNode.getPosition(), node.getPosition());
    const positionDirection = this._getRelativeDirection(rootNode.getPosition(), position);
    const siblings = graph.getSiblings(node);

    // node has no siblings and its trying to reconnect to its own parent
    const sameParent = parent === graph.getParent(node);
    if (siblings.length === 0 && nodeDirection === positionDirection && sameParent) {
      return { order: node.getOrder() ?? 0, position: node.getPosition() };
    }

    // By order, top to bottom. A copy: the children array is in whatever order a layout last left.
    const parentChildren = [...graph.getChildren(parent)].sort(
      (a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0),
    );
    if (parentChildren.length === 0) {
      // Fit as a child of the parent node, on the side the layout puts its children, whatever
      // side the mouse is on ...
      const result = {
        x:
          parent.getPosition().x +
          this._getChildrenDirection(graph, parent) *
            (parent.getSize().width + SymmetricSorter.INTERNODE_HORIZONTAL_PADDING),
        y: parent.getPosition().y,
      };

      return { order: 0, position: result };
    }

    // Try to fit within ...
    const last = parentChildren[parentChildren.length - 1];
    for (let i = 0; i < parentChildren.length; i++) {
      const parentChild = parentChildren[i];
      const nodeAfter = parentChildren[i + 1];

      // Fit at the bottom
      if (!nodeAfter && position.y > parentChild.getPosition().y) {
        const lastOrderValue = last.getOrder() ?? 0;
        const order =
          graph.getParent(node) && graph.getParent(node)!.getId() === parent.getId()
            ? lastOrderValue
            : lastOrderValue + 1;

        // Half a gap below the last child, as between two children.
        const result = {
          x: parentChild.getPosition().x,
          y: parentChild.getPosition().y + this._halfSiblingGap(parentChildren, i),
        };
        return { order, position: result };
      }

      // Fit after this node. Exactly at the centre of the node after counts as the pixel above
      // it, as in BalancedSorter: excluding it fell through to "above the first", a jump.
      if (
        nodeAfter &&
        position.y > parentChild.getPosition().y &&
        position.y <= nodeAfter.getPosition().y
      ) {
        if (nodeAfter.getId() === node.getId() || parentChild.getId() === node.getId()) {
          return { order: node.getOrder() ?? 0, position: node.getPosition() };
        }
        // Moving down within the same parent: detaching the node first shifts the
        // siblings below it up by one, so the slot is one less than nodeAfter's order.
        // A node coming from another parent shifts nothing here.
        const orderResult =
          sameParent && position.y > node.getPosition().y
            ? (nodeAfter.getOrder() ?? 0) - 1
            : (parentChild.getOrder() ?? 0) + 1;

        const positionResult = {
          x: parentChild.getPosition().x,
          y:
            parentChild.getPosition().y +
            (nodeAfter.getPosition().y - parentChild.getPosition().y) / 2,
        };

        return { order: orderResult, position: positionResult };
      }
    }

    // Position wasn't below any node, so it must be fitted above the first
    const first = parentChildren[0];
    // ... half a gap above it, as between two children.
    const resultPosition = {
      x: first.getPosition().x,
      y: first.getPosition().y - this._halfSiblingGap(parentChildren, 0),
    };
    return { order: 0, position: resultPosition };
  }

  /**
   * @param treeSet
   * @param parent
   * @param child
   * @param order
   * @note If order has gaps/holes, logs error and recovers by adjusting to valid value
   */
  insert(treeSet: RootedTreeSet, parent: Node, child: Node, order: number): void {
    const children = this._getSortedChildren(treeSet, parent);

    // Validate and fix order if invalid
    let recovered = false;

    // Check for invalid order values
    if (!Number.isFinite(order) || order < 0) {
      console.error(
        '[SymmetricSorter] Invalid order value detected - attempting recovery.\n' +
          `  Child ID: ${child.getId()}\n` +
          `  Parent ID: ${parent.getId()}\n` +
          `  Invalid order: ${order} (${typeof order})\n` +
          `  Current children count: ${children.length}\n` +
          `  Recovering by adjusting order to: ${children.length}`,
      );
      order = children.length;
      recovered = true;
    } else if (order > children.length) {
      // Check for gaps/holes in sequence
      console.error(
        '[SymmetricSorter] Order discontinuity detected - attempting recovery.\n' +
          `  Child ID: ${child.getId()}\n` +
          `  Parent ID: ${parent.getId()}\n` +
          `  Requested order: ${order}\n` +
          `  Current children count: ${children.length}\n` +
          `  Max valid order: ${children.length}\n` +
          `  Existing children orders: [${children.map((c) => c.getOrder()).join(', ')}]\n` +
          `  Recovering by adjusting order to: ${children.length}`,
      );
      order = children.length;
      recovered = true;
    }

    // Check if existing children have discontinuous orders
    if (!recovered && children.length > 0) {
      const expectedOrders = children.map((_, idx) => idx);
      const actualOrders = children.map((c) => c.getOrder());
      const hasHoles = !expectedOrders.every((exp, idx) => exp === actualOrders[idx]);

      if (hasHoles) {
        console.error(
          '[SymmetricSorter] Existing children have discontinuous orders - repairing.\n' +
            `  Parent ID: ${parent.getId()}\n` +
            `  Expected orders: [${expectedOrders.join(', ')}]\n` +
            `  Actual orders: [${actualOrders.join(', ')}]\n` +
            '  Repairing by reassigning sequential orders...',
        );
        // Fix existing children orders
        children.forEach((c, idx) => c.setOrder(idx));
      }
    }

    // Shift all the elements in one .
    for (let i = order; i < children.length; i++) {
      const node = children[i];
      node.setOrder(i + 1);
    }
    child.setOrder(order);
  }

  /**
   * @param treeSet
   * @param node
   * @throws will throw an error if the node is in the wrong position */
  detach(treeSet: RootedTreeSet, node: Node) {
    const parent = treeSet.getParent(node);
    $assert(parent != null, 'can not detach null parent');
    const children = this._getSortedChildren(treeSet, parent);
    const order = node.getOrder();
    $assert(order !== undefined, 'Node must have an order to be detached');
    // TypeScript doesn't understand $assert narrows the type, so we use non-null assertion
    $assert(children[order] === node, 'Node seems not to be in the right position');

    // Shift all the nodes ...
    const nodeOrder = node.getOrder();
    if (nodeOrder !== undefined) {
      for (let i = nodeOrder + 1; i < children.length; i++) {
        const child = children[i];
        const childOrder = child.getOrder();
        if (childOrder !== undefined) {
          child.setOrder(childOrder - 1);
        }
      }
    }
    node.setOrder(0);
  }

  computeOffsets(
    treeSet: RootedTreeSet,
    node: Node,
    extentById?: Map<number, number>,
  ): Map<number, PositionType> {
    const children = this._getSortedChildren(treeSet, node);

    // Compute heights ...
    const sizeById = children
      .map((child) => ({
        id: child.getId(),
        node: child,
        order: child.getOrder(),
        position: child.getPosition(),
        width: child.getSize().width,
        height: this._getBranchHeight(treeSet, child, extentById),
      }))
      .reverse();

    // Compute the center of the branch ...
    const totalHeight = sizeById
      .map((e) => e.height)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    let ysum = totalHeight / 2;

    // Calculate the offsets ...
    const result = new Map<number, PositionType>();
    for (let i = 0; i < sizeById.length; i++) {
      ysum -= sizeById[i].height;
      const childNode = sizeById[i].node;
      const direction = this.getChildDirection(treeSet, childNode);

      const yOffset = ysum + sizeById[i].height / 2;
      const xOffset =
        direction *
        (sizeById[i].width / 2 +
          node.getSize().width / 2 +
          SymmetricSorter.INTERNODE_HORIZONTAL_PADDING);

      result.set(sizeById[i].id, { x: xOffset, y: yOffset });
    }
    return result;
  }

  /**
   * @param treeSet
   * @param node
   * @throws will throw an error if order elements are missing
   */
  verify(treeSet: RootedTreeSet, node: Node) {
    // Check that all is consistent ...
    const children = this._getSortedChildren(treeSet, node);

    for (let i = 0; i < children.length; i++) {
      $assert(children[i].getOrder() === i, 'missing order elements');
    }
  }

  /**
   * @param treeSet
   * @param child
   * @return direction of the given child from its parent or from the root node, if isolated */
  getChildDirection(treeSet: RootedTreeSet, child: Node): 1 | -1 {
    $assert(treeSet, 'treeSet can no be null.');
    $assert(treeSet.getParent(child), 'This should not happen');

    let result: 1 | -1;
    const rootNode = treeSet.getRootNode(child);
    if (treeSet.getParent(child) === rootNode) {
      // This is the case of a isolated child ... In this case, the directions is based on the root.
      // Not Math.sign: it is 0 for a root at x === 0, which stacked its children on top of it.
      result = sideOf(rootNode.getPosition().x);
    } else {
      // if this is not the case, honor the direction of the parent ...
      const parent = treeSet.getParent(child)!;
      const grandParent = treeSet.getParent(parent)!;
      const sorter = grandParent.getSorter();
      result = sorter.getChildDirection(treeSet, parent);
    }
    return result;
  }

  /**
   * The side the layout puts the children of the given node on, as getChildDirection works it
   * out for them. It does not need a child, so it also answers for a node that has none yet.
   */
  private _getChildrenDirection(treeSet: RootedTreeSet, parent: Node): 1 | -1 {
    const rootNode = treeSet.getRootNode(parent);
    if (parent === rootNode) {
      // The children of an isolated root go to the side of the map the root is on. Compared with
      // itself, the root would always say "right".
      return sideOf(rootNode.getPosition().x);
    }
    const grandParent = treeSet.getParent(parent)!;
    return grandParent.getSorter().getChildDirection(treeSet, parent);
  }

  /** @return {String} the print name of this class */
  toString(): string {
    return 'Symmetric Sorter';
  }

  override getVerticalPadding() {
    return SymmetricSorter.INTERNODE_VERTICAL_PADDING;
  }

  static INTERNODE_VERTICAL_PADDING = 5;

  static INTERNODE_HORIZONTAL_PADDING = 30;
}

export default SymmetricSorter;
