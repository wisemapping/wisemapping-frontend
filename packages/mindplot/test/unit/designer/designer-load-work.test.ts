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

import { buildDesigner, Harness } from '../commands/designer-harness';
import { buildMediumMap, useTextSizedBoxes } from './medium-map';
import Designer from '../../../src/components/Designer';
import NodeGraph from '../../../src/components/NodeGraph';
import EventBusDispatcher from '../../../src/components/layout/EventBusDispatcher';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import Node from '../../../src/components/layout/Node';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/*
 * Loading a map must not do work that grows with the square of its size. These tests count the
 * work (layout passes, tree visits, lookups) a 500-topic map costs, never the time it takes.
 * Every bound fails on the code from before the map load was optimised; the counts it had are
 * noted next to each one.
 *
 * Rendering a 500-topic map in jsdom takes a few hundred milliseconds, so the map is loaded once
 * and its counts shared (BL5-196: the file loaded it four times, never disposed, and timed out
 * once under load). Loads run under fake timers: the render queue waits for a paint (an animation
 * frame) between batches, which must not depend on how busy the machine is.
 */

const TOPICS = 500;

const layoutManagerOf = (designer: Designer): LayoutManager =>
  (
    designer as unknown as { _eventBussDispatcher: EventBusDispatcher }
  )._eventBussDispatcher.getLayoutManager();

const microtasks = () =>
  new Promise<void>((resolve) => {
    queueMicrotask(resolve);
  });

/** Loads a generated map with `topics` topics, running the render queue's paints at once. */
const load = async (topics: number): Promise<Harness> => {
  jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] });
  try {
    const loading = buildDesigner(buildMediumMap({ topics }));
    await jest.runAllTimersAsync();
    return await loading;
  } finally {
    jest.useRealTimers();
  }
};

const silenceConsole = () => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
};

describe('Map load work', () => {
  let restoreBoxes: () => void;

  beforeAll(() => {
    restoreBoxes = useTextSizedBoxes();
  });

  afterAll(() => {
    restoreBoxes();
  });

  beforeEach(() => {
    silenceConsole();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe(`loading a ${TOPICS}-topic map`, () => {
    let designer: Designer;
    // The calls made while it loaded.
    const loadCalls = { layout: 0, treeVisits: 0, topicGetId: 0, topicGetModel: 0 };

    beforeAll(async () => {
      silenceConsole();
      const layout = jest.spyOn(LayoutManager.prototype, 'layout');
      // A search of the layout tree reads the id of each node it visits.
      const treeVisits = jest.spyOn(Node.prototype, 'getId');
      const topicGetId = jest.spyOn(NodeGraph.prototype, 'getId');
      const topicGetModel = jest.spyOn(NodeGraph.prototype, 'getModel');

      ({ designer } = await load(TOPICS));

      loadCalls.layout = layout.mock.calls.length;
      loadCalls.treeVisits = treeVisits.mock.calls.length;
      loadCalls.topicGetId = topicGetId.mock.calls.length;
      loadCalls.topicGetModel = topicGetModel.mock.calls.length;
      jest.restoreAllMocks();
    });

    afterAll(() => {
      designer.dispose();
      document.body.innerHTML = '';
    });

    it('lays a map out once, not once per topic', () => {
      expect(designer.getModel().getTopics()).toHaveLength(TOPICS);
      // Before: 497, one per connected topic plus the final one.
      expect(loadCalls.layout).toBeLessThanOrEqual(2);
    });

    it('finds layout nodes without walking the tree', () => {
      // Before: 829,445 visits. Now about 8,400: a few per topic, to index it and report its
      // changes.
      expect(loadCalls.treeVisits).toBeLessThan(40 * TOPICS);
    });

    it('finds topics without scanning them all', () => {
      // Before: 5,879,359 getId calls (the change handler scanned the topics for each change of
      // each of the 497 layouts) and 4,572,378 getModel calls (each child also scanned them for
      // its parent's topic). Now about 15,000 and 254,000, most of them from rendering.
      expect(loadCalls.topicGetId).toBeLessThan(40 * TOPICS);
      expect(loadCalls.topicGetModel).toBeLessThan(1000 * TOPICS);

      const getId = jest.spyOn(NodeGraph.prototype, 'getId');
      for (let id = 0; id < TOPICS; id++) {
        expect(designer.getModel().findTopicById(id)?.getId()).toBe(id);
      }
      // Before: a scan each, 125,250 calls. Now the check of the topic found, and the call above.
      expect(getId.mock.calls.length).toBeLessThanOrEqual(2 * TOPICS);
    });

    it('draws relationships where their topics end up', () => {
      const relationships = designer.getModel().getRelationships();
      expect(relationships.length).toBeGreaterThan(0);
      // The relationship lines: where they start and end.
      const drawn = () =>
        Array.from(designer.getContainer().querySelectorAll('[test-id$="-relationship"]')).map(
          (line) => `${line.getAttribute('test-id')} ${line.getAttribute('d')}`,
        );

      const loaded = drawn();
      expect(loaded.length).toBeGreaterThanOrEqual(relationships.length);
      relationships.forEach((relationship) => relationship.redraw());

      // Before, the relationships were drawn before the final layout moved some of their topics.
      expect(drawn()).toEqual(loaded);
    });
  });

  describe('editing a map', () => {
    let designer: Designer;

    afterEach(() => {
      designer.dispose();
      document.body.innerHTML = '';
    });

    it('lays out an interactive connect once, and not again for the command', async () => {
      ({ designer } = await load(50));
      const layout = jest.spyOn(LayoutManager.prototype, 'layout');

      const model = designer.getMindmap().createNode('MainTopic');
      model.setText('Added');
      model.setPosition(0, 0);
      model.setOrder(0);
      designer.getActionDispatcher().addTopics([model], [7]);

      // Before: 3, as connecting laid out twice before the command's own layout; then 2, the
      // command's own layout moving nothing (BL5-94).
      expect(layout.mock.calls.length).toBe(1);

      // ... and the new topic is laid out when the command returns, not later.
      const added = designer.getModel().findTopicById(model.getId())!;
      expect(added.getPosition()).toEqual(
        layoutManagerOf(designer).find(model.getId()).getPosition(),
      );
      await microtasks();
      expect(layout.mock.calls.length).toBe(1);
    });

    it('settles the layout of an undone delete when the undo returns', async () => {
      ({ designer } = await load(200));
      const dispatcher = designer.getActionDispatcher();
      const branch = designer
        .getModel()
        .getTopics()
        .find((topic) => topic.getChildren().length > 2 && topic.getId() > 10)!;
      const placed = () =>
        designer
          .getModel()
          .getTopics()
          .map((topic) => `${topic.getId()}:${topic.getPosition().x},${topic.getPosition().y}`)
          .sort();
      const before = placed();
      dispatcher.deleteEntities([branch.getId(), 3], []);

      const layout = jest.spyOn(LayoutManager.prototype, 'layout');
      designer.undo();
      const undone = placed();
      expect(undone).toEqual(before);

      // Rebuilding the branches connected each of their topics: one layout for the connection of
      // the branch, one for the command. Nothing is left for later.
      const calls = layout.mock.calls.length;
      expect(calls).toBeLessThanOrEqual(2);
      await microtasks();
      expect(layout.mock.calls.length).toBe(calls);
      expect(placed()).toEqual(undone);
    });
  });
});
