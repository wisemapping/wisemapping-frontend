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
import Node from '../../../src/components/layout/Node';
import RootedTreeSet, { RaphaelPaper } from '../../../src/components/layout/RootedTreeSet';
import SymmetricSorter from '../../../src/components/layout/SymmetricSorter';

const SIZE = { width: 80, height: 20 };
const sorter = new SymmetricSorter();
const node = (id: number, x = 0, y = 0) => new Node(id, SIZE, { x, y }, sorter);
const ids = (nodes: Node[]) => nodes.map((n) => n.getId());

/**
 * 0
 * ├── 1
 * │   └── 3
 * │       └── 4
 * └── 2
 * 5 (isolated)
 */
const build = () => {
  const set = new RootedTreeSet();
  set.setRoot(node(0));
  [1, 2, 3, 4, 5].forEach((id) => set.add(node(id, id * 10, id)));
  set.connect(0, 1);
  set.connect(0, 2);
  set.connect(1, 3);
  set.connect(3, 4);
  return set;
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('RootedTreeSet structure', () => {
  it('keeps the unconnected nodes as roots', () => {
    const set = build();
    expect(ids(set.getTreeRoots())).toEqual([0, 5]);
  });

  it('answers the family of a node', () => {
    const set = build();
    const four = set.find(4);
    expect(ids(set.getAncestors(four))).toEqual([3, 1, 0]);
    expect(set.getRootNode(four).getId()).toBe(0);
    expect(set.getParent(four)!.getId()).toBe(3);
    expect(ids(set.getSiblings(set.find(1)))).toEqual([2]);
    expect(set.getSiblings(set.find(0))).toEqual([]);
    expect(set.getAncestors(set.find(0))).toEqual([]);
    expect(set.isLeaf(four)).toBe(true);
    expect(set.isLeaf(set.find(3))).toBe(false);
  });

  it('tells a single path to a single leaf, and the start of a sub branch', () => {
    const set = build();
    expect(set.hasSinglePathToSingleLeaf(set.find(1))).toBe(true);
    expect(set.hasSinglePathToSingleLeaf(set.find(0))).toBe(false);
    // 1 has a sibling and one child.
    expect(set.isStartOfSubBranch(set.find(1))).toBe(true);
    // 3 has one child but no sibling, 2 a sibling but no child.
    expect(set.isStartOfSubBranch(set.find(3))).toBe(false);
    expect(set.isStartOfSubBranch(set.find(2))).toBe(false);
  });

  it('refuses a node with an id that is already used', () => {
    const set = build();
    expect(() => set.add(node(3))).toThrow('node already exits with this id. Id:3');
  });

  it('finds a node, or fails or answers null for an unknown id', () => {
    const set = build();
    expect(set.find(4).getId()).toBe(4);
    expect(set.find(99, false)).toBeNull();
    expect(() => set.find(99)).toThrow('node could not be found id:99');
  });

  it('ignores connecting a node to its parent again', () => {
    const set = build();
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    set.connect(0, 1);
    expect(ids(set.getChildren(set.find(0)))).toEqual([1, 2]);
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('refuses to connect a node that already has another parent', () => {
    const set = build();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => set.connect(2, 3)).toThrow('node already connected');
    expect(set.getParent(set.find(3))!.getId()).toBe(1);
  });

  it('disconnects a node into a root of its own, with its branch', () => {
    const set = build();
    set.disconnect(3);
    expect(ids(set.getTreeRoots())).toEqual([0, 5, 3]);
    expect(set.getChildren(set.find(1))).toEqual([]);
    expect(set.getParent(set.find(3))).toBeNull();
    expect(set.getParent(set.find(4))!.getId()).toBe(3);
    expect(() => set.disconnect(3)).toThrow('Node is not connected');
  });

  it('removes a connected node and its whole branch', () => {
    const set = build();
    set.remove(3);
    expect(set.getChildren(set.find(1))).toEqual([]);
    expect(set.find(3, false)).toBeNull();
    expect(set.find(4, false)).toBeNull();

    // The ids can be used again.
    set.add(node(4));
    expect(ids(set.getTreeRoots())).toEqual([0, 5, 4]);
  });

  it('removes a root', () => {
    const set = build();
    set.remove(5);
    expect(ids(set.getTreeRoots())).toEqual([0]);
  });

  it('visits every node once, parents first, flagging the roots', () => {
    const set = build();
    const visits: [number, boolean, number[]][] = [];
    set.traverse((n, isRoot, children) => visits.push([n.getId(), isRoot, ids(children)]));
    expect(visits).toEqual([
      [0, true, [1, 2]],
      [1, false, [3]],
      [3, false, [4]],
      [4, false, []],
      [2, false, []],
      [5, true, []],
    ]);
  });

  it('dumps the trees indented by depth', () => {
    const set = build();
    const lines = set.dump().trimEnd().split('\n');
    expect(lines).toHaveLength(6);
    expect(lines[0].startsWith('[')).toBe(true);
    expect(lines[2].startsWith('      ')).toBe(true);
  });

  it('shifts a whole branch', () => {
    const set = build();
    set.shiftBranchPosition(set.find(1), 5, -5);
    expect(set.find(1).getPosition()).toEqual({ x: 15, y: -4 });
    expect(set.find(4).getPosition()).toEqual({ x: 45, y: -1 });
    expect(set.find(2).getPosition()).toEqual({ x: 20, y: 2 });
  });
});

describe('RootedTreeSet consistency check', () => {
  // Bug: Node never initializes _parent (layout/Node.ts:34 only declares it), so a node that was
  // never connected has an undefined parent, and the check, which compares with null
  // (RootedTreeSet.ts:457), reports "Root node N has non-null parent" for every such root.
  it.failing('passes on a consistent tree', () => {
    const set = build();
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    expect(set.validateTreeConsistency()).toEqual([]);
    set.logTreeConsistency(true);
    expect(log).toHaveBeenCalledWith('[RootedTreeSet] Tree consistency validation passed');
  });

  it('reports broken parent links, roots with a parent and stale children', () => {
    const set = build();
    const one = set.find(1);
    const three = set.find(3);
    // Corrupt the tree behind its back.
    three._parent = set.find(2);
    set.getTreeRoots()[1]._parent = one;
    const stranger = node(42);
    stranger._children = [];
    stranger._parent = three;
    three._children.push(stranger);

    const errors = set.validateTreeConsistency();
    expect(errors).toEqual(
      expect.arrayContaining([
        "Child 3's parent reference doesn't match actual parent 1",
        'Root node 5 has non-null parent',
        "Stale reference: Child 42 in node 3's children array but not findable in tree",
      ]),
    );
  });

  it('reports a duplicated id and a child that is another instance than the indexed one', () => {
    const set = build();
    const twin = node(2);
    twin._children = [];
    twin._parent = set.find(1);
    set.find(1)._children.push(twin);

    const errors = set.validateTreeConsistency();
    expect(errors).toContain('Duplicate node ID found: 2');
    expect(errors).toContain(
      "Reference mismatch: Child 2 in node 1's children array is different instance than found node",
    );
  });

  it('logs the errors, and throws when asked to', () => {
    const set = build();
    set.find(3)._parent = set.find(2);
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    set.logTreeConsistency();
    expect(error).toHaveBeenCalledWith('[RootedTreeSet] Tree consistency validation failed:');
    expect(() => set.logTreeConsistency(true)).toThrow(
      /Tree consistency validation failed: \d+ errors found/,
    );
  });
});

describe('RootedTreeSet.plot', () => {
  it('draws a labelled box per node, black for roots and red for children', () => {
    const set = build();
    const fills: string[] = [];
    const labels: string[] = [];
    const clicks: (() => void)[] = [];
    const element = (attrs: Record<string, number>) => {
      const result = {
        attr: (name: string, value?: string) => {
          if (value === undefined) return attrs[name];
          if (name === 'fill') fills.push(value);
          return result;
        },
        click: (handler: () => void) => {
          clicks.push(handler);
          return result;
        },
      };
      return result;
    };
    const paper = {
      width: 200,
      height: 100,
      rect: (x: number, y: number, width: number, height: number) =>
        element({ x, y, width, height }),
      text: (_x: number, _y: number, text: string) => {
        labels.push(text);
        return element({});
      },
      drawGrid: () => element({}),
    } as unknown as RaphaelPaper;
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    set.plot(paper);
    expect(labels).toEqual(['0[-]', '1[-]', '3[-]', '4[-]', '2[-]', '5[-]']);
    // Each node sets its label colour, then its box colour.
    expect(fills.filter((_fill, index) => index % 2 === 1)).toEqual([
      '#000',
      '#c00',
      '#c00',
      '#c00',
      '#c00',
      '#000',
    ]);

    clicks[0]();
    expect(String(log.mock.calls[0][0])).toContain('[id:0, order:undefined, position:(0,0)');
  });
});
