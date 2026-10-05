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

import { SAMPLE_MAP, buildDesigner as buildHarness } from '../commands/designer-harness';
import buildDesigner from '../../../src/components/DesignerBuilder';
import Designer from '../../../src/components/Designer';
import DesignerKeyboard from '../../../src/components/DesignerKeyboard';
import ActionDispatcher from '../../../src/components/ActionDispatcher';
import DragManager from '../../../src/components/DragManager';
import DragTopic from '../../../src/components/DragTopic';
import LayoutEventBus from '../../../src/components/layout/LayoutEventBus';
import EventBusDispatcher from '../../../src/components/layout/EventBusDispatcher';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import PersistenceManager from '../../../src/components/PersistenceManager';
import WidgetBuilder from '../../../src/components/WidgetBuilder';
import XMLSerializerFactory from '../../../src/components/persistence/XMLSerializerFactory';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

type DesignerInternals = {
  _eventBussDispatcher: EventBusDispatcher;
  _dragManager: DragManager;
};

const internals = (designer: Designer): DesignerInternals =>
  designer as unknown as DesignerInternals;

const layoutManagerOf = (designer: Designer): LayoutManager =>
  internals(designer)._eventBussDispatcher.getLayoutManager();

const globalDesigner = (): Designer | undefined =>
  (globalThis as unknown as { designer?: Designer }).designer;

const built: Designer[] = [];

/** Builds a designer through DesignerBuilder, as MindplotWebComponent does, and loads a map. */
const build = async (): Promise<Designer> => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const designer = buildDesigner({
    zoom: 1,
    mode: 'edition-owner',
    divContainer: container,
    widgetManager: {} as WidgetBuilder,
    persistenceManager: {} as PersistenceManager,
    locale: 'en',
  });
  built.push(designer);

  const document_ = new DOMParser().parseFromString(SAMPLE_MAP, 'text/xml');
  const mindmap = XMLSerializerFactory.createFromDocument(document_).loadFromDom(
    document_,
    'sample',
  );
  await designer.loadMap(mindmap);
  return designer;
};

