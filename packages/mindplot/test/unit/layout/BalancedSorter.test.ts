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

import LayoutManager from '../../../src/components/layout/LayoutManager';
import BalancedSorter from '../../../src/components/layout/BalancedSorter';
import Node from '../../../src/components/layout/Node';
import RootedTreeSet from '../../../src/components/layout/RootedTreeSet';

const ROOT_NODE_SIZE = { width: 140, height: 90 };
const NODE_SIZE = { width: 80, height: 60 };

describe('BalancedSorter Layout Tests', () => {
  it('should balance nodes on both sides', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);

    // Add nodes to both sides
    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 1);
    manager.addNode(3, NODE_SIZE, position).connectNode(0, 3, 2);
    manager.addNode(4, NODE_SIZE, position).connectNode(0, 4, 3);

    manager.layout();

    // Verify nodes are distributed on both sides
    const node1 = manager.find(1);
    const node2 = manager.find(2);

    expect(node1).toBeDefined();
    expect(node2).toBeDefined();

    // Nodes on opposite sides should have opposite x positions relative to root
    const node1X = node1.getPosition().x;
    const node2X = node2.getPosition().x;

    expect(Math.sign(node1X)).not.toBe(Math.sign(node2X));
  });

  it('should handle complex balanced layouts', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);

    // Create a more complex tree
    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 1);
    manager.addNode(3, NODE_SIZE, position).connectNode(1, 3, 0);
    manager.addNode(4, NODE_SIZE, position).connectNode(1, 4, 1);
    manager.addNode(5, NODE_SIZE, position).connectNode(2, 5, 0);
    manager.addNode(6, NODE_SIZE, position).connectNode(2, 6, 1);

    manager.layout();

    // All nodes should have valid positions
    for (let i = 1; i <= 6; i++) {
      const node = manager.find(i);
      expect(node).toBeDefined();

      const pos = node.getPosition();
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.y).toBe('number');
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
    }
  });

  it('should maintain balance after node removal', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);

    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 1);
    manager.addNode(3, NODE_SIZE, position).connectNode(0, 3, 2);
    manager.addNode(4, NODE_SIZE, position).connectNode(0, 4, 3);

    manager.layout();

    // Remove a node
    manager.removeNode(3);
    manager.layout();

    // Remaining nodes should still be balanced
    const node1 = manager.find(1);
    const node2 = manager.find(2);
    const node4 = manager.find(4);

    expect(node1).toBeDefined();
    expect(node2).toBeDefined();
    expect(node4).toBeDefined();

    // Removed node should throw when accessed
    expect(() => manager.find(3)).toThrow();
  });

  it('should handle dynamic node additions', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);

    // Start with a simple layout
    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
    manager.layout();

    // Add more nodes
    manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 1);
    manager.addNode(3, NODE_SIZE, position).connectNode(0, 3, 2);
    manager.layout();

    // Layout should be recalculated
    const newNode1Pos = manager.find(1).getPosition();

    // Position should be valid after dynamic additions
    expect(newNode1Pos).toBeDefined();
    expect(typeof newNode1Pos.x).toBe('number');
    expect(typeof newNode1Pos.y).toBe('number');
  });
});

describe('BalancedSorter.verify', () => {
  const sorter = new BalancedSorter();

  /** A root with one child per given order, wired directly so verify sees them as-is. */
  const treeWithOrders = (orders: number[]): { treeSet: RootedTreeSet; root: Node } => {
    const treeSet = new RootedTreeSet();
    const root = new Node(0, ROOT_NODE_SIZE, { x: 0, y: 0 }, sorter);
    treeSet.setRoot(root);
    orders.forEach((order, index) => {
      const child = new Node(index + 1, NODE_SIZE, { x: 0, y: 0 }, sorter);
      child.setOrder(order);
      treeSet.add(child);
      treeSet.connect(0, child.getId());
    });
    return { treeSet, root };
  };

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('accepts continuous orders on both sides', () => {
    const { treeSet, root } = treeWithOrders([0, 1, 2, 3, 4, 5]);
    expect(() => sorter.verify(treeSet, root)).not.toThrow();
  });

  it('accepts a single child on the left side', () => {
    const { treeSet, root } = treeWithOrders([1]);
    expect(() => sorter.verify(treeSet, root)).not.toThrow();
  });

  it('rejects a hole on the right (even) side', () => {
    const { treeSet, root } = treeWithOrders([0, 1, 4]);
    expect(() => sorter.verify(treeSet, root)).toThrow();
  });

  it('rejects a hole on the left (odd) side', () => {
    const { treeSet, root } = treeWithOrders([0, 1, 2, 5]);
    expect(() => sorter.verify(treeSet, root)).toThrow();
  });

  it('rejects a left side that does not start at 1', () => {
    const { treeSet, root } = treeWithOrders([0, 3]);
    expect(() => sorter.verify(treeSet, root)).toThrow();
  });

  it('keeps passing through connect and disconnect on both sides', () => {
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);
    const position = { x: 0, y: 0 };
    [0, 1, 2, 3, 4, 5].forEach((order, index) => {
      manager.addNode(index + 1, NODE_SIZE, position).connectNode(0, index + 1, order);
    });
    // connectNode and disconnectNode both run verify on the root.
    expect(() => manager.disconnectNode(2)).not.toThrow();
    expect(() => manager.connectNode(0, 2, 5)).not.toThrow();
    expect(() => manager.disconnectNode(4)).not.toThrow();
    expect(() => manager.connectNode(0, 4, 1)).not.toThrow();
    expect(() => manager.disconnectNode(1)).not.toThrow();
    expect(() => manager.connectNode(0, 1, 9)).not.toThrow();
    manager.layout();
  });
});
