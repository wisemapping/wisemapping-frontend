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
import Node from './Node';

class RootedTreeSet {
  private _rootNodes: Node[];

  protected _children!: Node[];

  constructor() {
    this._rootNodes = [];
  }

  setRoot(root: Node) {
    this._rootNodes.push(this._decodate(root));
  }

  getTreeRoots(): Node[] {
    return this._rootNodes;
  }

  _decodate(node: Node): Node {
    node._children = [];
    return node;
  }

  add(node: Node) {
    if (this.find(node.getId(), false)) {
      throw new Error(`node already exits with this id. Id:${node.getId()}: ${this.dump()}`);
    }
    $assert(!node._children, 'node already added');
    this._rootNodes.push(this._decodate(node));
  }

  /**
   * @param nodeId
   * @throws will throw an error if nodeId is null or undefined
   */
  remove(nodeId: number) {
    const node = this.find(nodeId);

    // If node has a parent, remove it from parent's children array
    if (node._parent) {
      node._parent._children = node._parent._children.filter((n) => n !== node);
      node._parent = null;
    }

    // Remove from root nodes array
    this._rootNodes = this._rootNodes.filter((n) => n !== node);

    // Clean up the node's own children array to prevent memory leaks
    node._children = [];
  }

  /**
   * @param parentId
   * @param childId
   * @throws will throw an error if parentId is null or undefined
   * @throws will throw an error if childId is null or undefined
   * @throws will throw an error if node with id childId is already a child of parent
   */
  connect(parentId: number, childId: number) {
    const parent = this.find(parentId);
    const child = this.find(childId, true);

    // If already connected to the same parent, skip (idempotent operation)
    if (child._parent) {
      if (child._parent === parent) {
        console.error(
          `[RootedTreeSet] Idempotent connect detected - Node ${childId} is already connected to parent ${parentId}. Skipping duplicate connection.`,
          `\nChild state: ${child}`,
          `\nParent state: ${parent}`,
          '\nStack trace:',
          new Error().stack,
        );
        return;
      }

      // Attempting to connect to a different parent - this is an error
      console.error(
        `[RootedTreeSet] Connection conflict - Node ${childId} is already connected to a different parent.`,
        `\nAttempted parent: ${parentId} (${parent})`,
        `\nCurrent parent: ${child._parent.getId()} (${child._parent})`,
        `\nChild state: ${child}`,
      );
      $assert(false, `node already connected. Id:${child.getId()},previous:${child._parent}`);
    }

    parent._children.push(child);
    child._parent = parent;
    this._rootNodes = this._rootNodes.filter((c) => c !== child);
  }

  /**
   * @param nodeId
   * @throws will throw an error if nodeId is null or undefined
   * @throws will throw an error if node is not connected
   */
  disconnect(nodeId: number) {
    const node = this.find(nodeId);
    $assert(node._parent, 'Node is not connected');

    node._parent!._children = node._parent!._children.filter((n) => node !== n);
    this._rootNodes.push(node);
    node._parent = null;
  }

  /**
   * @param id
   * @param validate
   * @throws will throw an error if id is null or undefined
   * @throws will throw an error if node cannot be found
   * @return node
   */
  find(id: number, validate = true): Node {
    const graphs = this._rootNodes;
    let result: Node | null = null;
    for (let i = 0; i < graphs.length; i++) {
      const node = graphs[i];
      result = this._find(id, node);
      if (result) {
        break;
      }
    }

    if (validate && !result) {
      throw new Error(`node could not be found id:${id}\n,RootedTreeSet${this.dump()}`);
    }

    return result!;
  }

  private _find(id: number, parent: Node): Node {
    if (parent.getId() === id) {
      return parent;
    }

    let result: Node | null = null;
    const children = parent._children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      result = this._find(id, child);
      if (result) break;
    }

