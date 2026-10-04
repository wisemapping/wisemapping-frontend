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
import resolveTopicMove, {
  orderedSiblings,
  TopicMove,
} from '../../../src/components/util/topicReorder';
import type Topic from '../../../src/components/Topic';
import type { LayoutType } from '../../../src/components/layout/LayoutType';
import LayoutManager from '../../../src/components/layout/LayoutManager';

type Stub = {
  id: number;
  order?: number;
  parent: Stub | null;
  children: Stub[];
  central: boolean;
  layout: LayoutType;
  getId(): number;
  getOrder(): number | undefined;
  getParent(): Topic | null;
  getChildren(): Topic[];
  isCentralTopic(): boolean;
  getModel(): { getMindmap(): { getLayout(): LayoutType } };
};

/**
 * Stubs default to the tree layout, where every parent (the central topic
 * included) keeps its children in contiguous orders 0, 1, 2 ... The mindmap
 * layout is opted into explicitly, since there the central topic's children
 * encode their side in the order parity.
 */
const node = (
  id: number,
  options: { order?: number; central?: boolean; layout?: LayoutType } = {},
): Stub => {
  const self: Stub = {
    id,
    order: options.order,
    parent: null,
    children: [],
    central: options.central ?? false,
    layout: options.layout ?? 'tree',
    getId: () => self.id,
    getOrder: () => self.order,
    getParent: () => self.parent as unknown as Topic | null,
    getChildren: () => self.children as unknown as Topic[],
    isCentralTopic: () => self.central,
    getModel: () => ({ getMindmap: () => ({ getLayout: () => self.layout }) }),
  };
  return self;
};

/** Attaches children to a parent, assigning sequential orders. */
const attach = (parent: Stub, ...children: Stub[]): Stub => {
  children.forEach((child, index) => {
    child.parent = parent;
    if (child.order === undefined) {
      child.order = index;
    }
    parent.children.push(child);
  });
  return parent;
};

const resolve = (topic: Stub, move: TopicMove) => resolveTopicMove(topic as unknown as Topic, move);

/**
 * A three-level tree:
 *
 *   root
 *   ├── a   (order 0)
 *   │   └── a1
 *   ├── b   (order 1)
 *   └── c   (order 2)
 */
const buildTree = () => {
  const root = node(1, { central: true });
  const a = node(2);
  const b = node(3);
  const c = node(4);
  const a1 = node(5);
  attach(root, a, b, c);
  attach(a, a1);
  return { root, a, b, c, a1 };
};

describe('orderedSiblings', () => {
  it('sorts by order, not by insertion into getChildren', () => {
    const root = node(1, { central: true });
    const first = node(2, { order: 2 });
    const second = node(3, { order: 0 });
    const third = node(4, { order: 1 });
    // Deliberately attached out of order.
    attach(root, first, second, third);

    const ids = orderedSiblings(second as unknown as Topic).map((t) => t.getId());

    expect(ids).toEqual([3, 4, 2]);
  });

  it('sorts topics with an undefined order last, keeping their sequence', () => {
    const root = node(1, { central: true });
    const ordered = node(2, { order: 0 });
    const pending = node(3);
    const alsoPending = node(4);
    pending.order = undefined;
    alsoPending.order = undefined;
    root.children.push(ordered, pending, alsoPending);
    [ordered, pending, alsoPending].forEach((c) => {
      c.parent = root;
    });

    const ids = orderedSiblings(ordered as unknown as Topic).map((t) => t.getId());

    expect(ids).toEqual([2, 3, 4]);
  });

  it('returns just the topic when it has no parent', () => {
    const lonely = node(9);
    expect(orderedSiblings(lonely as unknown as Topic)).toHaveLength(1);
  });
});

