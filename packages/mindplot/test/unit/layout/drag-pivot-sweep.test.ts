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

/*
 * The mouse is swept, a pixel at a time, across the children of a topic while a node is dragged
 * over them. The order and the pivot the layout predicts must not jump when the mouse is exactly
 * at the centre of a child: there they are those of the pixel just above (or, in the tree, just
 * left), as everywhere else in the gap between two children.
 */
import { describe, expect, it } from '@jest/globals';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import PositionType from '../../../src/components/PositionType';

type Prediction = { order: number; position: PositionType };

const SIZE = { width: 60, height: 30 };

/**
 * 0 (root) ── 1 (right) ── 11, 12, 13: 30px high, so their branches are 40px and their centres
 *         │                            at y = -40, 0 and 40.
 *         └── 2 (left) ── 21, 22, 23   (mind map only)
 * With `secondRight`, 3 joins 1 on the right, below it.
 */
const build = (layoutType: 'mindmap' | 'tree' = 'mindmap', secondRight = false): LayoutManager => {
  const manager = new LayoutManager(0, SIZE, layoutType);
  const add = (id: number, parent: number, order: number) =>
    manager.addNode(id, SIZE, { x: 0, y: 0 }).connectNode(parent, id, order);
  add(1, 0, 0);
  add(2, 0, 1);
  add(11, 1, 0);
  add(12, 1, 1);
  add(13, 1, 2);
  if (layoutType === 'mindmap') {
    add(21, 2, 0);
    add(22, 2, 1);
    add(23, 2, 2);
  }
  if (secondRight) {
    add(3, 0, 2);
  }
  manager.layout(true);
  return manager;
};

const pos = (manager: LayoutManager, id: number): PositionType => manager.find(id).getPosition();

/** Predictions for every whole y from `from` to `to`, at the x of the children. */
const sweepY = (
  manager: LayoutManager,
  parentId: number,
  nodeId: number,
  x: number,
  from: number,
  to: number,
): Map<number, Prediction> => {
  const result = new Map<number, Prediction>();
  for (let y = from; y <= to; y++) {
    result.set(y, manager.predict(parentId, nodeId, { x, y }));
  }
  return result;
};

describe('SymmetricSorter.predict: no jump at the centre of a child', () => {
  it('has the children centred at -40, 0 and 40 under a parent at 0', () => {
    const manager = build();
    expect([11, 12, 13].map((id) => pos(manager, id).y)).toEqual([-40, 0, 40]);
    expect(pos(manager, 1).y).toBe(0);
  });

  it('dragging a node from another parent: order and pivot of the pixel above', () => {
    const manager = build();
    const { x } = pos(manager, 11);
    const sweep = sweepY(manager, 1, 2, x, -100, 100);

    // The reported case: between centres it was right, at them it fell back to "above the first".
    expect(sweep.get(4)).toEqual({ order: 2, position: { x, y: 20 } });
    expect(sweep.get(0)).toEqual({ order: 1, position: { x, y: -20 } });
    expect(sweep.get(40)).toEqual({ order: 2, position: { x, y: 20 } });
    // Above the first child, half a gap above it (option b): it was glued a whole gap away.
    expect(sweep.get(-40)).toEqual({ order: 0, position: { x, y: -60 } });

    [-40, 0, 40].forEach((centre) => {
      expect(sweep.get(centre)).toEqual(sweep.get(centre - 1));
    });

    // Down the sweep the order never goes back, and the pivot never goes up.
    const predictions = Array.from(sweep.values());
    predictions.slice(1).forEach((prediction, index) => {
      expect(prediction.order).toBeGreaterThanOrEqual(predictions[index].order);
      expect(prediction.position.y).toBeGreaterThanOrEqual(predictions[index].position.y);
    });
  });

  it.each([11, 12, 13])('dragging child %s among its siblings', (dragged) => {
    const manager = build();
    const { x } = pos(manager, 11);
    const sweep = sweepY(manager, 1, dragged, x, -100, 100);

    [-40, 0, 40].forEach((centre) => {
      expect(sweep.get(centre)).toEqual(sweep.get(centre - 1));
    });
  });

  it('dragging a child of another branch', () => {
    const manager = build();
    const { x } = pos(manager, 11);
    const sweep = sweepY(manager, 1, 22, x, -100, 100);

    [-40, 0, 40].forEach((centre) => {
      expect(sweep.get(centre)).toEqual(sweep.get(centre - 1));
    });
  });
});

describe('BalancedSorter.predict: no jump at the centre of a main topic', () => {
  it('order and pivot of the pixel above', () => {
    const manager = build('mindmap', true);
    const { x } = pos(manager, 1);
    const centres = [pos(manager, 1).y, pos(manager, 3).y];
    expect(centres.every(Number.isInteger)).toBe(true);
    const sweep = sweepY(manager, 0, 2, x, centres[0] - 60, centres[1] + 60);

    centres.forEach((centre) => {
      expect(sweep.get(centre)).toEqual(sweep.get(centre - 1));
    });
  });
});

