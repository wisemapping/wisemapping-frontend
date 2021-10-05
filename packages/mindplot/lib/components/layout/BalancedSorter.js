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
const AbstractBasicSorter = require('./AbstractBasicSorter').default;

const BalancedSorter = new Class(
  /** @lends BalancedSorter */ {
    Extends: AbstractBasicSorter,
    /**
         * @constructs
         * @extends mindplot.layout.AbstractBasicSorter
         */
    initialize() {},

    /**
         * @param {} graph
         * @param {} parent
         * @param {} node
         * @param {} position
         * @param {Boolean} free
         * @return an array with order and position
         */
    predict(graph, parent, node, position, free) {
      // If its a free node...
      if (free) {
        $assert(
          $defined(position),
          'position cannot be null for predict in free positioning',
        );
        $assert($defined(node), 'node cannot be null for predict in free positioning');

        var rootNode = graph.getRootNode(parent);
        var direction = this._getRelativeDirection(
          rootNode.getPosition(),
          node.getPosition(),
        );

        const limitXPos = parent.getPosition().x
                    + direction
                        * (parent.getSize().width / 2
                            + node.getSize().width / 2
                            + BalancedSorter.INTERNODE_HORIZONTAL_PADDING);

        const xPos = direction > 0
          ? position.x >= limitXPos
            ? position.x
            : limitXPos
          : position.x <= limitXPos
            ? position.x
            : limitXPos;

        return [0, { x: xPos, y: position.y }];
      }

      var rootNode = graph.getRootNode(parent);

      // If it is a dragged node...
      if (node) {
        $assert($defined(position), 'position cannot be null for predict in dragging');
        const nodeDirection = this._getRelativeDirection(
          rootNode.getPosition(),
          node.getPosition(),
        );
        const positionDirection = this._getRelativeDirection(
          rootNode.getPosition(),
          position,
        );
        const siblings = graph.getSiblings(node);

        const sameParent = parent == graph.getParent(node);
        if (siblings.length == 0 && nodeDirection == positionDirection && sameParent) {
          return [node.getOrder(), node.getPosition()];
        }
      }

      if (!position) {
        var right = this._getChildrenForOrder(parent, graph, 0);
        var left = this._getChildrenForOrder(parent, graph, 1);
      }
      // Filter nodes on one side..
      const order = position
        ? position.x > rootNode.getPosition().x
          ? 0
          : 1
        : right.length - left.length > 0
          ? 1
          : 0;
      var direction = order % 2 == 0 ? 1 : -1;

      // Exclude the dragged node (if set)
      const children = this._getChildrenForOrder(parent, graph, order).filter((child) => child != node);

      // No children?
      if (children.length == 0) {
        return [
          order,
          {
            x:
                            parent.getPosition().x
                            + direction
                                * (parent.getSize().width / 2
                                    + BalancedSorter.INTERNODE_HORIZONTAL_PADDING * 2),
            y: parent.getPosition().y,
          },
        ];
      }

      // Try to fit within ...
      let result = null;
      const last = children.getLast();
      position = position || { x: last.getPosition().x, y: last.getPosition().y + 1 };
      _.each(children, (child, index) => {
        const cpos = child.getPosition();
        if (position.y > cpos.y) {
          const yOffset = child == last
            ? child.getSize().height + BalancedSorter.INTERNODE_VERTICAL_PADDING * 2
            : (children[index + 1].getPosition().y - child.getPosition().y) / 2;
          result = [child.getOrder() + 2, { x: cpos.x, y: cpos.y + yOffset }];
        }
      });

      // Position wasn't below any node, so it must be inserted above
      if (!result) {
        const first = children[0];
        result = [
          position.x > 0 ? 0 : 1,
          {
            x: first.getPosition().x,
            y:
                            first.getPosition().y
                            - first.getSize().height
                            - BalancedSorter.INTERNODE_VERTICAL_PADDING * 2,
          },
        ];
      }

      return result;
    },

    /**
         * @param {} treeSet
         * @param {} parent
         * @param {} child
         * @param {} order
         */
    insert(treeSet, parent, child, order) {
      const children = this._getChildrenForOrder(parent, treeSet, order);

      // If no children, return 0 or 1 depending on the side
      if (children.length == 0) {
        child.setOrder(order % 2);
        return;
      }

      // Shift all the elements by two, so side is the same.
      // In case of balanced sorter, order don't need to be continuous...
      let max = 0;
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        max = Math.max(max, node.getOrder());
        if (node.getOrder() >= order) {
          max = Math.max(max, node.getOrder() + 2);
          node.setOrder(node.getOrder() + 2);
        }
      }

      const newOrder = order > max + 1 ? max + 2 : order;
      child.setOrder(newOrder);
    },

    /**
         * @param {} treeSet
         * @param {} node
         */
    detach(treeSet, node) {
      const parent = treeSet.getParent(node);
      // Filter nodes on one side..
      const children = this._getChildrenForOrder(parent, treeSet, node.getOrder());

      _.each(children, (child, index) => {
        if (child.getOrder() > node.getOrder()) {
          child.setOrder(child.getOrder() - 2);
        }
      });
      node.setOrder(node.getOrder() % 2 == 0 ? 0 : 1);
    },

    /**
         * @param {} treeSet
         * @param {} node
         * @return offsets
         */
    computeOffsets(treeSet, node) {
      $assert(treeSet, 'treeSet can no be null.');
      $assert(node, 'node can no be null.');

      const children = this._getSortedChildren(treeSet, node);

      // Compute heights ...
      const heights = children
        .map(function (child) {
          return {
            id: child.getId(),
            order: child.getOrder(),
            width: child.getSize().width,
            height: this._computeChildrenHeight(treeSet, child),
          };
        }, this)
        .reverse();

      // Compute the center of the branch ...
      let totalPHeight = 0;
      let totalNHeight = 0;

      _.each(heights, (elem) => {
        if (elem.order % 2 == 0) {
          totalPHeight += elem.height;
        } else {
          totalNHeight += elem.height;
        }
      });
      let psum = totalPHeight / 2;
      let nsum = totalNHeight / 2;
      let ysum = 0;

      // Calculate the offsets ...
      const result = {};
      for (let i = 0; i < heights.length; i++) {
        const direction = heights[i].order % 2 ? -1 : 1;

        if (direction > 0) {
          psum -= heights[i].height;
          ysum = psum;
        } else {
          nsum -= heights[i].height;
          ysum = nsum;
        }

        const yOffset = ysum + heights[i].height / 2;
        const xOffset = direction
                    * (node.getSize().width / 2
                        + heights[i].width / 2
                        + +BalancedSorter.INTERNODE_HORIZONTAL_PADDING);

        $assert(!isNaN(xOffset), 'xOffset can not be null');
        $assert(!isNaN(yOffset), 'yOffset can not be null');

        result[heights[i].id] = { x: xOffset, y: yOffset };
      }
      return result;
    },

    /**
         * @param {} treeSet
         * @param {} node
         * @throw will throw an error if order elements are missing
         */
    verify(treeSet, node) {
      // Check that all is consistent ...
      const children = this._getChildrenForOrder(node, treeSet, node.getOrder());

      // All odd ordered nodes should be "continuous" by themselves
      // All even numbered nodes should be "continuous" by themselves
      const factor = node.getOrder() % 2 == 0 ? 2 : 1;
      for (let i = 0; i < children.length; i++) {
        const order = i == 0 && factor == 1 ? 1 : factor * i;
        $assert(
          children[i].getOrder() == order,
          `Missing order elements. Missing order: ${
            i * factor
          }. Parent:${
            node.getId()
          },Node:${
            children[i].getId()}`,
        );
      }
    },

    /**
         * @param {} treeSet
         * @param {} child
         * @return the direction of the child within the treeSet
         */
    getChildDirection(treeSet, child) {
      return child.getOrder() % 2 == 0 ? 1 : -1;
    },

    /**
         * @return {String} the print name of this class
         */
    toString() {
      return 'Balanced Sorter';
    },

    _getChildrenForOrder(parent, graph, order) {
      return this._getSortedChildren(graph, parent).filter((child) => child.getOrder() % 2 == order % 2);
    },

    _getVerticalPadding() {
      return BalancedSorter.INTERNODE_VERTICAL_PADDING;
    },
  },
);

/**
 * @constant
 * @type {Number}
 * @default
 */
BalancedSorter.INTERNODE_VERTICAL_PADDING = 5;
/**
 * @constant
 * @type {Number}
 * @default
 */
BalancedSorter.INTERNODE_HORIZONTAL_PADDING = 30;

export default BalancedSorter;
