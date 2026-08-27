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

/** @jest-environment jsdom */
import { TextEncoder, TextDecoder } from 'util';

Object.assign(globalThis, { TextEncoder, TextDecoder });

jest.mock('../../src/components/SvgImageIcon', () => ({
  __esModule: true,
  default: class MockSvgImageIcon {},
}));

import Designer from '../../src/components/Designer';
import Mindmap from '../../src/components/model/Mindmap';
import NodeModel from '../../src/components/model/NodeModel';
import DesignerModel from '../../src/components/DesignerModel';
import StandaloneActionDispatcher from '../../src/components/StandaloneActionDispatcher';
import EventBusDispatcher from '../../src/components/layout/EventBusDispatcher';
import LayoutManager from '../../src/components/layout/LayoutManager';
import Topic from '../../src/components/Topic';
import ToolbarNotifier from '../../src/components/model/ToolbarNotifier';
import { DesignerOptions } from '../../src/components/DesignerOptionsBuilder';
import PositionType from '../../src/components/PositionType';

type TestDesignerFields = {
  _model: DesignerModel;
  _actionDispatcher: StandaloneActionDispatcher;
  _eventBussDispatcher: EventBusDispatcher;
  _internalClipboard: string | null;
  pasteModelsAsChild: (models: NodeModel[], parentId: number) => void;
  pasteClipboardAsChild: (parentId: number) => Promise<void>;
  pasteClipboard: () => Promise<void>;
};

const createMockTopic = (id: number, options: { shrunken?: boolean; text?: string } = {}): Topic => {
  let isShrunken = options.shrunken ?? false;
  const mockNodeModel = {
    getPlainText: () => options.text ?? `Topic ${id}`,
    areChildrenShrunken: () => isShrunken,
    setChildrenShrunken: (val: boolean) => {
      isShrunken = val;
    },
  };
  const topicStub = {
    getId: () => id,
    getModel: () => mockNodeModel,
    areChildrenShrunken: () => isShrunken,
    setChildrenShrunken: (val: boolean) => {
      isShrunken = val;
    },
    isCentralTopic: () => false,
  };
  return topicStub as unknown as Topic;
};

const createTestDesigner = (options: {
  topics?: Topic[];
  internalClipboard?: string | null;
  predictedOrder?: number;
  predictedPosition?: PositionType;
} = {}): {
  designer: Designer;
  actionDispatcherMock: {
    addTopics: jest.Mock;
    shrinkBranch: jest.Mock;
    changeTextToTopic: jest.Mock;
    execute: jest.Mock;
  };
  layoutManagerMock: {
    predict: jest.Mock;
  };
} => {
  const model = new DesignerModel({ zoom: 1 } as DesignerOptions);
  if (options.topics) {
    options.topics.forEach((t) => model.addTopic(t));
  }

  const actionDispatcherMock = {
    addTopics: jest.fn(),
    shrinkBranch: jest.fn(),
    changeTextToTopic: jest.fn(),
    execute: jest.fn(),
  };

  const layoutManagerMock = {
    predict: jest.fn().mockReturnValue({
      order: options.predictedOrder ?? 2,
      position: options.predictedPosition ?? { x: 250, y: 150 },
    }),
  };

  const eventBussDispatcherMock = {
    getLayoutManager: () => layoutManagerMock as unknown as LayoutManager,
  };

  const designer = Object.create(Designer.prototype) as Designer;
  const fields = designer as unknown as TestDesignerFields;
  fields._model = model;
  fields._actionDispatcher = actionDispatcherMock as unknown as StandaloneActionDispatcher;
  fields._eventBussDispatcher = eventBussDispatcherMock as unknown as EventBusDispatcher;
  fields._internalClipboard = options.internalClipboard ?? null;

  return {
    designer,
    actionDispatcherMock,
    layoutManagerMock,
  };
};

describe('Designer.pasteModelsAsChild', () => {
  it('forwards models and parentIds to addTopics with one parent per model', () => {
    const parentTopic = createMockTopic(10);
    const { designer, actionDispatcherMock } = createTestDesigner({ topics: [parentTopic] });

    const mindmap = new Mindmap();
    const m1 = mindmap.createNode('MainTopic');
    const m2 = mindmap.createNode('MainTopic');

    const testDesigner = designer as unknown as TestDesignerFields;
    testDesigner.pasteModelsAsChild([m1, m2], 10);

    expect(actionDispatcherMock.addTopics).toHaveBeenCalledTimes(1);
    expect(actionDispatcherMock.addTopics).toHaveBeenCalledWith([m1, m2], [10, 10]);
  });

  it('no-ops when the parent topic does not exist', () => {
    const { designer, actionDispatcherMock } = createTestDesigner();

    const mindmap = new Mindmap();
    const m1 = mindmap.createNode('MainTopic');
    const testDesigner = designer as unknown as TestDesignerFields;
    testDesigner.pasteModelsAsChild([m1], 99999);

    expect(actionDispatcherMock.addTopics).not.toHaveBeenCalled();
  });
});

