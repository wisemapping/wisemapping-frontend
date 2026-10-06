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
 * The work a layout pass does, counted. A pass used to measure every branch again for each of
 * its ancestors, and to walk the whole branch of every child it placed, even one already in
 * place. bug3.wxml has 278 topics under the central one; before, a pass that changed nothing
 * measured 1511 branches (mind map) or 1511 (tree: 278 heights, 1233 widths), and walked 956
 * nodes through shiftBranchPosition after 277 updateBranchPosition calls.
 */
import fs from 'fs';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import AbstractBasicSorter from '../../../src/components/layout/AbstractBasicSorter';
import TreeSorter from '../../../src/components/layout/TreeSorter';
import RootedTreeSet from '../../../src/components/layout/RootedTreeSet';
import type { LayoutType } from '../../../src/components/layout/LayoutType';

type TreeNode = { id: number; text: string; children: TreeNode[] };

const readTree = (file: string): TreeNode => {
  const xml = fs.readFileSync(path.resolve(__dirname, '../export/input', file), 'utf8');
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const toNode = (element: Element): TreeNode => ({
    id: Number(element.getAttribute('id')),
    text: element.getAttribute('text') ?? '',
    children: Array.from(element.children)
      .filter((child) => child.tagName === 'topic')
      .map(toNode),
  });
  const central = Array.from(doc.documentElement.children).find(
    (element) => element.getAttribute('central') === 'true',
  )!;
  return toNode(central);
};

const build = (layoutType: LayoutType) => {
  const tree = readTree('bug3.wxml');
  const manager = new LayoutManager(tree.id, { width: 100, height: 30 }, layoutType);
  const ids: number[] = [tree.id];
  const add = (parent: TreeNode, child: TreeNode, order: number) => {
    manager.addNode(child.id, { width: 20 + child.text.length * 6, height: 20 }, { x: 0, y: 0 });
    manager.connectNode(parent.id, child.id, order);
    ids.push(child.id);
    child.children.forEach((grandChild, index) => add(child, grandChild, index));
  };
  tree.children.forEach((child, index) => add(tree, child, index));
  return { manager, tree, ids };
};

