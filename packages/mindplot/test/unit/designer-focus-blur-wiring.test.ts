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
import { DesignerOptions } from '../../src/components/DesignerOptionsBuilder';
import Topic from '../../src/components/Topic';
import WidgetBuilder from '../../src/components/WidgetBuilder';
import NodeModel from '../../src/components/model/NodeModel';
import Mindmap from '../../src/components/model/Mindmap';

const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

jest.mock('@wisemapping/web2d', () => {
  const actual = jest.requireActual('@wisemapping/web2d');
  return {
    ...actual,
    Workspace: jest.fn().mockImplementation(() => ({
      addItAsChildTo: jest.fn(),
      append: jest.fn((elem: { getNode?: () => Node }) => {
        const node = elem?.getNode?.();
        if (node) {
          svgElement.appendChild(node);
        }
      }),
      removeChild: jest.fn((elem: { getNode?: () => Node }) => {
        const node = elem?.getNode?.();
        node?.parentNode?.removeChild(node);
      }),
      getCoordOrigin: jest.fn().mockReturnValue({ x: 0, y: 0 }),
      setCoordOrigin: jest.fn(),
      setSize: jest.fn(),
      setCoordSize: jest.fn(),
      getCoordSize: jest.fn().mockReturnValue({ width: 1000, height: 800 }),
      getSVGElement: jest.fn().mockReturnValue(svgElement),
    })),
  };
});

jest.mock('../../src/components/layout/LayoutEventBus', () => ({
  __esModule: true,
  // A bus that drops every event.
  default: class {
    fireEvent = jest.fn();

    addEvent = jest.fn();

    removeEvent = jest.fn();
  },
}));

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {},
}));

jest.mock('../../src/components/DesignerKeyboard', () => ({
  isDisabled: jest.fn().mockReturnValue(false),
  register: jest.fn(),
  getInstance: jest.fn(),
}));

/**
 * Drives the 'ontblur'/'ontfocus' handlers that Designer registers on every
 * topic it builds, so the assertions cover the real wiring rather than just
 * the extracted predicate.
 */
describe("Designer 'onfocus'/'onblur' wiring", () => {
  let designer: Designer;
  let handlers: Record<string, () => void>;
  let fired: string[];

  const setSelection = (topicCount: number, relationshipCount: number): void => {
    jest.spyOn(designer.getModel(), 'filterSelectedTopics').mockReturnValue(
      // Only the length is read by the handlers.
      new Array(topicCount).fill(null) as unknown as Topic[],
    );
    jest
      .spyOn(designer.getModel(), 'filterSelectedRelationships')
      .mockReturnValue(new Array(relationshipCount).fill(null));
  };

  beforeEach(() => {
    handlers = {};
    fired = [];

    const container = document.createElement('div');
    const options: DesignerOptions = {
      zoom: 1.0,
      mode: 'edition-owner',
      divContainer: container,
      locale: 'en',
      widgetManager: {} as unknown as WidgetBuilder,
    };
    designer = new Designer(options);

    // Capture what Designer registers on the topic instead of building a real one.
    jest
      .spyOn(Topic.prototype, 'addEvent')
      .mockImplementation((type: string, callback: (...args: never[]) => void) => {
        handlers[type] = callback;
      });
    jest.spyOn(designer, 'fireEvent').mockImplementation((event: string) => {
      fired.push(event);
    });

    // _buildNodeGraph only needs the layout orientation; stubbing it keeps this
    // test off the layout engine, which is not initialized until a map loads.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn((designer as any)._eventBussDispatcher, 'getLayoutManager').mockReturnValue({
      getOrientation: () => 'horizontal',
    });

    const mindmap = new Mindmap();
    const node = new NodeModel('CentralTopic', mindmap);
    node.setId(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (designer as any)._buildNodeGraph(node, true);

    expect(handlers.ontblur).toBeDefined();
    expect(handlers.ontfocus).toBeDefined();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fires 'onblur' when nothing is selected", () => {
    setSelection(0, 0);
    handlers.ontblur();
    expect(fired).toContain('onblur');
  });

  it("does not fire 'onblur' while a topic is still selected", () => {
    setSelection(1, 0);
    handlers.ontblur();
    expect(fired).not.toContain('onblur');
  });

  it("does not fire 'onblur' while a relationship is still selected", () => {
    setSelection(0, 1);
    handlers.ontblur();
    expect(fired).not.toContain('onblur');
  });

  it("fires 'onfocus' for a single topic selection", () => {
    setSelection(1, 0);
    handlers.ontfocus();
    expect(fired).toContain('onfocus');
  });

  it("fires 'onfocus' for a multi-topic selection", () => {
    setSelection(3, 0);
    handlers.ontfocus();
    expect(fired).toContain('onfocus');
  });

  it("does not fire 'onfocus' when the selection is empty", () => {
    setSelection(0, 0);
    handlers.ontfocus();
    expect(fired).not.toContain('onfocus');
  });

  it('never fires both events for the same selection', () => {
    for (let topics = 0; topics <= 3; topics++) {
      for (let rels = 0; rels <= 3; rels++) {
        fired = [];
        setSelection(topics, rels);
        handlers.ontblur();
        handlers.ontfocus();
        expect(fired).toHaveLength(1);
        expect(fired[0]).toBe(topics + rels === 0 ? 'onblur' : 'onfocus');
      }
    }
  });
});
