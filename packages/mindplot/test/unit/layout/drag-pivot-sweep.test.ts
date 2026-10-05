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
    const x = pos(manager, 11).x;
    const sweep = sweepY(manager, 1, 2, x, -100, 100);

    // The reported case: between centres it was right, at them it fell back to "above the first".
    expect(sweep.get(4)).toEqual({ order: 2, position: { x, y: 20 } });
    expect(sweep.get(0)).toEqual({ order: 1, position: { x, y: -20 } });
    expect(sweep.get(40)).toEqual({ order: 2, position: { x, y: 20 } });
    expect(sweep.get(-40)).toEqual({ order: 0, position: { x, y: -80 } });

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
    const x = pos(manager, 11).x;
    const sweep = sweepY(manager, 1, dragged, x, -100, 100);

    [-40, 0, 40].forEach((centre) => {
      expect(sweep.get(centre)).toEqual(sweep.get(centre - 1));
    });
  });

  it('dragging a child of another branch', () => {
    const manager = build();
    const x = pos(manager, 11).x;
    const sweep = sweepY(manager, 1, 22, x, -100, 100);

    [-40, 0, 40].forEach((centre) => {
      expect(sweep.get(centre)).toEqual(sweep.get(centre - 1));
    });
  });
});

describe('BalancedSorter.predict: no jump at the centre of a main topic', () => {
  it('order and pivot of the pixel above', () => {
    const manager = build('mindmap', true);
    const x = pos(manager, 1).x;
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
    const y = pos(manager, 11).y;

    centres.forEach((centre) => {
      const at = manager.predict(1, 2, { x: centre, y });
      const left = manager.predict(1, 2, { x: centre - 1, y });
      expect(at).toEqual(left);
    });
  });
});
