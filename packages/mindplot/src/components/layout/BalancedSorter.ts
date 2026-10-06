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
import PositionType from '../PositionType';
import AbstractBasicSorter from './AbstractBasicSorter';
import type { SorterPrediction } from './ChildrenSorterStrategy';
import Node from './Node';
import RootedTreeSet from './RootedTreeSet';
import { sideOf } from '../util/side';

class BalancedSorter extends AbstractBasicSorter {
  private static INTERNODE_VERTICAL_PADDING = 5;

  private static INTERNODE_HORIZONTAL_PADDING = 30;

  predict(
    graph: RootedTreeSet,
    parent: Node,
    node: Node | null,
    position: PositionType | null,
  ): SorterPrediction {
    const rootNode = graph.getRootNode(parent);

    // If it is a dragged node...
    if (node) {
      $assert(position != null, 'position cannot be null for predict in dragging');
      const nodeDirection = this._getRelativeDirection(rootNode.getPosition(), node.getPosition());
      const positionDirection = this._getRelativeDirection(rootNode.getPosition(), position);
      const siblings = graph.getSiblings(node);

      const sameParent = parent === graph.getParent(node);
      if (siblings.length === 0 && nodeDirection === positionDirection && sameParent) {
        return { order: node.getOrder() ?? 0, position: node.getPosition() };
      }
    }

    // Find the order ...
    let order: number;
    if (!position) {
      const right = this._getChildrenForOrder(parent, graph, 0);
      const left = this._getChildrenForOrder(parent, graph, 1);
      order = right.length - left.length > 0 ? 1 : 0;
    } else {
      // Same rule as _getRelativeDirection above: the root's own x is the right side.
      order = sideOf(position.x, rootNode.getPosition().x) > 0 ? 0 : 1;
    }

    const direction = order % 2 === 0 ? 1 : -1;

    // Exclude the dragged node (if set)
    const children = this._getChildrenForOrder(parent, graph, order).filter(
      (child) => child !== node,
    );

    // No children?
    const first = children[0];
    const last = children[children.length - 1];
    if (!first || !last) {
      return {
        order,
        position: {
          x:
            parent.getPosition().x +
            direction *
              (parent.getSize().width / 2 + BalancedSorter.INTERNODE_HORIZONTAL_PADDING * 2),
          y: parent.getPosition().y,
        },
      };
    }

    // Order of the dragged node among these children, if it is one of them. Detaching it
    // shifts the later siblings on its own side up by two (see detach) ...
    const nodeOrder = node && graph.getParent(node) === parent ? node.getOrder() : undefined;

    // Try to fit within ...
    let result: SorterPrediction | null = null;
    const newestPosition = position || { x: last.getPosition().x, y: last.getPosition().y + 1 };
    children.forEach((child, index) => {
      const cpos = child.getPosition();
      if (newestPosition.y > cpos.y) {
        // After the last child: half a gap below it when dragging, as between two children. A new
        // child (no position) still goes where the next child would sit.
        let yOffset: number;
        const next = children[index + 1];
        if (next) {
          yOffset = (next.getPosition().y - child.getPosition().y) / 2;
        } else if (position) {
          yOffset = this._halfSiblingGap(children, index);
        } else {
          yOffset = child.getSize().height + BalancedSorter.INTERNODE_VERTICAL_PADDING * 2;
        }
        const childOrder = child.getOrder() ?? 0;
        const shifted =
          nodeOrder !== undefined && nodeOrder % 2 === childOrder % 2 && childOrder > nodeOrder;
        result = {
          order: shifted ? childOrder : childOrder + 2,
          position: { x: cpos.x, y: cpos.y + yOffset },
        };
      }
    });

    // Position wasn't below any node, so it must be inserted above. On the side
    // computed above (against the root, not the origin), which `children` are from.
    if (!result) {
      result = {
        order,
        position: {
          x: first.getPosition().x,
          // Half a gap above it, as between two children.
          y: first.getPosition().y - this._halfSiblingGap(children, 0),
        },
      };
    }

    return result;
  }

  insert(treeSet: RootedTreeSet, parent: Node, child: Node, order: number) {
    const children = this._getChildrenForOrder(parent, treeSet, order);

    // If no children, return 0 or 1 depending on the side
    if (children.length === 0) {
      child.setOrder(order % 2);
      return;
    }

    // Shift all the elements by two, so side is the same.
    // In case of balanced sorter, order don't need to be continuous...
    let max = 0;
    children.forEach((node) => {
      const nodeOrder = node.getOrder();
      if (nodeOrder !== undefined) {
        max = Math.max(max, nodeOrder);
        if (nodeOrder >= order) {
          max = Math.max(max, nodeOrder + 2);
          node.setOrder(nodeOrder + 2);
        }
      }
    });

    const newOrder = order > max + 1 ? max + 2 : order;
    child.setOrder(newOrder);
  }