describe('layout pass work (bug3.wxml, 278 topics)', () => {
  let heights: jest.SpiedFunction<AbstractBasicSorter['_computeChildrenHeight']>;
  let widths: jest.SpiedFunction<(...args: unknown[]) => number>;
  let updates: jest.SpiedFunction<RootedTreeSet['updateBranchPosition']>;
  let shifts: jest.SpiedFunction<RootedTreeSet['shiftBranchPosition']>;

  beforeEach(() => {
    heights = jest.spyOn(AbstractBasicSorter.prototype, '_computeChildrenHeight');
    widths = jest.spyOn(
      TreeSorter.prototype as unknown as { _computeChildrenWidth: (...args: unknown[]) => number },
      '_computeChildrenWidth',
    );
    updates = jest.spyOn(RootedTreeSet.prototype, 'updateBranchPosition');
    shifts = jest.spyOn(RootedTreeSet.prototype, 'shiftBranchPosition');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const work = (pass: () => void) => {
    [heights, widths, updates, shifts].forEach((spy) => spy.mockClear());
    pass();
    return {
      measured: heights.mock.calls.length + widths.mock.calls.length,
      moved: updates.mock.calls.length + shifts.mock.calls.length,
    };
  };

  it.each(['mindmap', 'tree'] as LayoutType[])(
    '%s: a pass that changes nothing measures each branch once and moves nothing',
    (layoutType) => {
      const { manager, ids } = build(layoutType);
      manager.layout(true);

      const { measured, moved } = work(() => manager.layout(true));

      // Before: 1511 branches measured, 277 + 956 branch moves and walks.
      expect(measured).toBe(ids.length);
      expect(moved).toBe(0);
    },
  );

  it.each(['mindmap', 'tree'] as LayoutType[])(
    '%s: a change that moves one leaf walks that leaf only',
    (layoutType) => {
      const { manager, tree, ids } = build(layoutType);
      manager.layout(true);

      // A leaf deep in the first branch. Across the axis its siblings are laid out on (wider in
      // the mind map, taller in the tree) it moves, and nothing else does.
      let leaf = tree.children[0]!;
      while (leaf.children.length > 0) {
        leaf = leaf.children[0]!;
      }
      const size = manager.find(leaf.id).getSize();
      manager.updateNodeSize(
        leaf.id,
        layoutType === 'mindmap'
          ? { width: size.width + 100, height: size.height }
          : { width: size.width, height: size.height + 100 },
      );
      const events: number[] = [];
      manager.addEvent('change', (event: { getId(): number }) => events.push(event.getId()));
      const { measured, moved } = work(() => manager.layout(true));

      expect(events).toEqual([leaf.id]);
      // Before: 1511 branches measured and 277 + 956 moves and walks.
      expect(measured).toBe(ids.length);
      expect(moved).toBe(1);
    },
  );
});

describe('tree layout, incremental', () => {
  const fresh = (grandChildWidth: number) => {
    const manager = new LayoutManager(0, { width: 100, height: 30 }, 'tree');
    // 0 ── 1 ── 11, 12, 13
    //   ├─ 2
    //   └─ 3 ── 31
    manager.addNode(1, { width: 60, height: 20 }, { x: 0, y: 0 }).connectNode(0, 1, 0);
    manager.addNode(2, { width: 60, height: 20 }, { x: 0, y: 0 }).connectNode(0, 2, 1);
    manager.addNode(3, { width: 60, height: 20 }, { x: 0, y: 0 }).connectNode(0, 3, 2);
    manager.addNode(11, { width: 50, height: 20 }, { x: 0, y: 0 }).connectNode(1, 11, 0);
    manager.addNode(12, { width: grandChildWidth, height: 20 }, { x: 0, y: 0 });
    manager.connectNode(1, 12, 1);
    manager.addNode(13, { width: 50, height: 20 }, { x: 0, y: 0 }).connectNode(1, 13, 2);
    manager.addNode(31, { width: 50, height: 20 }, { x: 0, y: 0 }).connectNode(3, 31, 0);
    manager.layout(true);
    return manager;
  };

  const ids = [0, 1, 2, 3, 11, 12, 13, 31];
  const positions = (manager: LayoutManager) => ids.map((id) => manager.find(id).getPosition());

  it('widening a grandchild re-centres its siblings and the branches next to it', () => {
    const manager = fresh(50);
    const before = positions(manager);

    manager.updateNodeSize(12, { width: 400, height: 20 });
    manager.layout(true);

    // Exactly where a layout from scratch puts them ...
    expect(positions(manager)).toEqual(positions(fresh(400)));

    // ... which is: the wide grandchild pushes its siblings apart, without overlapping them ...
    const x = (id: number) => manager.find(id).getPosition().x;
    const halfWidth = (id: number) => manager.find(id).getSize().width / 2;
    expect(x(12) - halfWidth(12)).toBeGreaterThanOrEqual(x(11) + halfWidth(11));
    expect(x(13) - halfWidth(13)).toBeGreaterThanOrEqual(x(12) + halfWidth(12));
    // ... keeps them centred under their parent ...
    expect(x(12)).toBeCloseTo(x(1), 6);
    expect((x(11) + x(13)) / 2).toBeCloseTo(x(1), 6);
    // ... and moves the next branches out of the way.
    expect(x(2) - halfWidth(2)).toBeGreaterThanOrEqual(x(13) + halfWidth(13));
    expect(x(2)).toBeGreaterThan(before[ids.indexOf(2)]!.x);
    expect(x(31)).toBe(x(3));
  });

  it('narrowing it back puts every node back where it was', () => {
    const manager = fresh(50);
    const before = positions(manager);

    manager.updateNodeSize(12, { width: 400, height: 20 });
    manager.layout(true);
    manager.updateNodeSize(12, { width: 50, height: 20 });
    manager.layout(true);

    expect(positions(manager)).toEqual(before);
  });
});
