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

const RootedTreeSet = new Class(
  /** @lends RootedTreeSet */ {
    /** @constructs */
    initialize() {
      this._rootNodes = [];
    },

    /**
         * @param root
         * @throws will throw an error if root is null or undefined
         */
    setRoot(root) {
      $assert(root, 'root can not be null');
      this._rootNodes.push(this._decodate(root));
    },

    /** getter */
    getTreeRoots() {
      return this._rootNodes;
    },

    _decodate(node) {
      node._children = [];
      return node;
    },

    /**
         * @param {mindplot.model.NodeModel} node
         * @throws will throw an error if node is null or undefined
         * @throws will throw an error if node with id already exists
         * @throws will throw an error if node has been added already
         */
    add(node) {
      $assert(node, 'node can not be null');
      $assert(
        !this.find(node.getId(), false),
        `node already exits with this id. Id:${node.getId()}`,
      );
      $assert(!node._children, 'node already added');
      this._rootNodes.push(this._decodate(node));
    },

    /**
         * @param nodeId
         * @throws will throw an error if nodeId is null or undefined
         */
    remove(nodeId) {
      $assert($defined(nodeId), 'nodeId can not be null');
      const node = this.find(nodeId);
      this._rootNodes.erase(node);
    },

    /**
         * @param parentId
         * @param childId
         * @throws will throw an error if parentId is null or undefined
         * @throws will throw an error if childId is null or undefined
         * @throws will throw an error if node with id childId is already a child of parent
         */
    connect(parentId, childId) {
      $assert($defined(parentId), 'parent can not be null');
      $assert($defined(childId), 'child can not be null');

      const parent = this.find(parentId);
      const child = this.find(childId, true);
      $assert(
        !child._parent,
        `node already connected. Id:${child.getId()},previous:${child._parent}`,
      );

      parent._children.push(child);
      child._parent = parent;
      this._rootNodes.erase(child);
    },

    /**
         * @param nodeId
         * @throws will throw an error if nodeId is null or undefined
         * @throws will throw an error if node is not connected
         */
    disconnect(nodeId) {
      $assert($defined(nodeId), 'nodeId can not be null');
      const node = this.find(nodeId);
      $assert(node._parent, 'Node is not connected');

      node._parent._children.erase(node);
      this._rootNodes.push(node);
      node._parent = null;
    },

    /**
         * @param id
         * @param validate
         * @throws will throw an error if id is null or undefined
         * @throws will throw an error if node cannot be found
         * @return node
         */
    find(id, validate) {
      $assert($defined(id), 'id can not be null');

      const graphs = this._rootNodes;
      let result = null;
      for (let i = 0; i < graphs.length; i++) {
        const node = graphs[i];
        result = this._find(id, node);
        if (result) {
          break;
        }
      }
      validate = !$defined(validate) ? true : validate;
      $assert(
        validate ? result : true,
        `node could not be found id:${id}\n,RootedTreeSet${this.dump()}`,
      );
      return result;
    },

    _find(id, parent) {
      if (parent.getId() == id) {
        return parent;
      }

      let result = null;
      const children = parent._children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        result = this._find(id, child);
        if (result) break;
      }

      return result;
    },

    /**
         * @param node
         * @throws will throw an error if nodeId is null or undefined
         * @return children
         */
    getChildren(node) {
      $assert(node, 'node cannot be null');
      return node._children;
    },

    /**
         * @param node
         * @throws will throw an error if node is null or undefined
         * @return root node or the provided node, if it has no parent
         */
    getRootNode(node) {
      $assert(node, 'node cannot be null');
      const parent = this.getParent(node);
      if ($defined(parent)) {
        return this.getRootNode(parent);
      }

      return node;
    },

    /**
         * @param node
         * @throws will throw an error if node is null or undefined
         * @return {Array} ancestors */
    getAncestors(node) {
      $assert(node, 'node cannot be null');
      return this._getAncestors(this.getParent(node), []);
    },

    _getAncestors(node, ancestors) {
      const result = ancestors;
      if (node) {
        result.push(node);
        this._getAncestors(this.getParent(node), result);
      }
      return result;
    },

    /**
         * @param node
         * @throws will throw an error if node is null or undefined
         * @return {Array} siblings
         */
    getSiblings(node) {
      $assert(node, 'node cannot be null');
      if (!$defined(node._parent)) {
        return [];
      }
      const siblings = node._parent._children.filter((child) => child != node);
      return siblings;
    },

    /**
         * @param node
         * @throws will throw an error if node is null or undefined
         * @return {Boolean} whether the node has a single path to a single leaf (no branching)
         */
    hasSinglePathToSingleLeaf(node) {
      $assert(node, 'node cannot be null');
      return this._hasSinglePathToSingleLeaf(node);
    },

    _hasSinglePathToSingleLeaf(node) {
      const children = this.getChildren(node);

      if (children.length == 1) {
        return this._hasSinglePathToSingleLeaf(children[0]);
      }

      return children.length == 0;
    },

    /**
         * @param node
         * @return {Boolean} whether the node is the start of a subbranch */
    isStartOfSubBranch(node) {
      return this.getSiblings(node).length > 0 && this.getChildren(node).length == 1;
    },

    /**
         * @param node
         * @throws will throw an error if node is null or undefined
         * @return {Boolean} whether the node is a leaf
         */
    isLeaf(node) {
      $assert(node, 'node cannot be null');
      return this.getChildren(node).length == 0;
    },

    /**
         * @param node
         * @throws will throw an error if node is null or undefined
         * @return parent
         */
    getParent(node) {
      $assert(node, 'node cannot be null');
      return node._parent;
    },

    /**
         * @return result
         */
    dump() {
      const branches = this._rootNodes;
      let result = '';
      for (let i = 0; i < branches.length; i++) {
        const branch = branches[i];
        result += this._dump(branch, '');
      }
      return result;
    },

    _dump(node, indent) {
      let result = `${indent + node}\n`;
      const children = this.getChildren(node);
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        result += this._dump(child, `${indent}   `);
      }

      return result;
    },

    /**
         * @param canvas
         */
    plot(canvas) {
      const branches = this._rootNodes;
      for (let i = 0; i < branches.length; i++) {
        const branch = branches[i];
        this._plot(canvas, branch);
      }
    },

    _plot(canvas, node, root) {
      const children = this.getChildren(node);
      const cx = node.getPosition().x + canvas.width / 2 - node.getSize().width / 2;
      const cy = node.getPosition().y + canvas.height / 2 - node.getSize().height / 2;
      const rect = canvas.rect(cx, cy, node.getSize().width, node.getSize().height);
      const order = node.getOrder() == null ? 'r' : node.getOrder();
      const text = canvas.text(
        node.getPosition().x + canvas.width / 2,
        node.getPosition().y + canvas.height / 2,
        `${node.getId()}[${order}]`,
      );
      text.attr('fill', '#FFF');
      const fillColor = this._rootNodes.contains(node)
        ? '#000'
        : node.isFree()
          ? '#abc'
          : '#c00';
      rect.attr('fill', fillColor);

      const rectPosition = {
        x: rect.attr('x') - canvas.width / 2 + rect.attr('width') / 2,
        y: rect.attr('y') - canvas.height / 2 + rect.attr('height') / 2,
      };
      const rectSize = { width: rect.attr('width'), height: rect.attr('height') };
      rect.click(() => {
        console.log(
          `[id:${
            node.getId()
          }, order:${
            node.getOrder()
          }, position:(${
            rectPosition.x
          },${
            rectPosition.y
          }), size:${
            rectSize.width
          }x${
            rectSize.height
          }, freeDisplacement:(${
            node.getFreeDisplacement().x
          },${
            node.getFreeDisplacement().y
          })]`,
        );
      });
      text.click(() => {
        console.log(
          `[id:${
            node.getId()
          }, order:${
            node.getOrder()
          }, position:(${
            rectPosition.x
          },${
            rectPosition.y
          }), size:${
            rectSize.width
          }x${
            rectSize.height
          }, freeDisplacement:(${
            node.getFreeDisplacement().x
          },${
            node.getFreeDisplacement().y
          })]`,
        );
      });

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        this._plot(canvas, child);
      }
    },

    /**
         * @param node
         * @param position
         */
    updateBranchPosition(node, position) {
      const oldPos = node.getPosition();
      node.setPosition(position);

      const xOffset = oldPos.x - position.x;
      const yOffset = oldPos.y - position.y;

      const children = this.getChildren(node);
      const me = this;
      _.each(children, (child) => {
        me.shiftBranchPosition(child, xOffset, yOffset);
      });
    },

    /**
         * @param node
         * @param xOffset
         * @param yOffset
         */
    shiftBranchPosition(node, xOffset, yOffset) {
      const position = node.getPosition();
      node.setPosition({ x: position.x + xOffset, y: position.y + yOffset });

      const children = this.getChildren(node);
      const me = this;
      _.each(children, (child) => {
        me.shiftBranchPosition(child, xOffset, yOffset);
      });
    },

    /**
         * @param node
         * @param yOffset
         * @return siblings in the offset (vertical) direction, i.e. with lower or higher order, respectively
         */
    getSiblingsInVerticalDirection(node, yOffset) {
      // siblings with lower or higher order, depending on the direction of the offset and on the same side as their parent
      const parent = this.getParent(node);
      const siblings = this.getSiblings(node).filter((sibling) => {
        const sameSide = node.getPosition().x > parent.getPosition().x
          ? sibling.getPosition().x > parent.getPosition().x
          : sibling.getPosition().x < parent.getPosition().x;
        const orderOK = yOffset < 0
          ? sibling.getOrder() < node.getOrder()
          : sibling.getOrder() > node.getOrder();
        return orderOK && sameSide;
      });

      if (yOffset < 0) {
        siblings.reverse();
      }

      return siblings;
    },

    /**
         * @param node
         * @param yOffset
         * @return branches of the root node on the same side as the given node's, in the given
         * vertical direction
         */
    getBranchesInVerticalDirection(node, yOffset) {
      // direct descendants of the root that do not contain the node and are on the same side
      // and on the direction of the offset
      const rootNode = this.getRootNode(node);
      const branches = this.getChildren(rootNode).filter(function (child) {
        return this._find(node.getId(), child);
      }, this);

      const branch = branches[0];
      const rootDescendants = this.getSiblings(branch).filter((sibling) => {
        const sameSide = node.getPosition().x > rootNode.getPosition().x
          ? sibling.getPosition().x > rootNode.getPosition().x
          : sibling.getPosition().x < rootNode.getPosition().x;
        const sameDirection = yOffset < 0
          ? sibling.getOrder() < branch.getOrder()
          : sibling.getOrder() > branch.getOrder();
        return sameSide && sameDirection;
      }, this);

      return rootDescendants;
    },
  },
);

export default RootedTreeSet;
