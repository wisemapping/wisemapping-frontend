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

type Stub = {
  id: number;
  order?: number;
  parent: Stub | null;
  children: Stub[];
  central: boolean;
  getId(): number;
  getOrder(): number | undefined;
  getParent(): Topic | null;
  getChildren(): Topic[];
  isCentralTopic(): boolean;
};

const node = (id: number, options: { order?: number; central?: boolean } = {}): Stub => {
  const self: Stub = {
    id,
    order: options.order,
    parent: null,
    children: [],
    central: options.central ?? false,
    getId: () => self.id,
    getOrder: () => self.order,
    getParent: () => self.parent as unknown as Topic | null,
    getChildren: () => self.children as unknown as Topic[],
    isCentralTopic: () => self.central,
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
