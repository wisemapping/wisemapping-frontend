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
import Designer from '../../src/components/Designer';
import type Topic from '../../src/components/Topic';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {},
}));

type Stub = {
  getId(): number;
  getOrder(): number | undefined;
  getParent(): Topic | null;
  getChildren(): Topic[];
  isCentralTopic(): boolean;
  getPosition(): { x: number; y: number };
  getModel(): { getMindmap(): { getLayout(): string } };
};

const node = (
  id: number,
  options: { order?: number; central?: boolean; position?: { x: number; y: number } } = {},
) => {
  const state = {
    parent: null as Stub | null,
    children: [] as Stub[],
  };
  const self: Stub & { _state: typeof state } = {
    _state: state,
    getId: () => id,
    getOrder: () => options.order,
    getParent: () => state.parent as unknown as Topic | null,
    getChildren: () => state.children as unknown as Topic[],
    isCentralTopic: () => options.central ?? false,
    getPosition: () => options.position ?? { x: 10, y: 20 },
    // Tree layout: the fixtures use contiguous orders under the central topic,
    // which in the mindmap layout would put siblings on alternate sides.
    getModel: () => ({ getMindmap: () => ({ getLayout: () => 'tree' }) }),
  };
  return self;
};

const attach = (parent: ReturnType<typeof node>, ...children: ReturnType<typeof node>[]) => {
  children.forEach((child) => {
    child._state.parent = parent;
    parent._state.children.push(child);
  });
};

/**
 * Exercises Designer.moveTopicInTree against stubbed collaborators.
 *
 * What matters here is the wiring the pure resolver cannot cover: that a
 * reorder keeps the topic's own position and passes the new order, that a
 * reparent asks the layout where the topic belongs rather than inventing
 * coordinates, that everything goes through dragTopic (so the move is undoable
 * like a mouse drag), and that a read-only map refuses.
 */
describe('Designer.moveTopicInTree', () => {
  let designer: Designer;
  let dragTopic: jest.Mock;
  let predict: jest.Mock;
  let revealNode: jest.Mock;
  let tree: ReturnType<typeof buildTree>;

  const buildTree = () => {
    const root = node(1, { central: true });
    const a = node(2, { order: 0 });
    const b = node(3, { order: 1, position: { x: 55, y: 66 } });
    const c = node(4, { order: 2 });
    const a1 = node(5, { order: 0 });
    attach(root, a, b, c);
    attach(a, a1);
    return { root, a, b, c, a1 };
  };

  const install = (readOnly = false) => {
    dragTopic = jest.fn();
    predict = jest.fn().mockReturnValue({ order: 7, position: { x: 100, y: 200 } });
    revealNode = jest.fn();

    designer = Object.create(Designer.prototype) as Designer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const self = designer as any;
    self.isReadOnly = () => readOnly;
    self.getActionDispatcher = () => ({ dragTopic });
    self._eventBussDispatcher = { getLayoutManager: () => ({ predict }) };
    self.revealNode = revealNode;
  };

  beforeEach(() => {
    install();
    tree = buildTree();
  });

  describe('reorder', () => {
    it('passes the new order and keeps the topic position', () => {
      const moved = designer.moveTopicInTree(tree.b as unknown as Topic, 'up');

      expect(moved).toBe(true);
      expect(dragTopic).toHaveBeenCalledWith(3, { x: 55, y: 66 }, 0, tree.root);
    });

    it('does not consult the layout, since the parent is unchanged', () => {
      designer.moveTopicInTree(tree.b as unknown as Topic, 'down');
      expect(predict).not.toHaveBeenCalled();
    });

    it('moves down to the successor index', () => {
      designer.moveTopicInTree(tree.b as unknown as Topic, 'down');
      expect(dragTopic).toHaveBeenCalledWith(3, expect.anything(), 2, tree.root);
    });
  });

  describe('reparent', () => {
    it('asks the layout where a child of the new parent belongs', () => {
      const moved = designer.moveTopicInTree(tree.a1 as unknown as Topic, 'outdent');

      expect(moved).toBe(true);
      // a1 hangs off `a`, so outdenting attaches it to root.
      expect(predict).toHaveBeenCalledWith(1, null, null);
      expect(dragTopic).toHaveBeenCalledWith(5, { x: 100, y: 200 }, 7, tree.root);
    });

    it('indents under the preceding sibling', () => {
      const moved = designer.moveTopicInTree(tree.b as unknown as Topic, 'indent');

      expect(moved).toBe(true);
      expect(predict).toHaveBeenCalledWith(2, null, null);
      expect(dragTopic).toHaveBeenCalledWith(3, { x: 100, y: 200 }, 7, tree.a);
    });
  });

  describe('unavailable moves', () => {
    it('reports false and dispatches nothing for the first sibling moving up', () => {
      const moved = designer.moveTopicInTree(tree.a as unknown as Topic, 'up');

      expect(moved).toBe(false);
      expect(dragTopic).not.toHaveBeenCalled();
      expect(revealNode).not.toHaveBeenCalled();
    });

    it('reports false for the central topic', () => {
      expect(designer.moveTopicInTree(tree.root as unknown as Topic, 'down')).toBe(false);
      expect(dragTopic).not.toHaveBeenCalled();
    });

    it('reports false for outdenting a direct child of the root', () => {
      expect(designer.moveTopicInTree(tree.b as unknown as Topic, 'outdent')).toBe(false);
      expect(dragTopic).not.toHaveBeenCalled();
    });
  });

  describe('read-only map', () => {
    it.each(['up', 'down', 'outdent', 'indent'] as const)('refuses %s', (move) => {
      install(true);
      tree = buildTree();

      expect(designer.moveTopicInTree(tree.b as unknown as Topic, move)).toBe(false);
      expect(dragTopic).not.toHaveBeenCalled();
    });
  });

  it('reveals the topic afterwards, so indenting under a collapsed sibling still shows it', () => {
    designer.moveTopicInTree(tree.b as unknown as Topic, 'indent');
    expect(revealNode).toHaveBeenCalledWith(tree.b);
  });
});
