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

// jspdf pulls in a TextEncoder that jsdom does not provide, and nothing here exports.
import Designer from '../../../src/components/Designer';
import DesignerModel from '../../../src/components/DesignerModel';
import type EventBusDispatcher from '../../../src/components/layout/EventBusDispatcher';
import type LayoutManager from '../../../src/components/layout/LayoutManager';
import type StandaloneActionDispatcher from '../../../src/components/StandaloneActionDispatcher';
import type Topic from '../../../src/components/Topic';
import type PositionType from '../../../src/components/PositionType';
import Mindmap from '../../../src/components/model/Mindmap';
import type NodeModel from '../../../src/components/model/NodeModel';
import ToolbarNotifier from '../../../src/components/model/ToolbarNotifier';
import type { DesignerOptions } from '../../../src/components/DesignerOptionsBuilder';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * The paste paths only touch the model, the action dispatcher and the layout
 * manager, so the Designer is assembled field by field instead of going
 * through its constructor (which needs a live canvas).
 */
type DesignerInternals = {
  _model: DesignerModel;
  _actionDispatcher: StandaloneActionDispatcher;
  _eventBussDispatcher: EventBusDispatcher;
  _internalClipboard: string | null;
};

type ActionDispatcherMock = {
  addTopics: jest.Mock;
  shrinkBranch: jest.Mock;
  changeTextToTopic: jest.Mock;
};

const topicStub = (id: number, options: { shrunken?: boolean } = {}): Topic => {
  let shrunken = options.shrunken ?? false;
  return {
    getId: () => id,
    areChildrenShrunken: () => shrunken,
    setChildrenShrunken: (value: boolean) => {
      shrunken = value;
    },
    isCentralTopic: () => false,
  } as unknown as Topic;
};

const designerWith = (
  options: {
    topics?: Topic[];
    internalClipboard?: string | null;
    predictedOrder?: number;
    predictedPosition?: PositionType;
  } = {},
): {
  designer: Designer;
  actionDispatcher: ActionDispatcherMock;
  predict: jest.Mock;
} => {
  const model = new DesignerModel({ zoom: 1 } as DesignerOptions);
  (options.topics ?? []).forEach((t) => model.addTopic(t));

  const actionDispatcher: ActionDispatcherMock = {
    addTopics: jest.fn(),
    shrinkBranch: jest.fn(),
    changeTextToTopic: jest.fn(),
  };

  const predict = jest.fn().mockReturnValue({
    order: options.predictedOrder ?? 2,
    position: options.predictedPosition ?? { x: 250, y: 150 },
  });

  const designer = Object.create(Designer.prototype) as Designer;
  const internals = designer as unknown as DesignerInternals;
  internals._model = model;
  internals._actionDispatcher = actionDispatcher as unknown as StandaloneActionDispatcher;
  // predict(), getOrderAfter() and getOrdersForNewChildren() are the only layout calls these
  // paths make. The orders follow each other from the predicted one, as for a non-root parent.
  const getOrderAfter = jest.fn((_parentId: number, order: number) => order + 1);
  const getOrdersForNewChildren = jest.fn((_parentId: number, count: number) =>
    Array.from({ length: count }, (_, i) => (options.predictedOrder ?? 2) + i),
  );
  internals._eventBussDispatcher = {
    getLayoutManager: () =>
      ({ predict, getOrderAfter, getOrdersForNewChildren }) as unknown as LayoutManager,
  } as unknown as EventBusDispatcher;
  internals._internalClipboard = options.internalClipboard ?? null;

  return { designer, actionDispatcher, predict };
};

const mapWith = (...topics: string[]): string =>
  [
    '<map name="sample" version="tango">',
    '  <topic id="1" central="true" text="Central">',
    ...topics,
    '  </topic>',
    '</map>',
  ].join('\n');

describe('Designer.pasteModelsAsChild', () => {
  it('adds every model under the same parent in one action', () => {
    const { designer, actionDispatcher } = designerWith({ topics: [topicStub(10)] });

    const mindmap = new Mindmap();
    const first = mindmap.createNode('MainTopic');
    const second = mindmap.createNode('MainTopic');

    designer.pasteModelsAsChild([first, second], 10);

    expect(actionDispatcher.addTopics).toHaveBeenCalledTimes(1);
    expect(actionDispatcher.addTopics).toHaveBeenCalledWith([first, second], [10, 10]);
  });

  it('does nothing when the parent topic is not on the map', () => {
    const { designer, actionDispatcher } = designerWith();

    const model = new Mindmap().createNode('MainTopic');
    designer.pasteModelsAsChild([model], 99999);

    expect(actionDispatcher.addTopics).not.toHaveBeenCalled();
  });
});

