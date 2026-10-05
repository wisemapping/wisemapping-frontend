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
 * Golden positions: medium maps (bug3.wxml, 278 topics under the central one, and the 16 of
 * complex.wxml, which has collapsed branches) are laid out, then edited step by
 * step. After every step the position and order of every node, and the change events the layout
 * fired, are compared with a snapshot taken before the layout was made incremental. Any change
 * in where the layout puts a node, even below a pixel, fails it.
 */
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from '@jest/globals';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import ChangeEvent from '../../../src/components/layout/ChangeEvent';
import SizeType from '../../../src/components/SizeType';

type TreeNode = { id: number; text: string; shrink: boolean; children: TreeNode[] };

const readTree = (file: string): TreeNode => {
  const xml = fs.readFileSync(path.resolve(__dirname, '../export/input', file), 'utf8');
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const toNode = (element: Element): TreeNode => ({
    id: Number(element.getAttribute('id')),
    text: element.getAttribute('text') ?? '',
    shrink: element.getAttribute('shrink') === 'true',
    children: Array.from(element.children)
      .filter((child) => child.tagName === 'topic')
      .map(toNode),
  });
  const central = Array.from(doc.documentElement.children).find(
    (element) => element.tagName === 'topic' && element.getAttribute('central') === 'true',
  );
  if (!central) {
    throw new Error(`${file} has no central topic`);
  }
  return toNode(central);
};

// Fractional sizes, so that branch heights and offsets are not whole pixels either.
const sizeOf = (node: TreeNode): SizeType => ({
  width: 30 + node.text.length * 6.25,
  height: 18.5 + (node.id % 3) * 7.25,
});

type Step = {
  step: string;
  // The ids of the nodes the layout fired a change event for, in firing order.
  events: string;
  // "id x y order", one string per node, to keep the snapshot readable. Every node after the
  // first step; after the others, only the nodes that moved, changed order,
  // came or went since the step before.
  nodes: string[];
};

const buildScenario = (file: string, layoutType: 'mindmap' | 'tree') => {
  const tree = readTree(file);
  const ids: number[] = [];
  const parentOf = new Map<number, number>();
  const manager = new LayoutManager(tree.id, sizeOf(tree), layoutType);
  ids.push(tree.id);

  const add = (parent: TreeNode, child: TreeNode, order: number) => {
    manager.addNode(child.id, sizeOf(child), { x: 0, y: 0 });
    manager.connectNode(parent.id, child.id, order);
    parentOf.set(child.id, parent.id);
    ids.push(child.id);
    child.children.forEach((grandChild, index) => add(child, grandChild, index));
    if (child.shrink) {
      manager.updateShrinkState(child.id, true);
    }
  };
  tree.children.forEach((child, index) => add(tree, child, index));

  let events: ChangeEvent[] = [];
  manager.addEvent('change', (event: ChangeEvent) => events.push(event));

  const steps: Step[] = [];
  let previous = new Map<number, string>();
  const record = (step: string) => {
    manager.layout(true);
    const current = new Map<number, string>();
    ids.forEach((id) => {
      const node = manager.find(id);
      current.set(id, `${id} ${node.getPosition().x} ${node.getPosition().y} ${node.getOrder()}`);
    });
    const changed = Array.from(current.entries())
      .filter(([id, line]) => previous.get(id) !== line)
      .map(([, line]) => line);
    const gone = Array.from(previous.keys())
      .filter((id) => !current.has(id))
      .map((id) => `${id} removed`);
    steps.push({
      step,
      // An event carries the position and order of its node, which are in `nodes`.
      events: events.map((event) => event.getId()).join(' '),
      nodes: [...changed, ...gone],
    });
    previous = current;
    events = [];
  };

  const remove = (id: number) => {
    const removed = new Set<number>([id]);
    let grew = true;
    while (grew) {
      const before = removed.size;
      parentOf.forEach((parent, child) => {
        if (removed.has(parent)) {
          removed.add(child);
        }
      });
      grew = removed.size > before;
    }
    manager.removeNode(id);
    removed.forEach((removedId) => {
      ids.splice(ids.indexOf(removedId), 1);
      parentOf.delete(removedId);
    });
  };

  const childrenOf = (id: number): number[] =>
    ids
      .filter((candidate) => parentOf.get(candidate) === id)
      .sort((a, b) => (manager.find(a).getOrder() ?? 0) - (manager.find(b).getOrder() ?? 0));

  const reconnect = (id: number, parentId: number, order: number) => {
    manager.disconnectNode(id);
    manager.connectNode(parentId, id, order);
    parentOf.set(id, parentId);
  };

  return { manager, tree, steps, record, remove, childrenOf, reconnect, ids, parentOf };
};

