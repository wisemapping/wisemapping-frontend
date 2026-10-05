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

import { afterEach, describe, expect, it, jest } from '@jest/globals';
import Node from '../../../src/components/layout/Node';
import RootedTreeSet from '../../../src/components/layout/RootedTreeSet';
import SymmetricSorter from '../../../src/components/layout/SymmetricSorter';
import PositionType from '../../../src/components/PositionType';

const SIZE = { width: 80, height: 20 };
const sorter = new SymmetricSorter();

const tree = (positions: Record<number, PositionType>, edges: [number, number][]) => {
  const treeSet = new RootedTreeSet();
  const ids = Object.keys(positions).map(Number);
  treeSet.setRoot(new Node(ids[0], SIZE, positions[ids[0]], sorter));
  ids.slice(1).forEach((id) => treeSet.add(new Node(id, SIZE, positions[id], sorter)));
  edges.forEach(([parent, child]) => treeSet.connect(parent, child));
  return treeSet;
};

describe('RootedTreeSet.updateBranchPosition (BL5-80)', () => {
  it('moves the descendants along with the node, by the same amount', () => {
    const treeSet = tree({ 0: { x: 0, y: 0 }, 1: { x: 100, y: 0 }, 2: { x: 200, y: 10 } }, [
      [0, 1],
      [1, 2],
    ]);

    treeSet.updateBranchPosition(treeSet.find(1), { x: 110, y: 20 });

    expect(treeSet.find(1).getPosition()).toEqual({ x: 110, y: 20 });
    // Before: shifted by old - new, the other way: (190, -10).
    expect(treeSet.find(2).getPosition()).toEqual({ x: 210, y: 30 });
  });

  it('moves the descendants by what the node really moved', () => {
    const treeSet = tree({ 0: { x: 0, y: 0 }, 1: { x: 100, y: 0 }, 2: { x: 200, y: 0 } }, [
      [0, 1],
      [1, 2],
    ]);

    // Half a pixel or less: the node does not move (Node.setPosition), so neither does its branch.
    treeSet.updateBranchPosition(treeSet.find(1), { x: 100.4, y: 0.4 });

    expect(treeSet.find(1).getPosition()).toEqual({ x: 100, y: 0 });
    expect(treeSet.find(2).getPosition()).toEqual({ x: 200, y: 0 });
  });
});

describe('RootedTreeSet.getBranchesInVerticalDirection (BL5-96)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Central 0; on the right, branches 1, 2 and 3 (orders 0, 2, 4), on the left 4 (order 1).
  // Branch 2 holds 20 then 21, the node looked up; branch 1 holds 100 more nodes.
  const build = () => {
    const positions: Record<number, PositionType> = {
      0: { x: 0, y: 0 },
      1: { x: 100, y: -100 },
      2: { x: 100, y: 0 },
      3: { x: 100, y: 100 },
      4: { x: -100, y: 0 },
      20: { x: 200, y: 0 },
      21: { x: 300, y: 0 },
    };
    const edges: [number, number][] = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [2, 20],
      [20, 21],
    ];
    for (let id = 1000; id < 1100; id++) {
      positions[id] = { x: 200, y: -100 };
      edges.push([1, id]);
    }
    const treeSet = tree(positions, edges);
    Object.entries({ 1: 0, 4: 1, 2: 2, 3: 4 }).forEach(([id, order]) =>
      treeSet.find(Number(id)).setOrder(order),
    );
    return treeSet;
  };

  it('finds the branches of the root on the side of the node, in the direction of the offset', () => {
    const treeSet = build();
    const node = treeSet.find(21);

    expect(treeSet.getBranchesInVerticalDirection(node, -10).map((n) => n.getId())).toEqual([1]);
    expect(treeSet.getBranchesInVerticalDirection(node, 10).map((n) => n.getId())).toEqual([3]);
  });

  it('walks up from the node instead of searching every branch of the root', () => {
    const treeSet = build();
    const node = treeSet.find(21);
    const getId = jest.spyOn(Node.prototype, 'getId');

    treeSet.getBranchesInVerticalDirection(node, -10);

    // Before: searched branch 1, all of its 100 children, then branch 2 down to the node.
    expect(getId.mock.calls.length).toBeLessThan(10);
  });
});