  detach(treeSet: RootedTreeSet, node: Node): void {
    const parent = treeSet.getParent(node);
    if (parent) {
      const nodeOrder = node.getOrder() ?? 0;
      // Filter nodes on one side..
      const children = this._getChildrenForOrder(parent, treeSet, nodeOrder);

      children.forEach((child) => {
        const childOrder = child.getOrder();
        if (childOrder !== undefined && childOrder > nodeOrder) {
          child.setOrder(childOrder - 2);
        }
      });
      node.setOrder(nodeOrder % 2 === 0 ? 0 : 1);
    }
  }

  computeOffsets(
    treeSet: RootedTreeSet,
    node: Node,
    extentById?: Map<number, number>,
  ): Map<number, PositionType> {
    $assert(treeSet, 'treeSet can no be null.');
    $assert(node, 'node can no be null.');

    const children = this._getSortedChildren(treeSet, node);

    // Compute heights ...
    const heights = children
      .map((child) => ({
        id: child.getId(),
        order: child.getOrder() ?? 0,
        width: child.getSize().width,
        height: this._getBranchHeight(treeSet, child, extentById),
      }))
      .reverse();

    // Compute the center of the branch ...
    let totalPHeight = 0;
    let totalNHeight = 0;

    heights.forEach((elem) => {
      if (elem.order % 2 === 0) {
        totalPHeight += elem.height;
      } else {
        totalNHeight += elem.height;
      }
    });
    let psum = totalPHeight / 2;
    let nsum = totalNHeight / 2;
    let ysum = 0;

    // Calculate the offsets ...
    const result = new Map<number, PositionType>();
    heights.forEach((height) => {
      const direction = height.order % 2 ? -1 : 1;

      if (direction > 0) {
        psum -= height.height;
        ysum = psum;
      } else {
        nsum -= height.height;
        ysum = nsum;
      }

      const yOffset = ysum + height.height / 2;
      const xOffset =
        direction *
        (node.getSize().width / 2 +
          height.width / 2 +
          +BalancedSorter.INTERNODE_HORIZONTAL_PADDING);

      $assert(!Number.isNaN(xOffset), 'xOffset can not be null');
      $assert(!Number.isNaN(yOffset), 'yOffset can not be null');

      result.set(height.id, { x: xOffset, y: yOffset });
    });
    return result;
  }

  verify(treeSet: RootedTreeSet, node: Node): void {
    // Check that all is consistent ...
    // All even ordered nodes (right side) should be "continuous" by themselves: 0, 2, 4 ...
    // All odd ordered nodes (left side) should be "continuous" by themselves: 1, 3, 5 ...
    [0, 1].forEach((side) => {
      const children = this._getChildrenForOrder(node, treeSet, side);
      children.forEach((child, i) => {
        const order = 2 * i + side;
        const childOrder = child.getOrder() ?? 0;
        $assert(
          childOrder === order,
          `Missing order elements. Missing order: ${order}. Parent:${node.getId()},Node:${child.getId()}`,
        );
      });
    });
  }

  getChildDirection(treeSet: RootedTreeSet, child: Node): 1 | -1 {
    return (child.getOrder() ?? 0) % 2 === 0 ? 1 : -1;
  }

  override getOrderAfter(order: number): number {
    // The order parity is the side, so the next slot on the same side is two away.
    return order + 2;
  }

  /**
   * Spreads the new children over both sides, as adding them one by one would: each goes to
   * the side with fewer children (the right one on a tie, as predict does), after the
   * children already there.
   */
  override getOrdersForNewChildren(graph: RootedTreeSet, parent: Node, count: number): number[] {
    let right = this._getChildrenForOrder(parent, graph, 0).length;
    let left = this._getChildrenForOrder(parent, graph, 1).length;
    const orders: number[] = [];
    for (let i = 0; i < count; i++) {
      if (right - left > 0) {
        orders.push(left * 2 + 1);
        left++;
      } else {
        orders.push(right * 2);
        right++;
      }
    }
    return orders;
  }

  toString(): string {
    return 'Balanced Sorter';
  }

  _getChildrenForOrder(parent: Node, graph: RootedTreeSet, order: number): Node[] {
    return this._getSortedChildren(graph, parent).filter(
      (child) => (child.getOrder() ?? 0) % 2 === order % 2,
    );
  }

  override getVerticalPadding(): number {
    return BalancedSorter.INTERNODE_VERTICAL_PADDING;
  }
}

export default BalancedSorter;
