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

const ROOT_NODE_SIZE = { width: 140, height: 90 };
const NODE_SIZE = { width: 80, height: 60 };

describe('TreeSorter Order Recovery Tests', () => {
  beforeEach(() => {
    // Spy on console.error to verify error logging
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    jest.restoreAllMocks();
  });

  it('should handle order gaps gracefully', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE, 'tree');

    // Add nodes with valid orders
    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 1);
    manager.addNode(3, NODE_SIZE, position).connectNode(0, 3, 2);

    // Try to add node with order gap (should recover to order 3)
    manager.addNode(4, NODE_SIZE, position).connectNode(0, 4, 10);

    manager.layout();

    // Verify all nodes exist and have valid positions
    const node1 = manager.find(1);
    const node2 = manager.find(2);
    const node3 = manager.find(3);
    const node4 = manager.find(4);

    expect(node1).toBeDefined();
    expect(node2).toBeDefined();
    expect(node3).toBeDefined();
    expect(node4).toBeDefined();

    // Verify orders are continuous (0, 1, 2, 3)
    expect(node1.getOrder()).toBe(0);
    expect(node2.getOrder()).toBe(1);
    expect(node3.getOrder()).toBe(2);
    expect(node4.getOrder()).toBe(3);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[TreeSorter] Order discontinuity detected')
    );
  });

  it('should handle negative order values', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE, 'tree');

    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 1);

    // Try to add node with negative order (should recover to end)
    manager.addNode(3, NODE_SIZE, position).connectNode(0, 3, -1);

    manager.layout();

    const node1 = manager.find(1);
    const node2 = manager.find(2);
    const node3 = manager.find(3);

    expect(node1).toBeDefined();
    expect(node2).toBeDefined();
    expect(node3).toBeDefined();

    // Verify orders are continuous
    expect(node1.getOrder()).toBe(0);
    expect(node2.getOrder()).toBe(1);
    expect(node3.getOrder()).toBe(2);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[TreeSorter] Invalid order value detected')
    );
  });

  it('should handle NaN order values', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE, 'tree');

    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);

    // Try to add node with NaN order
    manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, NaN);

    manager.layout();

    const node1 = manager.find(1);
    const node2 = manager.find(2);

    expect(node1).toBeDefined();
    expect(node2).toBeDefined();

    // Verify orders are valid
    expect(node1.getOrder()).toBe(0);
    expect(node2.getOrder()).toBe(1);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[TreeSorter] Invalid order value detected')
    );
  });

  it('should handle Infinity order values', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE, 'tree');

    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);

    // Try to add node with Infinity order
    manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, Infinity);

    manager.layout();

    const node1 = manager.find(1);
    const node2 = manager.find(2);

    expect(node1).toBeDefined();
    expect(node2).toBeDefined();

    // Verify orders are valid
    expect(node1.getOrder()).toBe(0);
    expect(node2.getOrder()).toBe(1);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[TreeSorter] Invalid order value detected')
    );
  });

  it('should create tree layouts with proper positioning', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE, 'tree');

    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 1);
    manager.addNode(3, NODE_SIZE, position).connectNode(1, 3, 0);
    manager.addNode(4, NODE_SIZE, position).connectNode(1, 4, 1);

    manager.layout();

    // Verify all nodes have valid positions
    const node1 = manager.find(1);
    const node2 = manager.find(2);
    const node3 = manager.find(3);
    const node4 = manager.find(4);

    expect(node1).toBeDefined();
    expect(node2).toBeDefined();
    expect(node3).toBeDefined();
    expect(node4).toBeDefined();

    // Check positions are valid numbers
    [node1, node2, node3, node4].forEach(node => {
      const pos = node.getPosition();
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.y).toBe('number');
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
    });
  });

  it('should maintain tree structure with multiple levels', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE, 'tree');

    // Create a deeper tree
    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, position).connectNode(1, 2, 0);
    manager.addNode(3, NODE_SIZE, position).connectNode(2, 3, 0);
    manager.addNode(4, NODE_SIZE, position).connectNode(3, 4, 0);

    manager.layout();

    // Verify each level is properly positioned
    for (let i = 1; i <= 4; i++) {
      const node = manager.find(i);
      expect(node).toBeDefined();
      
      const pos = node.getPosition();
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
    }

    // Verify tree hierarchy (each node is below its parent)
    const node0 = manager.find(0);
    const node1 = manager.find(1);
    const node2 = manager.find(2);
    const node3 = manager.find(3);
    const node4 = manager.find(4);

    expect(node1.getPosition().y).toBeGreaterThan(node0.getPosition().y);
    expect(node2.getPosition().y).toBeGreaterThan(node1.getPosition().y);
    expect(node3.getPosition().y).toBeGreaterThan(node2.getPosition().y);
    expect(node4.getPosition().y).toBeGreaterThan(node3.getPosition().y);
  });

  it('should handle mixed order issues without crashing', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE, 'tree');

    // Add nodes with various order issues
    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 5);  // Gap
    manager.addNode(3, NODE_SIZE, position).connectNode(0, 3, -1); // Negative
    manager.addNode(4, NODE_SIZE, position).connectNode(0, 4, NaN); // NaN
    manager.addNode(5, NODE_SIZE, position).connectNode(0, 5, 3);  // Valid

    manager.layout();

    // All nodes should be loaded and positioned
    for (let i = 1; i <= 5; i++) {
      const node = manager.find(i);
      expect(node).toBeDefined();
      expect(Number.isFinite(node.getPosition().x)).toBe(true);
      expect(Number.isFinite(node.getPosition().y)).toBe(true);
    }

    // All orders should be valid numbers
    const orders = [1, 2, 3, 4, 5].map(id => manager.find(id).getOrder());
    orders.forEach(order => {
      expect(Number.isFinite(order)).toBe(true);
      expect(order).toBeGreaterThanOrEqual(0);
      expect(order).toBeLessThan(5);
    });

    // Orders should be unique (no duplicates)
    const uniqueOrders = new Set(orders);
    expect(uniqueOrders.size).toBe(5);

    // Multiple errors should have been logged
    expect(console.error).toHaveBeenCalledTimes(3); // Gap, Negative, NaN
  });

  it('should recover from corrupted map data on load', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE, 'tree');

    // Simulate loading corrupted map with order issues
    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 10); // Large gap
    manager.addNode(3, NODE_SIZE, position).connectNode(1, 3, 0);
    manager.addNode(4, NODE_SIZE, position).connectNode(1, 4, 100); // Large gap

    manager.layout();

    // Map should load successfully despite corruption
    expect(manager.find(1)).toBeDefined();
    expect(manager.find(2)).toBeDefined();
    expect(manager.find(3)).toBeDefined();
    expect(manager.find(4)).toBeDefined();

    // All positions should be valid
    [1, 2, 3, 4].forEach(id => {
      const node = manager.find(id);
      const pos = node.getPosition();
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
    });

    // Errors should have been logged for the issues
    expect(console.error).toHaveBeenCalled();
  });
});