describe('Designer dispose (BL-48)', () => {
  beforeAll(() => {
    // Drop the listeners other suites in this worker left on the module-level bus.
    LayoutEventBus.reset();
  });

  afterEach(() => {
    built.splice(0).forEach((designer) => {
      designer.dispose();
      designer.getContainer().remove();
    });
    jest.restoreAllMocks();
  });

  it('builds a designer again once the previous one is disposed', async () => {
    const first = await build();
    first.dispose();

    const second = await build();

    expect(second).not.toBe(first);
    expect(globalDesigner()).toBe(second);
  });

  it('still refuses a second designer while the first one is live', async () => {
    await build();
    await expect(build()).rejects.toThrow('multiple initializations');
  });

  it('stops the disposed designer from handling layout bus events', async () => {
    const first = await build();
    // forceLayout asks the layout manager whether a layout would do anything (BL5-94).
    const firstLayout = jest.spyOn(layoutManagerOf(first), 'needsLayout');
    const firstEnsureVisible = jest.spyOn(first.getWorkSpace(), 'ensureVisible');
    first.dispose();

    const second = await build();
    const secondLayout = jest.spyOn(layoutManagerOf(second), 'needsLayout');

    LayoutEventBus.fireEvent('forceLayout');
    LayoutEventBus.fireEvent('topicSelected', first.getModel().getCentralTopic().getModel());

    expect(firstLayout).not.toHaveBeenCalled();
    expect(firstEnsureVisible).not.toHaveBeenCalled();
    expect(secondLayout).toHaveBeenCalled();
  });

  it('does not let a stale designer break the layout of the live one', async () => {
    const first = await build();
    first.dispose();
    const second = await build();

    // A topic added on the live designer must reach only its own layout manager ...
    const firstAddNode = jest.spyOn(layoutManagerOf(first), 'addNode');
    const secondAddNode = jest.spyOn(layoutManagerOf(second), 'addNode');
    second.goToNode(second.getModel().getCentralTopic());
    second.createChildForSelectedNode();

    expect(firstAddNode).not.toHaveBeenCalled();
    expect(secondAddNode).toHaveBeenCalled();
  });

  it('removes its selection shadows and their bus listeners', async () => {
    const designer = await build();
    const central = designer.getModel().getCentralTopic();
    LayoutEventBus.fireEvent('topicSelected', central.getModel());
    expect(designer.getSelectionShadows().size).toBeGreaterThan(0);

    designer.dispose();
    expect(designer.getSelectionShadows().size).toBe(0);

    LayoutEventBus.fireEvent('topicSelected', central.getModel());
    expect(designer.getSelectionShadows().size).toBe(0);
  });

  it('disposes its canvas', async () => {
    const designer = await build();
    const canvasDispose = jest.spyOn(designer.getWorkSpace(), 'dispose');

    designer.dispose();

    expect(canvasDispose).toHaveBeenCalled();
  });

  it('releases the keyboard: no typing into its topics, no shortcuts', async () => {
    const first = await build();
    const topic = first.getModel().findTopicById(1)!;
    first.goToNode(topic);
    const showTextEditor = jest.spyOn(topic, 'showTextEditor').mockImplementation(() => undefined);
    const deleteSelected = jest.spyOn(first, 'deleteSelectedEntities');

    first.dispose();
    expect(DesignerKeyboard.getInstance()).toBeUndefined();

    document.dispatchEvent(new KeyboardEvent('keypress', { key: 'a', code: 'KeyA' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));

    expect(showTextEditor).not.toHaveBeenCalled();
    expect(deleteSelected).not.toHaveBeenCalled();

    const second = await build();
    expect(DesignerKeyboard.getInstance()).toBeDefined();
    expect(globalDesigner()).toBe(second);
  });

  it('only clears globalThis.designer when it still points at itself', async () => {
    const first = await build();
    expect(globalDesigner()).toBe(first);

    // A newer designer took over before the old one was disposed ...
    const second = await buildHarness();
    built.push(second.designer);
    expect(globalDesigner()).toBe(second.designer);

    first.dispose();
    expect(globalDesigner()).toBe(second.designer);

    second.designer.dispose();
    expect(globalDesigner()).toBeUndefined();
  });

  it('removes its SVG from the container (BL4-49)', async () => {
    const designer = await build();
    const container = designer.getContainer();
    const svg = designer.getWorkSpace().getSVGElement();
    expect(container.contains(svg)).toBe(true);

    designer.dispose();

    // A designer built again on the same container would otherwise stack a second SVG ...
    expect(container.contains(svg)).toBe(false);
  });

  it('cancels a topic drag in progress (BL4-48)', async () => {
    const designer = await build();
    const dragManager = internals(designer)._dragManager;
    const dragListeners = dragManager as unknown as {
      _mouseMoveListener: EventListener | null;
      _mouseUpListener: EventListener | null;
    };
    const removeDocumentListener = jest.spyOn(document, 'removeEventListener');

    // Press the mouse on a draggable topic: the drag listeners go on the document ...
    const topic = designer.getModel().findTopicById(1)!;
    topic
      .get2DElement()
      .getNode()
      .dispatchEvent(new MouseEvent('mousedown', { clientX: 10, clientY: 10 }));
    const { _mouseMoveListener: mouseMove, _mouseUpListener: mouseUp } = dragListeners;
    expect(mouseMove).not.toBeNull();

    designer.dispose();

    expect(removeDocumentListener).toHaveBeenCalledWith('mousemove', mouseMove);
    expect(removeDocumentListener).toHaveBeenCalledWith('mouseup', mouseUp);
    expect(dragListeners._mouseMoveListener).toBeNull();
  });

  it('stops being the ActionDispatcher instance (BL4-50)', async () => {
    const designer = await build();
    expect(ActionDispatcher.getInstance()).toBe(designer.getActionDispatcher());

    designer.dispose();

    expect(() => ActionDispatcher.getInstance()).toThrow();
  });

  it('leaves the ActionDispatcher of a newer designer alone (BL4-50)', async () => {
    const first = await build();
    const second = await buildHarness();
    built.push(second.designer);

    first.dispose();

    expect(ActionDispatcher.getInstance()).toBe(second.designer.getActionDispatcher());
  });

  it('can be disposed twice', async () => {
    const designer = await build();
    designer.dispose();
    expect(() => designer.dispose()).not.toThrow();
  });
});

describe('Designer drag pivot (BL-47)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resets its own drag pivot on a layout change, not the last one built', async () => {
    const first = await buildHarness();
    const second = await buildHarness();

    const firstReset = jest.spyOn(internals(first.designer)._dragManager.getDragPivot(), 'reset');
    const secondReset = jest.spyOn(internals(second.designer)._dragManager.getDragPivot(), 'reset');

    first.designer.applyLayout('tree');

    expect(firstReset).toHaveBeenCalled();
    expect(secondReset).not.toHaveBeenCalled();
  });
});

describe('Designer enddragging (BL-49)', () => {
  it('does not apply a cancelled drag', async () => {
    const { designer } = await buildHarness();
    const listeners = (
      internals(designer)._dragManager as unknown as {
        _listeners: { enddragging: (event: MouseEvent, dragTopic: DragTopic) => void };
      }
    )._listeners;

    const applyChanges = jest.fn();
    const dragTopic = { isCancelled: () => true, applyChanges } as unknown as DragTopic;
    const enable = jest.spyOn(designer.getModel().getTopics()[1], 'setMouseEventsEnabled');

    listeners.enddragging(new MouseEvent('mouseup'), dragTopic);

    expect(applyChanges).not.toHaveBeenCalled();
    // The topics get their mouse events back either way ...
    expect(enable).toHaveBeenCalledWith(true);
  });
});