describe('resolveTopicMove', () => {
  describe('reordering among siblings', () => {
    it('moves a middle topic up to its predecessor index', () => {
      const { b, root } = buildTree();
      expect(resolve(b, 'up')).toEqual({ kind: 'reorder', parent: root, order: 0 });
    });

    it('moves a middle topic down to its successor index', () => {
      const { b, root } = buildTree();
      expect(resolve(b, 'down')).toEqual({ kind: 'reorder', parent: root, order: 2 });
    });

    it('refuses to move the first sibling up', () => {
      const { a } = buildTree();
      expect(resolve(a, 'up')).toBeNull();
    });

    it('refuses to move the last sibling down', () => {
      const { c } = buildTree();
      expect(resolve(c, 'down')).toBeNull();
    });

    it('refuses both directions for an only child', () => {
      const { a1 } = buildTree();
      expect(resolve(a1, 'up')).toBeNull();
      expect(resolve(a1, 'down')).toBeNull();
    });

    it('keeps the same parent when reordering', () => {
      const { b, root } = buildTree();
      const target = resolve(b, 'up');
      expect(target?.parent).toBe(root);
    });
  });

  describe('outdent', () => {
    it('re-attaches to the grandparent', () => {
      const { a1, root } = buildTree();
      // a1's parent is `a`, whose parent is root -- so a1 becomes a's sibling.
      expect(resolve(a1, 'outdent')).toEqual({ kind: 'reparent', parent: root });
    });

    it('refuses when the parent is the central topic', () => {
      const { b } = buildTree();
      // There is no level above root to rise to; detaching would orphan it.
      expect(resolve(b, 'outdent')).toBeNull();
    });

    it('works from a fourth level', () => {
      const { a1, a } = buildTree();
      const a1x = node(6);
      attach(a1, a1x);
      expect(resolve(a1x, 'outdent')).toEqual({ kind: 'reparent', parent: a });
    });
  });

  describe('indent', () => {
    it('attaches to the sibling immediately above', () => {
      const { b, a } = buildTree();
      expect(resolve(b, 'indent')).toEqual({ kind: 'reparent', parent: a });
    });

    it('uses order, not array position, to find the sibling above', () => {
      const root = node(1, { central: true });
      const later = node(2, { order: 1 });
      const earlier = node(3, { order: 0 });
      attach(root, later, earlier);

      expect(resolve(later, 'indent')).toEqual({ kind: 'reparent', parent: earlier });
    });

    it('refuses for the first sibling, which has nothing above it', () => {
      const { a } = buildTree();
      expect(resolve(a, 'indent')).toBeNull();
    });

    it('refuses for an only child', () => {
      const { a1 } = buildTree();
      expect(resolve(a1, 'indent')).toBeNull();
    });
  });

  describe('the central topic', () => {
    it.each(['up', 'down', 'outdent', 'indent'] as TopicMove[])(
      'refuses %s, since the root has nowhere to go',
      (move) => {
        const { root } = buildTree();
        expect(resolve(root, move)).toBeNull();
      },
    );
  });

  describe('a detached topic', () => {
    it.each(['up', 'down', 'outdent', 'indent'] as TopicMove[])('refuses %s', (move) => {
      const orphan = node(99);
      expect(resolve(orphan, move)).toBeNull();
    });
  });

  describe('first-level topics in the mindmap layout', () => {
    /**
     * The central topic's balanced sorter puts even orders on the right and odd
     * orders on the left, so siblings are only those on the topic's own side:
     *
     *   left (odd)     root     right (even)
     *   l0 (1)          |          r0 (0)
     *   l1 (3)          |          r1 (2)
     *                   |          r2 (4)
     */
    const buildMindmap = () => {
      const root = node(1, { central: true, layout: 'mindmap' });
      const r0 = node(10, { order: 0 });
      const l0 = node(11, { order: 1 });
      const r1 = node(12, { order: 2 });
      const l1 = node(13, { order: 3 });
      const r2 = node(14, { order: 4 });
      attach(root, r0, l0, r1, l1, r2);
      return { root, r0, l0, r1, l1, r2 };
    };

    it('moves up to the order of the sibling above on the same side', () => {
      const { root, r1 } = buildMindmap();
      expect(resolve(r1, 'up')).toEqual({ kind: 'reorder', parent: root, order: 0 });
    });

    it('moves down to the order of the sibling below on the same side', () => {
      const { root, r1, l0 } = buildMindmap();
      expect(resolve(r1, 'down')).toEqual({ kind: 'reorder', parent: root, order: 4 });
      expect(resolve(l0, 'down')).toEqual({ kind: 'reorder', parent: root, order: 3 });
    });

    it('keeps an even (right-side) order when moving a right-side topic', () => {
      const { r0, r1, r2 } = buildMindmap();
      [resolve(r0, 'down'), resolve(r1, 'up'), resolve(r1, 'down'), resolve(r2, 'up')].forEach(
        (target) => {
          expect(target).not.toBeNull();
          expect((target as { order: number }).order % 2).toBe(0);
        },
      );
    });

    it('refuses to move past the end of its own side', () => {
      const { l0, l1, r0, r2 } = buildMindmap();
      expect(resolve(l0, 'up')).toBeNull();
      expect(resolve(l1, 'down')).toBeNull();
      expect(resolve(r0, 'up')).toBeNull();
      expect(resolve(r2, 'down')).toBeNull();
    });

    it('indents under the sibling above on the same side', () => {
      const { r1, r0, l1, l0 } = buildMindmap();
      expect(resolve(r1, 'indent')).toEqual({ kind: 'reparent', parent: r0 });
      expect(resolve(l1, 'indent')).toEqual({ kind: 'reparent', parent: l0 });
    });

    it('refuses to indent the first topic on a side', () => {
      const { l0 } = buildMindmap();
      expect(resolve(l0, 'indent')).toBeNull();
    });

    it.each([
      // [topic, move, expected ids top to bottom on its side afterwards]
      [12, 'up', [12, 10, 14]],
      [12, 'down', [10, 14, 12]],
      [10, 'down', [12, 10, 14]],
      [13, 'up', [13, 11]],
    ] as [number, TopicMove, number[]][])(
      'lands %d one step %s on its own side once the layout applies it',
      (id, move, expected) => {
        const tree = buildMindmap();
        const stubs = [tree.r0, tree.l0, tree.r1, tree.l1, tree.r2];
        const manager = new LayoutManager(1, { width: 140, height: 90 });
        stubs.forEach((stub) => {
          manager.addNode(stub.id, { width: 80, height: 60 }, { x: 0, y: 0 });
          manager.connectNode(1, stub.id, stub.order!);
        });
        manager.layout();

        const target = resolve(stubs.find((s) => s.id === id)!, move);
        expect(target?.kind).toBe('reorder');

        // What DragTopicCommand does with the target: detach, then connect with its order.
        manager.disconnectNode(id);
        manager.connectNode(1, id, (target as { order: number }).order);
        manager.layout();

        const side = Math.sign(manager.find(expected[0]).getPosition().x);
        expected.forEach((sameSide) => {
          expect(Math.sign(manager.find(sameSide).getPosition().x)).toBe(side);
        });
        const topToBottom = [...expected].sort(
          (a, b) => manager.find(a).getPosition().y - manager.find(b).getPosition().y,
        );
        expect(topToBottom).toEqual(expected);
      },
    );

    it('reorders deeper levels by contiguous order as usual', () => {
      const { r0 } = buildMindmap();
      const x = node(20);
      const y = node(21);
      const z = node(22);
      attach(r0, x, y, z);
      expect(resolve(y, 'up')).toEqual({ kind: 'reorder', parent: r0, order: 0 });
      expect(resolve(y, 'down')).toEqual({ kind: 'reorder', parent: r0, order: 2 });
    });
  });

  it('round-trips: moving down then up puts the topic back where it started', () => {
    const { a, b, c } = buildTree();
    // Starting orders: a=0, b=1, c=2.
    expect(resolve(b, 'down')).toEqual(expect.objectContaining({ order: 2 }));

    // Apply what the layout would have done: b and c swap.
    b.order = 2;
    c.order = 1;
    expect(orderedSiblings(b as unknown as Topic).map((t) => t.getId())).toEqual([
      a.getId(),
      c.getId(),
      b.getId(),
    ]);

    // Moving it back up returns it to index 1, where it began.
    expect(resolve(b, 'up')).toEqual(expect.objectContaining({ order: 1 }));
  });
});
