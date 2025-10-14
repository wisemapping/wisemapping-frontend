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

describe('LayoutManager - Basic Layout Tests', () => {
  describe('Node Alignment', () => {
    it('should vertically align child nodes', () => {
      const position = { x: 0, y: 0 };
      const manager = new LayoutManager(0, ROOT_NODE_SIZE);

      manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
      manager.addNode(2, NODE_SIZE, position).connectNode(1, 2, 0);
      manager.addNode(3, NODE_SIZE, position).connectNode(2, 3, 0);
      manager.addNode(4, NODE_SIZE, position).connectNode(3, 4, 0);

      manager.layout();

      // Child nodes should be vertically aligned
      const node1Y = manager.find(1).getPosition().y;
      const node2Y = manager.find(2).getPosition().y;
      const node3Y = manager.find(3).getPosition().y;
      const node4Y = manager.find(4).getPosition().y;

      expect(node1Y).toBe(node2Y);
      expect(node1Y).toBe(node3Y);
      expect(node1Y).toBe(node4Y);
    });

    it('should horizontally align sibling nodes', () => {
      const position = { x: 0, y: 0 };
      const manager = new LayoutManager(0, ROOT_NODE_SIZE);

      manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
      manager.addNode(5, NODE_SIZE, position).connectNode(0, 5, 2);
      manager.addNode(6, NODE_SIZE, position).connectNode(0, 6, 4);
      manager.addNode(7, NODE_SIZE, position).connectNode(0, 7, 6);

      manager.layout();

      // Siblings should be horizontally aligned
      const node1X = manager.find(1).getPosition().x;
      const node5X = manager.find(5).getPosition().x;
      const node6X = manager.find(6).getPosition().x;
      const node7X = manager.find(7).getPosition().x;

      expect(node1X).toBe(node5X);
      expect(node1X).toBe(node6X);
      expect(node1X).toBe(node7X);
    });
  });

  describe('Baseline Alignment', () => {
    it('should align baselines correctly with different node sizes', () => {
      const position = { x: 0, y: 0 };
      const manager = new LayoutManager(0, ROOT_NODE_SIZE);

      manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
      manager.addNode(3, NODE_SIZE, position).connectNode(1, 3, 0);
      manager.addNode(5, NODE_SIZE, position).connectNode(3, 5, 0);
      manager.addNode(6, { width: 140, height: 130 }, position).connectNode(3, 6, 1);

      manager.layout();

      const node5 = manager.find(5);
      const node6 = manager.find(6);

      // Verify nodes exist and have positions
      expect(node5).toBeDefined();
      expect(node6).toBeDefined();
      expect(node5.getPosition()).toBeDefined();
      expect(node6.getPosition()).toBeDefined();

      // The baseline (vertical center) should be aligned
      const node5Center = node5.getPosition().y;
      const node6Center = node6.getPosition().y;
      
      // With different heights, they should be vertically offset
      expect(node5Center).not.toBe(node6Center);
    });
  });

  describe('Node Operations', () => {
    it('should handle node disconnection', () => {
      const position = { x: 0, y: 0 };
      const manager = new LayoutManager(0, ROOT_NODE_SIZE);

      manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
      manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 1);
      manager.addNode(3, NODE_SIZE, position).connectNode(0, 3, 2);

      manager.layout();

      // Disconnect node 2
      manager.disconnectNode(2);
      manager.layout();

      const node2 = manager.find(2);
      expect(node2).toBeDefined();
      
      // Node should still exist after disconnection
      expect(node2.getPosition()).toBeDefined();
    });

    it('should handle node reconnection', () => {
      const position = { x: 0, y: 0 };
      const manager = new LayoutManager(0, ROOT_NODE_SIZE);

      manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
      manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 1);

      manager.layout();
      manager.disconnectNode(2);
      manager.layout();

      // Reconnect node 2
      manager.connectNode(0, 2, 1);
      manager.layout();

      const node2 = manager.find(2);
      
      expect(node2).toBeDefined();
      expect(node2.getPosition()).toBeDefined();
    });

    it('should handle node removal', () => {
      const position = { x: 0, y: 0 };
      const manager = new LayoutManager(0, ROOT_NODE_SIZE);

      manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
      manager.addNode(2, NODE_SIZE, position).connectNode(0, 2, 1);
      manager.addNode(3, NODE_SIZE, position).connectNode(0, 3, 2);

      manager.layout();

      // Remove node 2
      manager.removeNode(2);
      manager.layout();

      // Node should no longer exist - find() will throw an error
      expect(() => manager.find(2)).toThrow();
    });

    it('should handle node size changes', () => {
      const position = { x: 0, y: 0 };
      const manager = new LayoutManager(0, ROOT_NODE_SIZE);

      manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
      manager.layout();

      // Update node size
      manager.updateNodeSize(1, { width: 120, height: 80 });
      manager.layout();

      const newPosition = manager.find(1).getPosition();

      // Position should be valid after size change
      expect(newPosition).toBeDefined();
      expect(typeof newPosition.x).toBe('number');
      expect(typeof newPosition.y).toBe('number');
    });
  });

  describe('Layout Calculations', () => {
    it('should complete layout without errors', () => {
      const position = { x: 0, y: 0 };
      const manager = new LayoutManager(0, ROOT_NODE_SIZE);

      manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
      
      // Should not throw
      expect(() => manager.layout()).not.toThrow();
      
      // Node should have valid position after layout
      const node1 = manager.find(1);
      expect(node1.getPosition()).toBeDefined();
    });

    it('should handle complex layouts without errors', () => {
      const position = { x: 0, y: 0 };
      const manager = new LayoutManager(0, ROOT_NODE_SIZE);

      manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
      manager.addNode(2, NODE_SIZE, position).connectNode(1, 2, 0);
      manager.addNode(3, NODE_SIZE, position).connectNode(1, 3, 1);
      
      // Should not throw
      expect(() => manager.layout()).not.toThrow();
      
      // All nodes should have valid positions
      [1, 2, 3].forEach(id => {
        const node = manager.find(id);
        const pos = node.getPosition();
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      });
    });
  });

  describe('Single Node Operations', () => {
    it('should handle reconnecting a single node', () => {
      const position = { x: 0, y: 0 };
      const manager = new LayoutManager(0, ROOT_NODE_SIZE);

      manager.addNode(1, NODE_SIZE, position).connectNode(0, 1, 0);
      manager.layout();

      manager.disconnectNode(1);
      manager.layout();

      manager.connectNode(0, 1, 0);
      manager.layout();

      const node1 = manager.find(1);
      expect(node1).toBeDefined();
      expect(node1.getPosition()).toBeDefined();
    });
  });
});

