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
import PositionType from '../../../src/components/PositionType';

const ROOT_NODE_SIZE = { width: 140, height: 90 };
const NODE_SIZE = { width: 80, height: 60 };
const ORIGIN = { x: 0, y: 0 };

/**
 * A drop is a predict followed by what DragTopicCommand does with it: detach
 * the node from its current parent, then connect it to the target parent with
 * the predicted order. The pivot drawn while dragging comes from the same
 * predict, so where the node lands must match where the preview showed it.
 */
const drop = (
  manager: LayoutManager,
  parentId: number,
  nodeId: number,
  position: PositionType,
): { order: number; position: PositionType } => {
  const predicted = manager.predict(parentId, nodeId, position);
  manager.disconnectNode(nodeId);
  manager.connectNode(parentId, nodeId, predicted.order);
  manager.layout();
  return predicted;
};

const pos = (manager: LayoutManager, id: number): PositionType => manager.find(id).getPosition();

/** Ids sorted top to bottom, i.e. the order the user sees them in. */
const byY = (manager: LayoutManager, ids: number[]): number[] =>
  [...ids].sort((a, b) => pos(manager, a).y - pos(manager, b).y);

/** Ids sorted left to right. */
const byX = (manager: LayoutManager, ids: number[]): number[] =>
  [...ids].sort((a, b) => pos(manager, a).x - pos(manager, b).x);

const between = (value: number, a: number, b: number): boolean =>
  value > Math.min(a, b) && value < Math.max(a, b);

const midY = (manager: LayoutManager, a: number, b: number): number =>
  (pos(manager, a).y + pos(manager, b).y) / 2;

const midX = (manager: LayoutManager, a: number, b: number): number =>
  (pos(manager, a).x + pos(manager, b).x) / 2;

describe('SymmetricSorter drag prediction', () => {
  /**
   * root
   * ├── 1 (top right)     └── 10
   * ├── 2 (middle right)  └── 20, 21, 22, 23
   * └── 3 (bottom right)  └── 30
   */
  const build = (): LayoutManager => {
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);
    manager.addNode(1, NODE_SIZE, ORIGIN).connectNode(0, 1, 0);
    manager.addNode(2, NODE_SIZE, ORIGIN).connectNode(0, 2, 2);
    manager.addNode(3, NODE_SIZE, ORIGIN).connectNode(0, 3, 4);
    manager.addNode(10, NODE_SIZE, ORIGIN).connectNode(1, 10, 0);
    [20, 21, 22, 23].forEach((id, order) => {
      manager.addNode(id, NODE_SIZE, ORIGIN).connectNode(2, id, order);
    });
    manager.addNode(30, NODE_SIZE, ORIGIN).connectNode(3, 30, 0);
    manager.layout();
    return manager;
  };

  it('lands a node from a parent above between the siblings it was dropped between', () => {
    const manager = build();
    // 10 hangs off a branch above 2, so its old y is above the drop point.
    expect(pos(manager, 10).y).toBeLessThan(pos(manager, 21).y);

    const dropAt = { x: pos(manager, 21).x, y: midY(manager, 21, 22) };
    const predicted = drop(manager, 2, 10, dropAt);

    expect(predicted.order).toBe(2);
    expect(byY(manager, [20, 21, 22, 23, 10])).toEqual([20, 21, 10, 22, 23]);
  });

  it('lands a node from a parent below between the siblings it was dropped between', () => {
    const manager = build();
    expect(pos(manager, 30).y).toBeGreaterThan(pos(manager, 22).y);

    const dropAt = { x: pos(manager, 21).x, y: midY(manager, 21, 22) };
    const predicted = drop(manager, 2, 30, dropAt);

    expect(predicted.order).toBe(2);
    expect(byY(manager, [20, 21, 22, 23, 30])).toEqual([20, 21, 30, 22, 23]);
  });

  it.each([
    // [dragged, after, before, expected order top to bottom]
    [20, 21, 22, [21, 20, 22, 23]],
    [20, 22, 23, [21, 22, 20, 23]],
    [23, 20, 21, [20, 23, 21, 22]],
    [22, 20, 21, [20, 22, 21, 23]],
    [21, 22, 23, [20, 22, 21, 23]],
  ])('moves %d within its own parent between %d and %d', (dragged, after, before, expected) => {
    const manager = build();
    const dropAt = { x: pos(manager, after).x, y: midY(manager, after, before) };

    drop(manager, 2, dragged, dropAt);

    expect(byY(manager, [20, 21, 22, 23])).toEqual(expected);
  });
});

