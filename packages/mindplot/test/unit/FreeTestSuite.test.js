import '../../../../libraries/mootools-core-1.4.5';
import TestSuite from './TestSuite';
import LayoutManager from '../../src/components/layout/LayoutManager';

expect.extend({
  toNotBeBranchesOverlap(received, expected) {
    const a = received;
    const b = expected;
    if (a[0] <= b[1] || a[1] >= b[0]) {
      return {
        message: 'Success',
        pass: true,
      };
    }
    return {
      message: 'Error',
      pass: false,
    };
  },
});

describe('Free Test Suite', () => {
  function branchesOverlap(branchA, branchB, heightById) {
    const topA = branchA.getPosition().y - heightById[branchA.getId()] / 2;
    const bottomA = branchA.getPosition().y + heightById[branchA.getId()] / 2;
    const topB = branchB.getPosition().y - heightById[branchB.getId()] / 2;
    const bottomB = branchB.getPosition().y + heightById[branchB.getId()] / 2;

    test('Not be Branches Overlap', () => {
      expect([bottomA, topA]).toNotBeBranchesOverlap([bottomB, topB]);
    });
  }

  function branchCollision(treeSet, node, heightById) {
    const children = treeSet.getChildren(node);
    const childOfRootNode = treeSet._rootNodes.contains(node);

    children.forEach(((child) => {
      let siblings = treeSet.getSiblings(child);
      if (childOfRootNode) {
        siblings = siblings
          .filter((sibling) => (child.getOrder() % 2) === (sibling.getOrder() % 2));
      }

      siblings.forEach(((sibling) => {
        branchesOverlap(child, sibling, heightById);
      }));
    }));

    children.forEach((child) => {
      branchCollision(treeSet, child, heightById);
    }, this);
  }

  describe('avoidCollisionTree1Test', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    // Prepare a sample graph ...
    manager.addNode(1, TestSuite.NODE_SIZE, position);
    manager.addNode(2, TestSuite.NODE_SIZE, position);
    manager.addNode(3, TestSuite.NODE_SIZE, position);
    manager.addNode(4, TestSuite.NODE_SIZE, position);
    manager.addNode(5, TestSuite.NODE_SIZE, position);
    manager.addNode(6, TestSuite.NODE_SIZE, position);
    manager.addNode(7, TestSuite.NODE_SIZE, position);
    manager.addNode(8, TestSuite.NODE_SIZE, position);
    manager.addNode(9, TestSuite.NODE_SIZE, position);
    manager.addNode(10, TestSuite.NODE_SIZE, position);
    manager.addNode(11, TestSuite.NODE_SIZE, position);
    manager.addNode(12, TestSuite.NODE_SIZE, position);
    manager.addNode(13, TestSuite.NODE_SIZE, position);
    manager.addNode(14, TestSuite.NODE_SIZE, position);
    manager.addNode(15, TestSuite.NODE_SIZE, position);
    manager.addNode(16, TestSuite.NODE_SIZE, position);
    manager.addNode(17, TestSuite.NODE_SIZE, position);
    manager.addNode(18, TestSuite.NODE_SIZE, position);
    manager.addNode(19, TestSuite.NODE_SIZE, position);
    manager.addNode(20, TestSuite.NODE_SIZE, position);
    manager.addNode(21, TestSuite.NODE_SIZE, position);
    manager.addNode(22, TestSuite.NODE_SIZE, position);
    manager.addNode(23, TestSuite.NODE_SIZE, position);
    manager.addNode(24, TestSuite.NODE_SIZE, position);
    manager.addNode(25, TestSuite.NODE_SIZE, position);
    manager.addNode(26, TestSuite.NODE_SIZE, position);

    manager.connectNode(0, 1, 0).connectNode(0, 2, 1).connectNode(0, 3, 2).connectNode(0, 4, 3);
    manager.connectNode(4, 21, 0).connectNode(4, 22, 0);
    manager.connectNode(1, 5, 0).connectNode(1, 23, 0).connectNode(23, 24, 0).connectNode(24, 25, 0)
      .connectNode(24, 26, 0);
    manager.connectNode(5, 6, 0).connectNode(6, 8, 0).connectNode(8, 9, 0);
    manager.connectNode(5, 7, 1).connectNode(7, 10, 0);
    manager.connectNode(3, 11, 0).connectNode(11, 14, 0)
      .connectNode(14, 18, 0).connectNode(14, 19, 1)
      .connectNode(14, 20, 2);
    manager.connectNode(3, 12, 1).connectNode(12, 15, 0)
      .connectNode(12, 16, 1).connectNode(12, 17, 2);
    manager.connectNode(3, 13, 2);

    manager.layout(true);

    const treeSet = manager._treeSet;
    treeSet._rootNodes.forEach(((rootNode) => {
      const heightById = rootNode.getSorter().computeChildrenIdByHeights(treeSet, rootNode);
      branchCollision(treeSet, rootNode, heightById);
    }));
  });

  describe('avoidCollisionTree2Test - FAILING, commented test', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    // Prepare a sample graph ...
    manager.addNode(1, TestSuite.NODE_SIZE, position);
    manager.addNode(2, TestSuite.NODE_SIZE, position);
    manager.addNode(3, TestSuite.NODE_SIZE, position);
    manager.addNode(4, TestSuite.NODE_SIZE, position);
    manager.addNode(5, TestSuite.NODE_SIZE, position);
    manager.addNode(6, TestSuite.NODE_SIZE, position);
    manager.addNode(7, TestSuite.NODE_SIZE, position);
    manager.addNode(8, TestSuite.NODE_SIZE, position);
    manager.addNode(9, TestSuite.NODE_SIZE, position);
    manager.addNode(10, TestSuite.NODE_SIZE, position);
    manager.addNode(11, TestSuite.NODE_SIZE, position);
    manager.addNode(12, TestSuite.NODE_SIZE, position);
    manager.addNode(13, TestSuite.NODE_SIZE, position);
    manager.addNode(14, TestSuite.NODE_SIZE, position);
    manager.addNode(15, TestSuite.NODE_SIZE, position);
    manager.addNode(16, TestSuite.NODE_SIZE, position);
    manager.addNode(17, TestSuite.NODE_SIZE, position);
    manager.addNode(18, TestSuite.NODE_SIZE, position);
    manager.addNode(19, TestSuite.NODE_SIZE, position);
    manager.addNode(20, TestSuite.NODE_SIZE, position);
    manager.addNode(21, TestSuite.NODE_SIZE, position);
    manager.addNode(22, TestSuite.NODE_SIZE, position);

    manager.connectNode(0, 1, 0).connectNode(0, 2, 1).connectNode(0, 3, 2).connectNode(0, 4, 3);
    manager.connectNode(4, 21, 0).connectNode(4, 22, 0);
    manager.connectNode(1, 5, 0);
    manager.connectNode(5, 6, 0).connectNode(6, 8, 0).connectNode(8, 9, 0);
    manager.connectNode(5, 7, 1).connectNode(7, 10, 0);
    manager.connectNode(3, 11, 0).connectNode(11, 14, 0)
      .connectNode(14, 18, 0).connectNode(14, 19, 1)
      .connectNode(14, 20, 2);
    manager.connectNode(3, 12, 1).connectNode(12, 15, 0)
      .connectNode(12, 16, 1).connectNode(12, 17, 2);
    manager.connectNode(3, 13, 2);

    manager.layout(true);

    const treeSet = manager._treeSet;
    treeSet._rootNodes.forEach(((rootNode) => {
      const heightById = rootNode.getSorter().computeChildrenIdByHeights(treeSet, rootNode);
      // FIXME: uncoment this line when bug is fixed, branchCollision(treeSet, rootNode, heightById);
    }));
  });

  describe('predict test', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    // Prepare a sample graph ...
    manager.addNode(1, TestSuite.NODE_SIZE, position);
    manager.addNode(2, TestSuite.NODE_SIZE, position);
    manager.addNode(3, TestSuite.NODE_SIZE, position);
    manager.addNode(4, TestSuite.NODE_SIZE, position);
    manager.addNode(5, TestSuite.NODE_SIZE, position);
    manager.addNode(6, TestSuite.NODE_SIZE, position);
    manager.addNode(7, TestSuite.NODE_SIZE, position);
    manager.addNode(8, TestSuite.NODE_SIZE, position);
    manager.addNode(9, TestSuite.NODE_SIZE, position);
    manager.addNode(10, TestSuite.NODE_SIZE, position);
    manager.addNode(11, TestSuite.NODE_SIZE, position);

    manager.connectNode(0, 1, 0);
    manager.connectNode(0, 2, 1);
    manager.connectNode(0, 3, 2);
    manager.connectNode(3, 4, 0);
    manager.connectNode(3, 5, 1);
    manager.connectNode(3, 6, 2);
    manager.connectNode(5, 7, 0);
    manager.connectNode(5, 8, 1);
    manager.connectNode(5, 11, 2);
    manager.connectNode(2, 9, 0);
    manager.connectNode(2, 10, 1);

    manager.layout();

    test('Predict 1', () => {
      const pos1 = { x: 370, y: 80 };
      const predict1 = manager.predict(5, 11, pos1, true);
      expect(predict1.position.x).toEqual(pos1.x);
      expect(predict1.position.y).toEqual(pos1.y);
    });

    test('Predict 2', () => {
      const pos2 = { x: -200, y: 80 };
      const predict2 = manager.predict(0, 2, pos2, true);
      expect(predict2.position.x).toEqual(pos2.x);
      expect(predict2.position.y).toEqual(pos2.y);
    });

    test('Predict 3', () => {
      const pos3 = { x: 200, y: 30 };
      const node5 = manager.find(5);
      const predict3 = manager.predict(3, 5, pos3, true);
      expect(predict3.position.x).toEqual(node5.getPosition().x);
      expect(predict3.position.y).toEqual(pos3.y);
    });

    test('Predict 4', () => {
      const pos4 = { x: -100, y: 45 };
      const node10 = manager.find(10);
      const predict4 = manager.predict(2, 10, pos4, true);
      expect(predict4.position.x).toEqual(node10.getPosition().x);
      expect(predict4.position.y).toEqual(pos4.y);
    });
  });

  describe('reconnect node test', () => {
    const position = { x: 0, y: 0 };
    const manager = new LayoutManager(0, TestSuite.ROOT_NODE_SIZE);

    // Prepare a sample graph ...
    manager.addNode(1, TestSuite.NODE_SIZE, position);
    manager.addNode(2, TestSuite.NODE_SIZE, position);
    manager.addNode(3, TestSuite.NODE_SIZE, position);
    manager.addNode(4, TestSuite.NODE_SIZE, position);
    manager.addNode(5, TestSuite.NODE_SIZE, position);
    manager.addNode(6, TestSuite.NODE_SIZE, position);
    manager.addNode(7, TestSuite.NODE_SIZE, position);
    manager.addNode(8, TestSuite.NODE_SIZE, position);
    manager.addNode(9, TestSuite.NODE_SIZE, position);
    manager.addNode(10, TestSuite.NODE_SIZE, position);
    manager.addNode(11, TestSuite.NODE_SIZE, position);

    manager.connectNode(0, 1, 0);
    manager.connectNode(0, 2, 1);
    manager.connectNode(0, 3, 2);
    manager.connectNode(3, 4, 0);
    manager.connectNode(3, 5, 1);
    manager.connectNode(3, 6, 2);
    manager.connectNode(5, 7, 0);
    manager.connectNode(5, 8, 1);
    manager.connectNode(5, 11, 2);
    manager.connectNode(2, 9, 0);
    manager.connectNode(2, 10, 1);
    manager.layout();

    test('Reconnect Node', () => {
      manager.disconnectNode(5);
      manager.connectNode(2, 5, 2);
      manager.layout();

      expect(manager.find(5).getPosition().y).toBeGreaterThan(manager.find(10).getPosition().y);
      expect(manager.find(5).getPosition().x).toEqual(manager.find(10).getPosition().x);
      expect(manager.find(5).getOrder()).toEqual(2);

      manager.disconnectNode(5);
      manager.connectNode(10, 5, 0);
      manager.layout();

      expect(manager.find(5).getPosition().y).toEqual(manager.find(10).getPosition().y);
      expect(manager.find(5).getPosition().x).toBeLessThan(manager.find(10).getPosition().x);
      expect(manager.find(5).getOrder()).toEqual(0);

      manager.disconnectNode(5);
      manager.connectNode(3, 5, 2);
      manager.layout();

      expect(manager.find(5).getPosition().y).toBeGreaterThan(manager.find(6).getPosition().y);
      expect(manager.find(5).getPosition().x).toEqual(manager.find(6).getPosition().x);
      expect(manager.find(5).getOrder()).toEqual(2);
    });
  });
});
