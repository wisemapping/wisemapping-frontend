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
import RootedTreeSet from '../../../src/components/layout/RootedTreeSet';
import SymmetricSorter from '../../../src/components/layout/SymmetricSorter';

const ROOT_NODE_SIZE = { width: 140, height: 90 };
const NODE_SIZE = { width: 80, height: 60 };

describe('SymmetricSorter Layout Tests', () => {
  it('should create symmetric layouts', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);

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
    [node1, node2, node3, node4].forEach((node) => {
      const pos = node.getPosition();
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.y).toBe('number');
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
    });
  });

  it('should maintain symmetry with multiple levels', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);

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
  });

  it('should handle node size variations symmetrically', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);

    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, { width: 100, height: 80 }, position).connectNode(0, 2, 1);
    manager.addNode(3, { width: 60, height: 40 }, position).connectNode(0, 3, 2);

    manager.layout();

    // All nodes should be positioned despite different sizes
    const node1 = manager.find(1);
    const node2 = manager.find(2);
    const node3 = manager.find(3);

    expect(node1.getPosition()).toBeDefined();
    expect(node2.getPosition()).toBeDefined();
    expect(node3.getPosition()).toBeDefined();
  });

  it('should rebalance after structural changes', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);

    manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 1);
    manager.addNode(3, NODE_SIZE, position).connectNode(1, 3, 0);

    manager.layout();

    // Disconnect and reconnect
    manager.disconnectNode(3);
    manager.layout();
    manager.connectNode(1, 3, 0);
    manager.layout();

    const afterPos = manager.find(3).getPosition();

    // Should have valid position after reconnection
    expect(afterPos).toBeDefined();
    expect(Number.isFinite(afterPos.x)).toBe(true);
    expect(Number.isFinite(afterPos.y)).toBe(true);
  });
});

describe('SymmetricSorter.predict of a new child of an isolated topic', () => {
  // Topic 5 is not connected to the central topic: it is the root of its own tree.
  const isolatedAt = (x: number): LayoutManager => {
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);
    manager.addNode(5, NODE_SIZE, { x, y: 300 });
    manager.layout();
    return manager;
  };

  it.each([-400, 400])('previews the side the layout uses for a topic at x=%i', (x) => {
    const manager = isolatedAt(x);
    const predicted = manager.predict(5, null, null);

    manager.addNode(6, NODE_SIZE, { x: 0, y: 0 }).connectNode(5, 6, predicted.order);
    manager.layout();
    const laidOut = manager.find(6).getPosition();

    expect(Math.sign(predicted.position.x - x)).toBe(Math.sign(laidOut.x - x));
    expect(Math.sign(predicted.position.x - x)).toBe(Math.sign(x));
  });
});

describe('SymmetricSorter.predict previews the side the layout uses (BL4-36)', () => {
  const treeSetOf = (manager: LayoutManager): RootedTreeSet =>
    (manager as unknown as { _treeSet: RootedTreeSet })._treeSet;

  it('drops onto a childless topic on the side of its children, not of the mouse', () => {
    // Topic 1 is on the right of the central topic and topic 2, which has no children, on the left.
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);
    manager.addNode(1, NODE_SIZE, { x: 0, y: 0 }).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, { x: 0, y: 0 }).connectNode(0, 2, 1);
    manager.addNode(3, NODE_SIZE, { x: 0, y: 0 }).connectNode(1, 3, 0);
    manager.layout();
    const parentX = manager.find(2).getPosition().x;
    expect(parentX).toBeLessThan(0);

    // Topic 3 is dragged onto topic 2 with the mouse on the right of the central topic.
    const predicted = manager.predict(2, 3, { x: 300, y: 0 });

    manager.disconnectNode(3);
    manager.connectNode(2, 3, predicted.order);
    manager.layout();
    const laidOut = manager.find(3).getPosition();

    expect(Math.sign(laidOut.x - parentX)).toBe(-1);
    expect(Math.sign(predicted.position.x - parentX)).toBe(Math.sign(laidOut.x - parentX));
  });

  it.each([-400, 400])('places a free child of an isolated topic at x=%i on its side', (x) => {
    // Topic 5 is not connected to the central topic: it is the root of its own tree.
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);
    manager.addNode(5, NODE_SIZE, { x, y: 300 });
    manager.addNode(6, NODE_SIZE, { x: 0, y: 0 });
    manager.layout();

    const sorter = new SymmetricSorter();
    const treeSet = treeSetOf(manager);
    // The mouse is far on the other side of the topic.
    const [, predicted] = sorter.predict(
      treeSet,
      manager.find(5),
      manager.find(6),
      { x: x - Math.sign(x) * 1000, y: 300 },
      true,
    );

    manager.connectNode(5, 6, 0);
    manager.layout();
    const laidOut = manager.find(6).getPosition();

    expect(Math.sign(laidOut.x - x)).toBe(Math.sign(x));
    expect(Math.sign(predicted.x - x)).toBe(Math.sign(laidOut.x - x));
  });
});
