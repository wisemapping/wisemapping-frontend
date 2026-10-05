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

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import { buildDesigner } from './commands/designer-harness';
import CommandContext from '../../src/components/CommandContext';
import Designer from '../../src/components/Designer';
import DesignerModel from '../../src/components/DesignerModel';
import { DesignerOptions } from '../../src/components/DesignerOptionsBuilder';
import Topic from '../../src/components/Topic';
import Mindmap from '../../src/components/model/Mindmap';
import NodeModel from '../../src/components/model/NodeModel';

const TOPICS = 500;

type FakeTopic = Topic & { id: number; model: NodeModel };

/** Just what DesignerModel reads of a topic: its id and its model. */
const fakeTopic = (mindmap: Mindmap, id: number, model?: NodeModel): FakeTopic => {
  const topic = {
    id,
    model: model ?? mindmap.createNode('MainTopic', id),
    getId() {
      return topic.id;
    },
    getModel() {
      return topic.model;
    },
  };
  return topic as unknown as FakeTopic;
};

const designerModel = () => new DesignerModel({ zoom: 1 } as DesignerOptions);

/*
 * Topic lookups must not scan the topics. These tests count the work, never the time; each bound
 * fails on the scans the lookups did before they were indexed.
 */
describe('DesignerModel topic lookups', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const fill = () => {
    const mindmap = new Mindmap();
    const model = designerModel();
    const topics = Array.from({ length: TOPICS }, (_, id) => fakeTopic(mindmap, id));
    topics.forEach((topic) => model.addTopic(topic));
    return { mindmap, model, topics };
  };

  it('finds a topic by id without scanning the topics', () => {
    const { model, topics } = fill();
    const getId = topics.map((topic) => jest.spyOn(topic, 'getId'));

    topics.forEach((topic, id) => expect(model.findTopicById(id)).toBe(topic));

    // Before: 125,250 calls, a scan each. Now one check of the topic found.
    const calls = getId.reduce((sum, spy) => sum + spy.mock.calls.length, 0);
    expect(calls).toBe(TOPICS);
  });

  it('finds a topic by its model without scanning the topics', () => {
    const { model, topics } = fill();
    const nodeModels = topics.map((topic) => topic.model);
    const getModel = topics.map((topic) => jest.spyOn(topic, 'getModel'));

    nodeModels.forEach((nodeModel, i) => expect(model.findTopicByModel(nodeModel)).toBe(topics[i]));

    // A scan would be 125,250 calls. Now one check of the topic found.
    const calls = getModel.reduce((sum, spy) => sum + spy.mock.calls.length, 0);
    expect(calls).toBe(TOPICS);
  });

  // BL5-98: the deep-link focus asks for a topic on every layout until it exists.
  it('answers a miss without scanning the topics', () => {
    const { mindmap, model, topics } = fill();
    const getId = topics.map((topic) => jest.spyOn(topic, 'getId'));
    const getModel = topics.map((topic) => jest.spyOn(topic, 'getModel'));

    expect(model.findTopicById(TOPICS + 1)).toBeUndefined();
    expect(model.findTopicByModel(mindmap.createNode('MainTopic', TOPICS + 2))).toBeUndefined();

    // Before: a scan, 500 calls each.
    expect(getId.reduce((sum, spy) => sum + spy.mock.calls.length, 0)).toBe(0);
    expect(getModel.reduce((sum, spy) => sum + spy.mock.calls.length, 0)).toBe(0);
  });

  it('finds a topic under its new id once reindexed', () => {
    const { model, topics } = fill();
    const topic = topics[3];
    topic.id = TOPICS + 10;
    model.reindexTopic(topic, 3);

    expect(model.findTopicById(TOPICS + 10)).toBe(topic);
    expect(model.findTopicById(3)).toBeUndefined();
  });

  it('finds topics by ids in the order the model keeps them', () => {
    const { model, topics } = fill();
    const found = model.findTopicsByIds([40, 3, 12, 9999]);
    expect(found).toEqual([topics[3], topics[12], topics[40]]);
  });

  it('answers as a scan would after topics are removed or change', () => {
    const mindmap = new Mindmap();
    const model = designerModel();
    const first = fakeTopic(mindmap, 1);
    // Two topics with the same id: the first one added is found, as a scan finds it.
    const twin = fakeTopic(mindmap, 1);
    const other = fakeTopic(mindmap, 2);
    [first, twin, other].forEach((topic) => model.addTopic(topic));

    expect(model.findTopicById(1)).toBe(first);
    model.removeTopic(first);
    expect(model.findTopicById(1)).toBe(twin);
    model.removeTopic(twin);
    expect(model.findTopicById(1)).toBeUndefined();
    expect(model.findTopicByModel(twin.model)).toBeUndefined();

    // A topic whose id changed is still found under the new id, and not under the old one.
    other.id = 7;
    expect(model.findTopicById(2)).toBeUndefined();
    expect(model.findTopicById(7)).toBe(other);

    // Same for a topic given another model.
    const previous = other.model;
    other.model = mindmap.createNode('MainTopic', 7);
    expect(model.findTopicByModel(previous)).toBeUndefined();
    expect(model.findTopicByModel(other.model)).toBe(other);

    // Topics added again are found again.
    model.addTopic(first);
    expect(model.findTopicById(1)).toBe(first);
    expect(model.findTopicByModel(first.model)).toBe(first);
  });

  it('finds the topics of a command without comparing every id with every topic', () => {
    const { model, topics } = fill();
    const context = new CommandContext({ getModel: () => model } as unknown as Designer);
    const ids = [300, 3, 120, 7];
    const includes = jest.spyOn(ids, 'includes');

    const found = context.findTopics(ids);

    // Before: 500, a search of the ids for each topic.
    expect(includes).not.toHaveBeenCalled();
    // In the order the designer keeps them, as before.
    expect(found).toEqual([topics[3], topics[7], topics[120], topics[300]]);
    expect(() => context.findTopics([3, 1000])).toThrow('Could not find topic');
    // A repeated id is not a second topic, as before.
    expect(() => context.findTopics([3, 3])).toThrow('Could not find topic');
  });
});

describe('Topic.setId', () => {
  it('moves the topic to its new id in the designer lookups', async () => {
    const { designer, topic } = await buildDesigner();
    const floating = topic(5);

    floating.setId(42);

    expect(designer.getModel().findTopicById(42)).toBe(floating);
    expect(designer.getModel().findTopicById(5)).toBeUndefined();
    expect(designer.getModel().findTopicByModel(floating.getModel())).toBe(floating);
  });
});