describe('BalancedSorter drag prediction', () => {
  /**
   * Right side (even orders): 1, 2, 3, 4 at orders 0, 2, 4, 6.
   * Left side (odd orders): 5, 6 at orders 1, 3.
   */
  const build = (): LayoutManager => {
    const manager = new LayoutManager(0, ROOT_NODE_SIZE);
    manager.addNode(1, NODE_SIZE, ORIGIN).connectNode(0, 1, 0);
    manager.addNode(5, NODE_SIZE, ORIGIN).connectNode(0, 5, 1);
    manager.addNode(2, NODE_SIZE, ORIGIN).connectNode(0, 2, 2);
    manager.addNode(6, NODE_SIZE, ORIGIN).connectNode(0, 6, 3);
    manager.addNode(3, NODE_SIZE, ORIGIN).connectNode(0, 3, 4);
    manager.addNode(4, NODE_SIZE, ORIGIN).connectNode(0, 4, 6);
    manager.layout();
    return manager;
  };

  it('lands a root child dragged down its own side between the siblings it was dropped between', () => {
    const manager = build();
    const dropAt = { x: pos(manager, 3).x, y: midY(manager, 3, 4) };

    const predicted = drop(manager, 0, 1, dropAt);

    expect(predicted.order).toBe(4);
    expect(byY(manager, [1, 2, 3, 4])).toEqual([2, 3, 1, 4]);
    expect(manager.find(1).getOrder()).toBe(4);
  });

  it.each([
    // [dragged, after, before, expected order top to bottom]
    [1, 2, 3, [2, 1, 3, 4]],
    [2, 3, 4, [1, 3, 2, 4]],
    [4, 1, 2, [1, 4, 2, 3]],
    [3, 1, 2, [1, 3, 2, 4]],
  ])('moves %d on its own side between %d and %d', (dragged, after, before, expected) => {
    const manager = build();
    const dropAt = { x: pos(manager, after).x, y: midY(manager, after, before) };

    drop(manager, 0, dragged, dropAt);

    expect(byY(manager, [1, 2, 3, 4])).toEqual(expected);
  });

  it('moves a node to the bottom of its own side', () => {
    const manager = build();
    const dropAt = { x: pos(manager, 4).x, y: pos(manager, 4).y + 200 };

    drop(manager, 0, 1, dropAt);

    expect(byY(manager, [1, 2, 3, 4])).toEqual([2, 3, 4, 1]);
  });

  it('moves a node across to the other side between the siblings it was dropped between', () => {
    const manager = build();
    const dropAt = { x: pos(manager, 5).x, y: midY(manager, 5, 6) };

    drop(manager, 0, 1, dropAt);

    expect(byY(manager, [5, 6, 1])).toEqual([5, 1, 6]);
    expect(manager.find(1).getOrder()! % 2).toBe(1);
    expect(pos(manager, 1).x).toBeLessThan(0);
  });
});

describe('TreeSorter drag prediction', () => {
  /** Tree layout: root with children 1, 2, 3, 4 laid out left to right. */
  const build = (): LayoutManager => {
    const manager = new LayoutManager(0, ROOT_NODE_SIZE, 'tree');
    [1, 2, 3, 4].forEach((id, order) => {
      manager.addNode(id, NODE_SIZE, ORIGIN).connectNode(0, id, order);
    });
    manager.layout();
    return manager;
  };

  it('previews and lands child 0 between children 2 and 3', () => {
    const manager = build();
    const dropAt = { x: midX(manager, 3, 4), y: pos(manager, 3).y };
    const before = { three: pos(manager, 3).x, four: pos(manager, 4).x };

    const predicted = drop(manager, 0, 1, dropAt);

    // The pivot must sit between the two siblings it was dropped between ...
    expect(between(predicted.position.x, before.three, before.four)).toBe(true);
    // ... and the node must land there too.
    expect(predicted.order).toBe(2);
    expect(byX(manager, [1, 2, 3, 4])).toEqual([2, 3, 1, 4]);
  });

  it.each([
    // [dragged, after, before, expected order left to right]
    [1, 2, 3, [2, 1, 3, 4]],
    [4, 1, 2, [1, 4, 2, 3]],
    [3, 1, 2, [1, 3, 2, 4]],
    [2, 3, 4, [1, 3, 2, 4]],
  ])('moves %d between %d and %d', (dragged, after, before, expected) => {
    const manager = build();
    const dropAt = { x: midX(manager, after, before), y: pos(manager, after).y };

    drop(manager, 0, dragged, dropAt);

    expect(byX(manager, [1, 2, 3, 4])).toEqual(expected);
  });

  it('moves the first child past the last one', () => {
    const manager = build();
    const dropAt = { x: pos(manager, 4).x + 200, y: pos(manager, 4).y };

    const predicted = drop(manager, 0, 1, dropAt);

    expect(predicted.order).toBe(3);
    expect(byX(manager, [1, 2, 3, 4])).toEqual([2, 3, 4, 1]);
  });
});