describe('Designer.pasteClipboardAsChild', () => {
  let notify: jest.SpyInstance;

  beforeEach(() => {
    notify = jest.spyOn(ToolbarNotifier, 'show').mockImplementation(() => {});
  });

  afterEach(() => {
    notify.mockRestore();
  });

  it('notifies and does nothing when the parent topic is not on the map', async () => {
    const { designer, actionDispatcher } = designerWith();

    await designer.pasteClipboardAsChild(99999);

    expect(notify).toHaveBeenCalledTimes(1);
    expect(actionDispatcher.addTopics).not.toHaveBeenCalled();
  });

  // AddTopicCommand expands it, in the same undo step as the paste (BL4-06).
  it('leaves expanding a collapsed parent to addTopics', async () => {
    const { designer, actionDispatcher } = designerWith({
      topics: [topicStub(20, { shrunken: true })],
      internalClipboard: mapWith('    <topic id="2" text="A" position="100,50" order="0" />'),
    });

    await designer.pasteClipboardAsChild(20);

    expect(actionDispatcher.shrinkBranch).not.toHaveBeenCalled();
    expect(actionDispatcher.addTopics).toHaveBeenCalledWith([expect.anything()], [20]);
  });

  it('leaves a collapsed parent alone when there is nothing to paste', async () => {
    const { designer, actionDispatcher } = designerWith({
      topics: [topicStub(22, { shrunken: true })],
    });

    await designer.pasteClipboardAsChild(22);

    expect(actionDispatcher.shrinkBranch).not.toHaveBeenCalled();
  });

  it('leaves an already expanded parent alone', async () => {
    const { designer, actionDispatcher } = designerWith({
      topics: [topicStub(21)],
      internalClipboard: mapWith('    <topic id="2" text="A" position="100,50" order="0" />'),
    });

    await designer.pasteClipboardAsChild(21);

    expect(actionDispatcher.shrinkBranch).not.toHaveBeenCalled();
  });

  it('notifies when the clipboard holds no mindmap', async () => {
    const { designer, actionDispatcher } = designerWith({
      topics: [topicStub(30)],
      internalClipboard: 'plain text without any map markup',
    });

    await designer.pasteClipboardAsChild(30);

    expect(notify).toHaveBeenCalledTimes(1);
    expect(actionDispatcher.addTopics).not.toHaveBeenCalled();
  });

  it('notifies when the clipboard is empty', async () => {
    const { designer, actionDispatcher } = designerWith({ topics: [topicStub(31)] });

    await designer.pasteClipboardAsChild(31);

    expect(notify).toHaveBeenCalledTimes(1);
    expect(actionDispatcher.addTopics).not.toHaveBeenCalled();
  });

  it('adds the copied topics as children, positioned and ordered by the layout', async () => {
    const predictedPosition = { x: 300, y: 200 };
    const { designer, actionDispatcher, predict } = designerWith({
      topics: [topicStub(40)],
      internalClipboard: mapWith(
        '    <topic id="2" text="Copied Node A" position="100,50" order="0" />',
        '    <topic id="3" text="Copied Node B" position="100,80" order="1" />',
      ),
      predictedOrder: 5,
      predictedPosition,
    });

    await designer.pasteClipboardAsChild(40);

    expect(predict).toHaveBeenCalledTimes(1);
    expect(predict).toHaveBeenCalledWith(40, null, null);
    expect(actionDispatcher.addTopics).toHaveBeenCalledTimes(1);

    const [clones, parentIds] = actionDispatcher.addTopics.mock.calls[0] as [NodeModel[], number[]];
    expect(parentIds).toEqual([40, 40]);
    expect(clones).toHaveLength(2);
    expect(clones.map((c) => c.getText())).toEqual(['Copied Node A', 'Copied Node B']);
    // The first takes the predicted order, the next one the order right after it.
    expect(clones.map((c) => c.getOrder())).toEqual([5, 6]);
    clones.forEach((clone) => {
      expect(clone.getPosition()).toEqual(predictedPosition);
    });
  });
});

/**
 * `pasteClipboard()` now shares `_readClipboardText()`/`_parseClipboardMindmap()`
 * with the paste-as-child path; these pin its pre-existing behaviour.
 */
describe('Designer.pasteClipboard', () => {
  it('adds the copied topics loose on the canvas, with no parent', async () => {
    const { designer, actionDispatcher } = designerWith({
      internalClipboard: mapWith(
        '    <topic id="2" text="Pasted Node" position="100,50" order="0" />',
      ),
    });

    await designer.pasteClipboard();

    expect(actionDispatcher.addTopics).toHaveBeenCalledTimes(1);
    const [children, parentIds] = actionDispatcher.addTopics.mock.calls[0] as [
      NodeModel[],
      number[] | null,
    ];
    expect(parentIds).toBeNull();
    expect(children).toHaveLength(1);
    expect(children[0]!.getText()).toBe('Pasted Node');
  });

  it('replaces the text of the selected topics when the clipboard holds plain text', async () => {
    const selected = topicStub(50);
    const { designer, actionDispatcher } = designerWith({
      topics: [selected],
      internalClipboard: '  Updated Topic Text  ',
    });
    jest.spyOn(designer.getModel(), 'filterSelectedTopics').mockReturnValue([selected]);

    await designer.pasteClipboard();

    expect(actionDispatcher.changeTextToTopic).toHaveBeenCalledWith([50], 'Updated Topic Text');
    expect(actionDispatcher.addTopics).not.toHaveBeenCalled();
  });

  it('does nothing when there is no clipboard content at all', async () => {
    const { designer, actionDispatcher } = designerWith();

    await designer.pasteClipboard();

    expect(actionDispatcher.addTopics).not.toHaveBeenCalled();
    expect(actionDispatcher.changeTextToTopic).not.toHaveBeenCalled();
  });
});
