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

jest.mock('../../../src/components/SvgImageIcon', () => ({
  __esModule: true,
  default: class MockSvgImageIcon {},
}));

// jspdf pulls in a TextEncoder that jsdom does not provide, and nothing here exports.
jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import Designer from '../../../src/components/Designer';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import type { LayoutType } from '../../../src/components/layout/LayoutType';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';
import type Topic from '../../../src/components/Topic';

const ROOT_NODE_SIZE = { width: 140, height: 90 };
const NODE_SIZE = { width: 80, height: 60 };
const ORIGIN = { x: 0, y: 0 };
const NEW_ID = 99;

/**
 * Enter on a topic creates a sibling right after it. The order the Designer
 * picks is handed to the layout's insert, so the property that matters is
 * where a node connected with that order actually lands in the real layout.
 */
const createSibling = (manager: LayoutManager, topicId: number, parentId: number): number => {
  const mindmap = new Mindmap();
  const parent = { getId: () => parentId } as unknown as Topic;
  const topic = {
    getId: () => topicId,
    getOrder: () => manager.find(topicId).getOrder(),
    getOutgoingConnectedTopic: () => parent,
    getModel: () => ({ getMindmap: () => mindmap }),
  } as unknown as Topic;

  const addTopics = jest.fn();
  const designer = Object.create(Designer.prototype) as Designer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const self = designer as any;
  self._model = { filterSelectedTopics: () => [topic] };
  self._actionDispatcher = { addTopics };
  self._eventBussDispatcher = { getLayoutManager: () => manager };

  designer.createSiblingForSelectedNode();

  expect(addTopics).toHaveBeenCalledTimes(1);
  const [models, parents] = addTopics.mock.calls[0] as [NodeModel[], number[]];
  expect(parents).toEqual([parentId]);

  // Connect it the way the real add does, then lay out.
  const order = models[0].getOrder()!;
  manager.addNode(NEW_ID, NODE_SIZE, ORIGIN).connectNode(parentId, NEW_ID, order);
  manager.layout();
  return order;
};

const pos = (manager: LayoutManager, id: number) => manager.find(id).getPosition();

const byY = (manager: LayoutManager, ids: number[]): number[] =>
  [...ids].sort((a, b) => pos(manager, a).y - pos(manager, b).y);

const byX = (manager: LayoutManager, ids: number[]): number[] =>
  [...ids].sort((a, b) => pos(manager, a).x - pos(manager, b).x);

const build = (layout: LayoutType, rootChildren: number): LayoutManager => {
  const manager = new LayoutManager(0, ROOT_NODE_SIZE, layout);
  for (let order = 0; order < rootChildren; order++) {
    manager.addNode(order + 1, NODE_SIZE, ORIGIN).connectNode(0, order + 1, order);
  }
  manager.layout();
  return manager;
};

describe('Designer.createSiblingForSelectedNode', () => {
  describe('first-level topics in the mindmap layout', () => {
    // Root children 1..4 at orders 0..3: 1 and 3 on the right, 2 and 4 on the left.
    it('puts the sibling of a right-side topic on the right, just below it', () => {
      const manager = build('mindmap', 4);
      expect(pos(manager, 1).x).toBeGreaterThan(0);

      createSibling(manager, 1, 0);

      expect(pos(manager, NEW_ID).x).toBeGreaterThan(0);
      expect(byY(manager, [1, 3, NEW_ID])).toEqual([1, NEW_ID, 3]);
    });

    it('puts the sibling of a left-side topic on the left, just below it', () => {
      const manager = build('mindmap', 4);
      expect(pos(manager, 2).x).toBeLessThan(0);

      createSibling(manager, 2, 0);

      expect(pos(manager, NEW_ID).x).toBeLessThan(0);
      expect(byY(manager, [2, 4, NEW_ID])).toEqual([2, NEW_ID, 4]);
    });

    it('puts the sibling of the last topic on a side at the bottom of that side', () => {
      const manager = build('mindmap', 4);

      createSibling(manager, 4, 0);

      expect(pos(manager, NEW_ID).x).toBeLessThan(0);
      expect(byY(manager, [2, 4, NEW_ID])).toEqual([2, 4, NEW_ID]);
    });
  });

  it('inserts right after a deeper topic, whose siblings are contiguous', () => {
    const manager = build('mindmap', 1);
    [10, 11, 12].forEach((id, order) => {
      manager.addNode(id, NODE_SIZE, ORIGIN).connectNode(1, id, order);
    });
    manager.layout();

    const order = createSibling(manager, 10, 1);

    expect(order).toBe(1);
    expect(byY(manager, [10, 11, 12, NEW_ID])).toEqual([10, NEW_ID, 11, 12]);
  });

  it('inserts right after a first-level topic in the tree layout', () => {
    const manager = build('tree', 3);

    const order = createSibling(manager, 1, 0);

    expect(order).toBe(1);
    expect(byX(manager, [1, 2, 3, NEW_ID])).toEqual([1, NEW_ID, 2, 3]);
  });
});