describe('TreeSorter.predict: no jump at the centre of a child', () => {
  it('order and pivot of the pixel on the left', () => {
    const manager = build('tree');
    const centres = [11, 12, 13].map((id) => pos(manager, id).x);
    expect(centres.every(Number.isInteger)).toBe(true);
    const { y } = pos(manager, 11);

    centres.forEach((centre) => {
      const at = manager.predict(1, 2, { x: centre, y });
      const left = manager.predict(1, 2, { x: centre - 1, y });
      expect(at).toEqual(left);
    });
  });
});

/*
 * Option b (user decision, 2026-10-05): before the first child or after the last one, the pivot
 * is half a sibling gap away from it, as it is centred in the gap between two children. A child
 * without siblings counts the gap the layout leaves between two of its size. Only the pivot
 * moves: the drop order, and so the final layout, stay.
 */
describe('drag pivot before the first child and after the last one (option b)', () => {
  it('SymmetricSorter: half a gap above the first child, and below the last one', () => {
    const manager = build();
    const { x } = pos(manager, 11);

    expect(manager.predict(1, 2, { x, y: -90 })).toEqual({ order: 0, position: { x, y: -60 } });
    expect(manager.predict(1, 2, { x, y: 90 })).toEqual({ order: 3, position: { x, y: 60 } });
  });

  it('SymmetricSorter: a lone child counts the gap the layout leaves after it', () => {
    const manager = build();
    manager.removeNode(12);
    manager.removeNode(13);
    manager.layout(true);
    const { x, y } = pos(manager, 11);
    // A leaf of 30px takes 30 + 2 * 5: the next one would be 40px below.
    expect(manager.predict(1, 2, { x, y: y + 50 })).toEqual({
      order: 1,
      position: { x, y: y + 20 },
    });
    expect(manager.predict(1, 2, { x, y: y - 50 })).toEqual({
      order: 0,
      position: { x, y: y - 20 },
    });
  });

  it('BalancedSorter: half a gap above the first main topic, and below the last one', () => {
    const manager = build('mindmap', true);
    // Two children under 3, so the gap is not the 30 + 2 * 5 of a leaf.
    [31, 32].forEach((id, order) =>
      manager.addNode(id, SIZE, { x: 0, y: 0 }).connectNode(3, id, order),
    );
    manager.layout(true);
    const { x } = pos(manager, 1);
    const [first, last] = [pos(manager, 1).y, pos(manager, 3).y];
    const gap = last - first;
    expect(gap / 2).not.toBe(SIZE.height / 2 + 2 * 5);

    const above = manager.predict(0, 2, { x, y: first - 100 });
    const below = manager.predict(0, 2, { x, y: last + 100 });
    expect(above.position).toEqual({ x, y: first - gap / 2 });
    expect(below.position).toEqual({ x, y: last + gap / 2 });
    // The orders are those of before: on the right, first and after the last.
    expect(above.order).toBe(0);
    expect(below.order).toBe(4);
  });

  it('TreeSorter: half a gap left of the first child, and right of the last one', () => {
    const manager = build('tree');
    // Two children under 11 and 13, so the gap is not the 60 + 2 * 5 of a leaf.
    [111, 112, 131, 132].forEach((id) =>
      manager.addNode(id, SIZE, { x: 0, y: 0 }).connectNode(id < 130 ? 11 : 13, id, (id % 10) - 1),
    );
    manager.layout(true);
    const [first, , last] = [11, 12, 13].map((id) => pos(manager, id).x);
    const gap = pos(manager, 12).x - first;
    expect(gap / 2).not.toBe(SIZE.width / 2 + 5);
    const { y } = pos(manager, 11);

    const before = manager.predict(1, 2, { x: first - 100, y });
    const after = manager.predict(1, 2, { x: last + 100, y });
    expect(before).toEqual({ order: 0, position: { x: first - gap / 2, y } });
    expect(after).toEqual({ order: 3, position: { x: last + gap / 2, y } });
  });

  it('keeps the order monotonic and the pivot moving one way across a whole sweep', () => {
    const manager = build();
    const { x } = pos(manager, 11);
    const predictions = Array.from(sweepY(manager, 1, 2, x, -150, 150).values());
    predictions.slice(1).forEach((prediction, index) => {
      expect(prediction.order).toBeGreaterThanOrEqual(predictions[index].order);
      expect(prediction.position.y).toBeGreaterThanOrEqual(predictions[index].position.y);
    });

    const tree = build('tree');
    const { y } = pos(tree, 11);
    const xs = [11, 13].map((id) => pos(tree, id).x);
    let previous = tree.predict(1, 2, { x: xs[0] - 100, y });
    for (let mouseX = xs[0] - 99; mouseX <= xs[1] + 100; mouseX++) {
      const prediction = tree.predict(1, 2, { x: mouseX, y });
      expect(prediction.order).toBeGreaterThanOrEqual(previous.order);
      expect(prediction.position.x).toBeGreaterThanOrEqual(previous.position.x);
      previous = prediction;
    }
  });
});