describe('Designer.pasteClipboardAsChild', () => {
  let notifySpy: jest.SpyInstance;

  beforeEach(() => {
    notifySpy = jest.spyOn(ToolbarNotifier, 'show').mockImplementation(() => {});
  });

  afterEach(() => {
    notifySpy.mockRestore();
  });

  it('shows notification and no-ops when the parent topic does not exist', async () => {
    const { designer, actionDispatcherMock } = createTestDesigner();

    const testDesigner = designer as unknown as TestDesignerFields;
    await testDesigner.pasteClipboardAsChild(99999);

    expect(notifySpy).toHaveBeenCalledTimes(1);
    expect(actionDispatcherMock.addTopics).not.toHaveBeenCalled();
  });

  it('expands parent branch if the parent is collapsed', async () => {
    const collapsedParent = createMockTopic(20, { shrunken: true });
    const { designer, actionDispatcherMock } = createTestDesigner({
      topics: [collapsedParent],
      internalClipboard: null,
    });

    const testDesigner = designer as unknown as TestDesignerFields;
    await testDesigner.pasteClipboardAsChild(20);

    expect(actionDispatcherMock.shrinkBranch).toHaveBeenCalledWith([20], false);
  });

  it('shows notification when clipboard has no mindmap XML data', async () => {
    const parent = createMockTopic(30);
    const { designer, actionDispatcherMock } = createTestDesigner({
      topics: [parent],
      internalClipboard: 'plain text without xml tags',
    });

    const testDesigner = designer as unknown as TestDesignerFields;
    await testDesigner.pasteClipboardAsChild(30);

    expect(notifySpy).toHaveBeenCalledTimes(1);
    expect(actionDispatcherMock.addTopics).not.toHaveBeenCalled();
  });

  it('parses clipboard mindmap, assigns predicted order & position to clones, and adds them as children of parentId', async () => {
    const parent = createMockTopic(40);
    const mindmapXml = `
      <map name="sample" version="tango">
        <topic id="1" central="true" text="Central">
          <topic id="2" text="Copied Node A" position="100,50" order="0" />
          <topic id="3" text="Copied Node B" position="100,80" order="1" />
        </topic>
      </map>
    `.trim();

    const predictedPos = { x: 300, y: 200 };
    const { designer, actionDispatcherMock, layoutManagerMock } = createTestDesigner({
      topics: [parent],
      internalClipboard: mindmapXml,
      predictedOrder: 5,
      predictedPosition: predictedPos,
    });

    const testDesigner = designer as unknown as TestDesignerFields;
    await testDesigner.pasteClipboardAsChild(40);

    expect(layoutManagerMock.predict).toHaveBeenCalledWith(40, null, null);
    expect(actionDispatcherMock.addTopics).toHaveBeenCalledTimes(1);

    const [clonesArg, parentIdsArg] = actionDispatcherMock.addTopics.mock.calls[0] as [NodeModel[], number[]];
    expect(parentIdsArg).toEqual([40, 40]);
    expect(clonesArg).toHaveLength(2);
    expect(clonesArg[0].getText()).toBe('Copied Node A');
    expect(clonesArg[0].getOrder()).toBe(5);
    expect(clonesArg[0].getPosition()).toEqual(predictedPos);
    expect(clonesArg[1].getText()).toBe('Copied Node B');
    expect(clonesArg[1].getOrder()).toBe(5);
    expect(clonesArg[1].getPosition()).toEqual(predictedPos);
  });
});

describe('Designer.pasteClipboard (DRY refactor verification)', () => {
  it('parses clipboard XML and adds topics with null parents for standard paste', async () => {
    const mindmapXml = `
      <map name="sample" version="tango">
        <topic id="1" central="true" text="Central">
          <topic id="2" text="Pasted Node" position="100,50" order="0" />
        </topic>
      </map>
    `.trim();

    const { designer, actionDispatcherMock } = createTestDesigner({
      internalClipboard: mindmapXml,
    });

    const testDesigner = designer as unknown as TestDesignerFields;
    await testDesigner.pasteClipboard();

    expect(actionDispatcherMock.addTopics).toHaveBeenCalledTimes(1);
    const [childrenArg, parentIdsArg] = actionDispatcherMock.addTopics.mock.calls[0] as [NodeModel[], number[] | null];
    expect(parentIdsArg).toBeNull();
    expect(childrenArg).toHaveLength(1);
    expect(childrenArg[0].getText()).toBe('Pasted Node');
  });

  it('updates selected topics text when clipboard contains plain text', async () => {
    const selectedTopic = createMockTopic(50, { text: 'Old Text' });
    const { designer, actionDispatcherMock } = createTestDesigner({
      topics: [selectedTopic],
      internalClipboard: 'Updated Topic Text',
    });

    // Mark topic as selected in model
    const testDesigner = designer as unknown as TestDesignerFields;
    testDesigner._model.filterSelectedTopics = () => [selectedTopic];

    await testDesigner.pasteClipboard();

    expect(actionDispatcherMock.changeTextToTopic).toHaveBeenCalledWith([50], 'Updated Topic Text');
  });
});