    return result!;
  }

  /**
   * @param node
   * @throws will throw an error if nodeId is null or undefined
   * @return children
   */
  getChildren(node: Node): Node[] {
    $assert(node, 'node cannot be null');
    return node._children;
  }

  /**
   * @param node
   * @throws will throw an error if node is null or undefined
   * @return root node or the provided node, if it has no parent
   */
  getRootNode(node: Node) {
    $assert(node, 'node cannot be null');
    const parent = this.getParent(node);
    if (parent) {
      return this.getRootNode(parent);
    }

    return node;
  }

  /**
   * @param node
   * @throws will throw an error if node is null or undefined
   * @return {Array} ancestors */
  getAncestors(node: Node): Node[] {
    $assert(node, 'node cannot be null');
    return this._getAncestors(this.getParent(node), []);
  }

  private _getAncestors(node: Node | null, ancestors: Node[]) {
    const result = ancestors;
    if (node) {
      result.push(node);
      this._getAncestors(this.getParent(node), result);
    }
    return result;
  }

  /**
   * @param node
   * @throws will throw an error if node is null or undefined
   * @return {Array} siblings
   */
  getSiblings(node: Node): Node[] {
    $assert(node, 'node cannot be null');
    if (!node._parent) {
      return [];
    }
    const siblings = node._parent._children.filter((child) => child !== node);
    return siblings;
  }

  /**
   * @param node
   * @throws will throw an error if node is null or undefined
   * @return {Boolean} whether the node has a single path to a single leaf (no branching)
   */
  hasSinglePathToSingleLeaf(node: Node): boolean {
    $assert(node, 'node cannot be null');
    return this._hasSinglePathToSingleLeaf(node);
  }

  private _hasSinglePathToSingleLeaf(node: Node): boolean {
    const children = this.getChildren(node);

    if (children.length === 1) {
      return this._hasSinglePathToSingleLeaf(children[0]);
    }

    return children.length === 0;
  }

  /**
   * @param node
   * @return {Boolean} whether the node is the start of a subbranch */
  isStartOfSubBranch(node: Node): boolean {
    return this.getSiblings(node).length > 0 && this.getChildren(node).length === 1;
  }

  /**
   * @param node
   * @throws will throw an error if node is null or undefined
   * @return {Boolean} whether the node is a leaf
   */
  isLeaf(node: Node): boolean {
    $assert(node, 'node cannot be null');
    return this.getChildren(node).length === 0;
  }

  /**
   * @param node
   * @throws will throw an error if node is null or undefined
   * @return parent
   */
  getParent(node: Node): Node | null {
    $assert(node, 'node cannot be null');
    return node._parent;
  }

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
  }

  _dump(node: Node, indent: string) {
    let result = `${indent + node}\n`;
    const children = this.getChildren(node);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      result += this._dump(child, `${indent}   `);
    }

    return result;
  }

  /**
   * Traverse the tree and apply a visitor function to each node.
   * @param visitor - Function called for each node with (node, isRoot, children)
   */
  traverse(visitor: (node: Node, isRoot: boolean, children: Node[]) => void): void {
    this._rootNodes.forEach((rootNode) => {
      this._traverseNode(rootNode, visitor, true);
    });
  }

  private _traverseNode(
    node: Node,
    visitor: (node: Node, isRoot: boolean, children: Node[]) => void,
    isRoot: boolean,
  ): void {
    const children = this.getChildren(node);
    visitor(node, isRoot, children);

    children.forEach((child) => {
      this._traverseNode(child, visitor, false);
    });
  }

  /**
   * Plot the tree structure using Raphael.js (for testing/debugging only)
   * @param canvas - Raphael canvas object
   */
  plot(canvas) {
    this.traverse((node, isRoot) => {
      // Calculate position on canvas
      const cx = node.getPosition().x + canvas.width / 2 - node.getSize().width / 2;
      const cy = node.getPosition().y + canvas.height / 2 - node.getSize().height / 2;

      // Draw rectangle for node
      const rect = canvas.rect(cx, cy, node.getSize().width, node.getSize().height);

      // Draw node label with ID and order
      const order = node.getOrder();
      const orderText = order !== undefined ? order.toString() : '-';
      const text = canvas.text(
        node.getPosition().x + canvas.width / 2,
        node.getPosition().y + canvas.height / 2,
        `${node.getId()}[${orderText}]`,
      );
      text.attr('fill', '#FFF');

      // Color code: black for roots, red for children
      const fillColor = isRoot ? '#000' : '#c00';
      rect.attr('fill', fillColor);

      // Make clickable for debugging
      const rectPosition = {
        x: rect.attr('x') - canvas.width / 2 + rect.attr('width') / 2,
        y: rect.attr('y') - canvas.height / 2 + rect.attr('height') / 2,
      };
      const rectSize = { width: rect.attr('width'), height: rect.attr('height') };

      const nodeInfo = `[id:${node.getId()}, order:${node.getOrder()}, position:(${rectPosition.x},${rectPosition.y}), size:${rectSize.width}x${rectSize.height}, freeDisplacement:(${node.getFreeDisplacement().x},${node.getFreeDisplacement().y})]`;

      rect.click(() => console.log(nodeInfo));
      text.click(() => console.log(nodeInfo));
    });
  }

  /**
   * @param node
   * @param position
   */
  updateBranchPosition(node: Node, position: PositionType): void {
    const oldPos = node.getPosition();
    node.setPosition(position);

    const xOffset = oldPos.x - position.x;
    const yOffset = oldPos.y - position.y;

    const children = this.getChildren(node);
    children.forEach((child) => {
      this.shiftBranchPosition(child, xOffset, yOffset);
    });
  }

  /**
   * @param node
   * @param xOffset
   * @param yOffset
   */
  shiftBranchPosition(node: Node, xOffset: number, yOffset: number): void {
    const position = node.getPosition();
    node.setPosition({ x: position.x + xOffset, y: position.y + yOffset });

    const children = this.getChildren(node);
    const me = this;
    children.forEach((child) => {
      me.shiftBranchPosition(child, xOffset, yOffset);
    });
  }

  /**
   * @param node
   * @param yOffset
   * @return siblings in the offset (vertical) direction, i.e. with lower or higher order
   */
  getSiblingsInVerticalDirection(node: Node, yOffset: number): Node[] {
    // siblings with lower or higher order
    // (depending on the direction of the offset and on the same side as their parent)
    const parent = this.getParent(node)!;
    const siblings = this.getSiblings(node).filter((sibling) => {
      const sameSide =
        node.getPosition().x > parent.getPosition().x
          ? sibling.getPosition().x > parent.getPosition().x
          : sibling.getPosition().x < parent.getPosition().x;
      const siblingOrder = sibling.getOrder() ?? 0;
      const nodeOrder = node.getOrder() ?? 0;
      const orderOK = yOffset < 0 ? siblingOrder < nodeOrder : siblingOrder > nodeOrder;
      return orderOK && sameSide;
    });

    if (yOffset < 0) {
      siblings.reverse();
    }

    return siblings;
  }

  /**
   * @param node
   * @param yOffset
   * @return branches of the root node on the same side as the given node's, in the given
   * vertical direction
   */
  getBranchesInVerticalDirection(node: Node, yOffset: number): Node[] {
    // direct descendants of the root that do not contain the node and are on the same side
    // and on the direction of the offset
    const rootNode = this.getRootNode(node);
    const branches = this.getChildren(rootNode).filter((child) => this._find(node.getId(), child));

    const branch = branches[0];
    const result = this.getSiblings(branch).filter((sibling) => {
      const sameSide =
        node.getPosition().x > rootNode.getPosition().x
          ? sibling.getPosition().x > rootNode.getPosition().x
          : sibling.getPosition().x < rootNode.getPosition().x;
      const siblingOrder = sibling.getOrder() ?? 0;
      const branchOrder = branch.getOrder() ?? 0;
      const sameDirection = yOffset < 0 ? siblingOrder < branchOrder : siblingOrder > branchOrder;
      return sameSide && sameDirection;
    }, this);

    return result;
  }

  /**
   * Validates tree consistency by checking for stale references
   * @returns array of validation errors found, empty if tree is consistent
   */
  validateTreeConsistency(): string[] {
    const errors: string[] = [];
    const allNodeIds = new Set<number>();

    // Collect all node IDs by traversing from roots
    const collectIds = (node: Node) => {
      const nodeId = node.getId();
      if (allNodeIds.has(nodeId)) {
        errors.push(`Duplicate node ID found: ${nodeId}`);
      }
      allNodeIds.add(nodeId);

      const children = node._children;
      children.forEach((child) => {
        // Check parent-child relationship consistency
        if (child._parent !== node) {
          errors.push(
            `Child ${child.getId()}'s parent reference doesn't match actual parent ${nodeId}`,
          );
        }
        collectIds(child);
      });
    };

    // Traverse all trees
    this._rootNodes.forEach((root) => {
      if (root._parent !== null) {
        errors.push(`Root node ${root.getId()} has non-null parent`);
      }
      collectIds(root);
    });

    // Verify all children can be found
    const verifyChildren = (node: Node) => {
      const children = node._children;
      children.forEach((child) => {
        const childId = child.getId();
        const found = this.find(childId, false);
        if (!found) {
          errors.push(
            `Stale reference: Child ${childId} in node ${node.getId()}'s children array but not findable in tree`,
          );
        } else if (found !== child) {
          errors.push(
            `Reference mismatch: Child ${childId} in node ${node.getId()}'s children array is different instance than found node`,
          );
        }
        verifyChildren(child);
      });
    };

    this._rootNodes.forEach((root) => verifyChildren(root));

    return errors;
  }

  /**
   * Logs tree consistency validation results
   * @param throwOnError if true, throws an error when inconsistencies found
   */
  logTreeConsistency(throwOnError = false): void {
    const errors = this.validateTreeConsistency();
    if (errors.length > 0) {
      console.error('[RootedTreeSet] Tree consistency validation failed:');
      errors.forEach((error) => console.error(`  - ${error}`));
      console.error('Tree dump:', this.dump());
      if (throwOnError) {
        throw new Error(`Tree consistency validation failed: ${errors.length} errors found`);
      }
    } else {
      console.log('[RootedTreeSet] Tree consistency validation passed');
    }
  }
}

export default RootedTreeSet;