const run = (file: string, layoutType: 'mindmap' | 'tree'): Step[] => {
  const scenario = buildScenario(file, layoutType);
  const { manager, tree, record, remove, childrenOf, reconnect, parentOf } = scenario;
  const resize = (id: number, dw: number, dh: number) => {
    const size = manager.find(id).getSize();
    manager.updateNodeSize(id, { width: size.width + dw, height: size.height + dh });
  };

  // A node with children, and one of its children that has children too.
  const withChildren = (id: number) => childrenOf(id).length > 0;
  const branch = childrenOf(tree.id).find(withChildren)!;
  const subBranch = childrenOf(branch).find(withChildren) ?? childrenOf(branch)[0];
  const leaf = childrenOf(subBranch)[0] ?? subBranch;

  record('initial layout');
  record('layout again, nothing changed');

  resize(branch, 40, 20);
  record('a branch grows');

  resize(leaf, 0, 1);
  record('a leaf grows by one pixel');
  resize(leaf, 0, 1);
  record('the leaf grows by one more pixel');
  record('layout again after sub-pixel moves');

  resize(subBranch, 35, 0);
  record('a node with children gets wider only');

  manager.addNode(9001, { width: 77.5, height: 33.25 }, { x: 0, y: 0 });
  manager.connectNode(leaf, 9001, 0);
  parentOf.set(9001, leaf);
  scenario.ids.push(9001);
  record('a child is added under the leaf');

  manager.addNode(9002, { width: 50, height: 90 }, { x: 0, y: 0 });
  manager.connectNode(9001, 9002, 0);
  parentOf.set(9002, 9001);
  scenario.ids.push(9002);
  record('a tall grandchild is added');

  const siblings = childrenOf(branch);
  reconnect(siblings[siblings.length - 1], branch, 0);
  record('the last child of the branch moves first');

  reconnect(subBranch, childrenOf(tree.id).filter((id) => id !== branch)[0], 0);
  record('a sub-branch moves to another branch');

  const rootChildren = childrenOf(tree.id);
  reconnect(rootChildren[0], tree.id, 1);
  record('a main topic changes side');

  manager.updateShrinkState(branch, true);
  record('a branch is collapsed');
  manager.updateShrinkState(branch, false);
  record('the branch is expanded');

  const lastOfBranch = childrenOf(branch)[childrenOf(branch).length - 1];
  remove(lastOfBranch);
  record('the last child of the branch is removed');

  remove(9002);
  record('the tall grandchild is removed');

  const someChild = childrenOf(childrenOf(tree.id).find(withChildren)!)[0];
  manager.moveNode(someChild, { x: 1234.5, y: -987.25 });
  record('a node is moved by hand');

  resize(tree.id, 20, 10);
  record('the central topic grows');

  manager.setLayoutType(layoutType === 'mindmap' ? 'tree' : 'mindmap');
  record('layout switched');
  resize(leaf, 25, 0);
  record('a leaf gets wider after the switch');
  resize(subBranch, 0, 12);
  record('a node gets taller after the switch');
  manager.setLayoutType(layoutType);
  record('layout switched back');
  record('layout again at the end');

  return scenario.steps;
};

describe.each(['complex.wxml', 'bug3.wxml'])('layout golden positions (%s)', (file) => {
  it('mind map: every node lands where it did before the layout was incremental', () => {
    expect(run(file, 'mindmap')).toMatchSnapshot();
  });

  it('tree: every node lands where it did before the layout was incremental', () => {
    expect(run(file, 'tree')).toMatchSnapshot();
  });
});
