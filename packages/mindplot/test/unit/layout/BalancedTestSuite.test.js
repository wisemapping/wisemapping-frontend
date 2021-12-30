import TestSuite from './TestSuite';
import LayoutManager from '../../../src/components/layout/LayoutManager';

describe('Balanced Test Suite', () => {
  describe('balancedTest', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);
    manager.addNode(1, TestSuite.NODE_SIZE, position);
    manager.connectNode(0, 1, 0); manager.layout();

    manager.addNode(2, TestSuite.NODE_SIZE, position);
    manager.connectNode(0, 2, 1);
    manager.layout();

    manager.addNode(3, TestSuite.NODE_SIZE, position);
    manager.connectNode(0, 3, 2);
    manager.layout();

    manager.addNode(4, TestSuite.NODE_SIZE, position);
    manager.connectNode(0, 4, 3);
    manager.layout();

    manager.addNode(5, TestSuite.NODE_SIZE, position);
    manager.connectNode(0, 5, 4);
    manager.layout();

    manager.addNode(6, TestSuite.NODE_SIZE, position);
    manager.connectNode(0, 6, 5);
    manager.layout();

    manager.addNode(7, TestSuite.NODE_SIZE, position);
    manager.addNode(8, TestSuite.NODE_SIZE, position);
    manager.addNode(9, TestSuite.NODE_SIZE, position);
    manager.connectNode(3, 7, 0);
    manager.connectNode(7, 8, 0);
    manager.connectNode(7, 9, 1);
    manager.layout();

    manager.addNode(10, TestSuite.NODE_SIZE, position);
    manager.addNode(11, TestSuite.NODE_SIZE, position);
    manager.addNode(12, TestSuite.NODE_SIZE, position);
    manager.connectNode(6, 10, 0);
    manager.connectNode(10, 11, 0);
    manager.connectNode(10, 12, 1);
    manager.layout();

    manager.addNode(13, TestSuite.NODE_SIZE, position);
    manager.connectNode(0, 13, 4);
    manager.layout();

    test('Check orders have shifted accordingly', () => {
      expect(manager.find(5).getOrder()).toEqual(6);
    });

    test('Check orders have shifted accordingly', () => {
      manager.addNode(14, TestSuite.NODE_SIZE, position);
      manager.connectNode(0, 14, 5);
      manager.layout();
      expect(manager.find(6).getOrder()).toEqual(7);
    });

    test('Check orders have shifted accordingly', () => {
      manager.addNode(15, TestSuite.NODE_SIZE, position);
      manager.connectNode(0, 15, 4);
      manager.layout();
      expect(manager.find(13).getOrder()).toEqual(6);
      expect(manager.find(5).getOrder()).toEqual(8);
    });

    test('Check orders have shifted accordingly', () => {
      manager.addNode(16, TestSuite.NODE_SIZE, position);
      manager.connectNode(0, 16, 25);
      manager.layout();
      expect(manager.find(16).getOrder()).toEqual(9);
    });

    test('Check that everything is ok', () => {
      manager.addNode(17, TestSuite.NODE_SIZE, position);
      manager.addNode(18, TestSuite.NODE_SIZE, position);
      manager.addNode(19, TestSuite.NODE_SIZE, position);
      manager.connectNode(0, 17, 11);
      manager.connectNode(0, 18, 13);
      manager.connectNode(0, 19, 10);
      manager.layout();
      expect(manager.find(1).getPosition().x).toBeGreaterThan(manager.find(0).getPosition().x);
      expect(manager.find(3).getPosition().x).toBeGreaterThan(manager.find(0).getPosition().x);
      expect(manager.find(5).getPosition().x).toBeGreaterThan(manager.find(0).getPosition().x);
      expect(manager.find(2).getPosition().x).toBeLessThan(manager.find(0).getPosition().x);
      expect(manager.find(4).getPosition().x).toBeLessThan(manager.find(0).getPosition().x);
      expect(manager.find(6).getPosition().x).toBeLessThan(manager.find(0).getPosition().x);
      expect(manager.find(7).getPosition().x).toBeGreaterThan(manager.find(3).getPosition().x);
      expect(manager.find(8).getPosition().x).toBeGreaterThan(manager.find(7).getPosition().x);
      expect(manager.find(9).getPosition().x).toBeGreaterThan(manager.find(7).getPosition().x);
      expect(manager.find(10).getPosition().x).toBeLessThan(manager.find(6).getPosition().x);
      expect(manager.find(11).getPosition().x).toBeLessThan(manager.find(10).getPosition().x);
      expect(manager.find(12).getPosition().x).toBeLessThan(manager.find(10).getPosition().x);
    });
  });

  describe('balancedPredictTest', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    manager.addNode(1, TestSuite.NODE_SIZE, position);
    manager.addNode(2, TestSuite.NODE_SIZE, position);
    manager.addNode(3, TestSuite.NODE_SIZE, position);
    manager.addNode(4, TestSuite.NODE_SIZE, position);
    manager.addNode(5, TestSuite.NODE_SIZE, position);
    manager.addNode(7, TestSuite.NODE_SIZE, position);
    manager.addNode(8, TestSuite.NODE_SIZE, position);
    manager.addNode(9, TestSuite.NODE_SIZE, position);
    manager.addNode(10, TestSuite.NODE_SIZE, position);
    manager.addNode(11, TestSuite.NODE_SIZE, position);

    manager.connectNode(0, 1, 0);
    manager.connectNode(0, 2, 1);
    manager.connectNode(0, 3, 2);
    manager.connectNode(0, 4, 3);
    manager.connectNode(0, 5, 4);
    manager.connectNode(4, 7, 0);
    manager.connectNode(4, 8, 1);
    manager.connectNode(8, 9, 0);
    manager.connectNode(3, 10, 0);
    manager.connectNode(3, 11, 1);

    manager.layout();

    test('Added as child of node 0 and dropped at (165, -70)', () => {
      const prediction1a = manager.predict(0, null, { x: 165, y: -70 });
      expect(prediction1a.position.y).toBeLessThan(manager.find(1).getPosition().y);
      expect(prediction1a.position.x).toEqual(manager.find(1).getPosition().x);
      expect(prediction1a.order).toEqual(0);
    });

    test('Added as child of node 0 and dropped at (165, -10)', () => {
      const prediction1b = manager.predict(0, null, { x: 165, y: -10 });
      expect(prediction1b.position.y).toBeGreaterThan(manager.find(1).getPosition().y);
      expect(prediction1b.position.y).toBeLessThan(manager.find(3).getPosition().y);
      expect(prediction1b.position.x).toEqual(manager.find(1).getPosition().x);
      expect(prediction1b.order).toEqual(2);
    });

    test('Added as child of node 0 and dropped at (145, 15)', () => {
      const prediction1c = manager.predict(0, null, { x: 145, y: 15 });
      expect(prediction1c.position.y).toBeGreaterThan(manager.find(3).getPosition().y);
      expect(prediction1c.position.y).toBeLessThan(manager.find(5).getPosition().y);
      expect(prediction1c.position.x).toEqual(manager.find(3).getPosition().x);
      expect(prediction1c.order).toEqual(4);
    });

    test('Added as child of node 0 and dropped at (145, 70)', () => {
      const prediction1d = manager.predict(0, null, { x: 145, y: 70 });
      expect(prediction1d.position.y).toBeGreaterThan(manager.find(5).getPosition().y);
      expect(prediction1d.position.x).toEqual(manager.find(5).getPosition().x);
      expect(prediction1d.order).toEqual(6);
    });

    test('Added as child of node 0 and dropped at (-145, -50)', () => {
      const prediction2a = manager.predict(0, null, { x: -145, y: -50 });
      expect(prediction2a.position.y).toBeLessThan(manager.find(2).getPosition().y);
      expect(prediction2a.position.x).toEqual(manager.find(2).getPosition().x);
      expect(prediction2a.order).toEqual(1);
    });

    test('Added as child of node 0 and dropped at (-145, -10)', () => {
      const prediction2b = manager.predict(0, null, { x: -145, y: -10 });
      expect(prediction2b.position.y).toBeGreaterThan(manager.find(2).getPosition().y);
      expect(prediction2b.position.y).toBeLessThan(manager.find(4).getPosition().y);
      expect(prediction2b.position.x).toEqual(manager.find(2).getPosition().x);
      expect(prediction2b.order).toEqual(3);
    });

    test('Added as child of node 0 and dropped at (-145, 40)', () => {
      const prediction2c = manager.predict(0, null, { x: -145, y: 400 });
      expect(prediction2c.position.y).toBeGreaterThan(manager.find(4).getPosition().y);
      expect(prediction2c.position.x).toEqual(manager.find(4).getPosition().x);
      expect(prediction2c.order).toEqual(5);
    });

    test('Predict nodes added with no position', () => {
      const prediction3 = manager.predict(0, null, null);
      expect(prediction3.position.y).toBeGreaterThan(manager.find(4).getPosition().y);
      expect(prediction3.position.x).toEqual(manager.find(4).getPosition().x);
      expect(prediction3.order).toEqual(5);

      manager.addNode(6, TestSuite.NODE_SIZE, prediction3.position);
      manager.connectNode(0, 6, prediction3.order);
      manager.layout();

      const prediction4 = manager.predict(0, null, null);
      expect(prediction4.position.y).toBeGreaterThan(manager.find(5).getPosition().y);
      expect(prediction4.position.x).toEqual(manager.find(5).getPosition().x);
      expect(prediction4.order).toEqual(6);
    });

    test('Predict nodes added only a root node', () => {
      manager.removeNode(1).removeNode(2).removeNode(3).removeNode(4)
        .removeNode(5);
      manager.layout();
      const prediction5a = manager.predict(0, null, null);
      const prediction5b = manager.predict(0, null, { x: 40, y: 100 });
      expect(prediction5a.position.x).toBeGreaterThan(manager.find(0).getPosition().x);
      expect(prediction5a.position.y).toEqual(manager.find(0).getPosition().y);
      expect(prediction5a.order).toEqual(0);
      expect(prediction5a.position.x).toEqual(prediction5b.position.x);
      expect(prediction5a.position.y).toEqual(prediction5b.position.y);
      expect(prediction5a.order).toEqual(prediction5b.order);
    });
  });

  describe('balancedNodeDragPredictTest', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    manager.addNode(1, TestSuite.NODE_SIZE, position).connectNode(0, 1, 0);
    manager.layout();

    describe('Predict 1', () => {
      test('Node drag predict A', () => {
        const prediction1a = manager.predict(0, 1, { x: 50, y: 50 });
        expect(prediction1a.position.x).toEqual(manager.find(1).getPosition().x);
        expect(prediction1a.position.y).toEqual(manager.find(1).getPosition().y);
        expect(prediction1a.order).toEqual(manager.find(1).getOrder());
      });

      test('Node drag predict B', () => {
        const prediction1b = manager.predict(0, 1, { x: 50, y: -50 });
        expect(prediction1b.position.x).toEqual(manager.find(1).getPosition().x);
        expect(prediction1b.position.y).toEqual(manager.find(1).getPosition().y);
        expect(prediction1b.order).toEqual(manager.find(1).getOrder());
      });

      test('Node drag predict C', () => {
        const prediction1c = manager.predict(0, 1, { x: -50, y: 50 });
        expect(prediction1c.position.x).toBeLessThan(manager.find(0).getPosition().x);
        expect(prediction1c.position.y).toEqual(manager.find(0).getPosition().y);
        expect(prediction1c.order).toEqual(1);
      });

      test('Node drag predict D', () => {
        const prediction1d = manager.predict(0, 1, { x: -50, y: -50 });
        expect(prediction1d.position.x).toBeLessThan(manager.find(0).getPosition().x);
        expect(prediction1d.position.y).toEqual(manager.find(0).getPosition().y);
        expect(prediction1d.order).toEqual(1);
      });
    });

    describe('Predict 2', () => {
      beforeEach(() => {
        manager.disconnectNode(1);
        manager.connectNode(0, 1, 1);
        manager.layout();
      });

      test('Node drag predict A', () => {
        const prediction2a = manager.predict(0, 1, { x: 50, y: 50 });
        expect(prediction2a.position.x).toBeGreaterThan(manager.find(0).getPosition().x);
        expect(prediction2a.position.y).toEqual(manager.find(0).getPosition().y);
        expect(prediction2a.order).toEqual(0);
      });

      test('Node drag predict B', () => {
        const prediction2b = manager.predict(0, 1, { x: 50, y: -50 });
        expect(prediction2b.position.x).toBeGreaterThan(manager.find(0).getPosition().x);
        expect(prediction2b.position.y).toEqual(manager.find(0).getPosition().y);
        expect(prediction2b.order).toEqual(0);
      });

      test('Node drag predict C', () => {
        const prediction2c = manager.predict(0, 1, { x: -50, y: 50 });
        expect(prediction2c.position.x).toEqual(manager.find(1).getPosition().x);
        expect(prediction2c.position.y).toEqual(manager.find(1).getPosition().y);
        expect(prediction2c.order).toEqual(manager.find(1).getOrder());
      });

      test('Node drag predict D', () => {
        const prediction2d = manager.predict(0, 1, { x: -50, y: -50 });
        expect(prediction2d.position.x).toEqual(manager.find(1).getPosition().x);
        expect(prediction2d.position.y).toEqual(manager.find(1).getPosition().y);
        expect(prediction2d.order).toEqual(manager.find(1).getOrder());
      });
    });

    describe('Predict 3', () => {
      beforeAll(() => {
        manager.disconnectNode(1);
        manager.connectNode(0, 1, 0);
        manager.addNode(2, TestSuite.NODE_SIZE, position).connectNode(0, 2, 2);
        manager.layout();
      });

      test('Node drag predict A', () => {
        const prediction3a = manager.predict(0, 1, { x: 50, y: 50 });
        expect(prediction3a.position.x).toEqual(manager.find(2).getPosition().x);
        expect(prediction3a.position.y).toBeGreaterThan(manager.find(2).getPosition().y);
        expect(prediction3a.order).toEqual(4);
      });

      test('Node drag predict B', () => {
        const prediction3b = manager.predict(0, 1, { x: 50, y: -50 });
        expect(prediction3b.position.x).toEqual(manager.find(1).getPosition().x);
        expect(prediction3b.position.y).toEqual(manager.find(1).getPosition().y);
        expect(prediction3b.order).toEqual(manager.find(1).getOrder());
      });

      test('Node drag predict C', () => {
        const prediction3c = manager.predict(0, 1, { x: -50, y: 50 });
        expect(prediction3c.position.x).toBeLessThan(manager.find(0).getPosition().x);
        expect(prediction3c.position.y).toEqual(manager.find(0).getPosition().y);
        expect(prediction3c.order).toEqual(1);
      });

      test('Node drag predict D', () => {
        const prediction3d = manager.predict(0, 1, { x: -50, y: -50 });
        expect(prediction3d.position.x).toBeLessThan(manager.find(0).getPosition().x);
        expect(prediction3d.position.y).toEqual(manager.find(0).getPosition().y);
        expect(prediction3d.order).toEqual(1);
      });

      test('Node drag predict E', () => {
        const prediction3e = manager.predict(0, 1, { x: 50, y: 0 });
        expect(prediction3e.position.x).toEqual(manager.find(1).getPosition().x);
        expect(prediction3e.position.y).toEqual(manager.find(1).getPosition().y);
        expect(prediction3e.order).toEqual(manager.find(1).getOrder());
      });
    });
  });
});
