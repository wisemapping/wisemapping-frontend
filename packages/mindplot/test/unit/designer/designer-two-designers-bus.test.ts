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

/*
 * Each designer has its own layout bus (T3). With the module-level bus, an edit in one designer
 * ran the layout handlers of every designer on the page, and a web font load made each designer
 * lay out the others (BL5-163).
 */
import { buildDesigner, Harness } from '../commands/designer-harness';
import EventBusDispatcher from '../../../src/components/layout/EventBusDispatcher';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import Designer from '../../../src/components/Designer';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const layoutManagerOf = (designer: Designer): LayoutManager =>
  (
    designer as unknown as { _eventBussDispatcher: EventBusDispatcher }
  )._eventBussDispatcher.getLayoutManager();

/** Spies on everything of `designer` that a layout event or a designer event would run. */
const watch = (designer: Designer) => {
  const manager = layoutManagerOf(designer);
  const spies = [
    jest.spyOn(manager, 'needsLayout'),
    jest.spyOn(manager, 'layout'),
    jest.spyOn(manager, 'addNode'),
    jest.spyOn(manager, 'connectNode'),
    jest.spyOn(manager, 'updateNodeSize'),
    jest.spyOn(manager, 'moveNode'),
    jest.spyOn(designer.getWorkSpace(), 'ensureVisible'),
  ];
  const designerEvents = jest.fn();
  (['modelUpdate', 'onfocus', 'onblur', 'featureEdit'] as const).forEach((type) =>
    designer.addEvent(type, designerEvents),
  );
  return {
    calls: () =>
      spies.reduce((count, spy) => count + spy.mock.calls.length, 0) +
      designerEvents.mock.calls.length,
  };
};

const nextFrame = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });

describe('Two designers on one page', () => {
  let first: Harness;
  let second: Harness;

  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    first = await buildDesigner();
    second = await buildDesigner();
  });

  afterEach(() => {
    first.designer.dispose();
    second.designer.dispose();
    jest.restoreAllMocks();
  });

  it('runs no layout or handler of the other designer on an edit', async () => {
    const other = watch(second.designer);
    const own = watch(first.designer);

    // Add a child, select it, rename it, move a topic, undo: every layout event there is ...
    const { designer } = first;
    designer.goToNode(first.topic(1));
    designer.createChildForSelectedNode();
    designer
      .getActionDispatcher()
      .changeTextToTopic([first.topic(1).getId()], 'A much longer text');
    designer.getActionDispatcher().moveTopic(0, { x: 10, y: 10 });
    designer.undo();
    await Promise.resolve();

    expect(own.calls()).toBeGreaterThan(0);
    expect(other.calls()).toBe(0);
  });

  it('keeps the selection shadows and auto-pan of a designer to its own topics', () => {
    const topic = first.topic(2);
    const otherShadows = [...second.designer.getSelectionShadows().keys()];
    const otherPan = jest.spyOn(second.designer.getWorkSpace(), 'ensureVisible');
    const ownPan = jest.spyOn(first.designer.getWorkSpace(), 'ensureVisible');

    first.designer.getLayoutEventBus().fireEvent('topicSelected', topic.getModel());

    expect(first.designer.getSelectionShadows().has(topic)).toBe(true);
    expect(ownPan).toHaveBeenCalled();
    expect([...second.designer.getSelectionShadows().keys()]).toEqual(otherShadows);
    expect(otherPan).not.toHaveBeenCalled();
  });

  it('lays out each designer once on a web font load (BL5-163)', async () => {
    const fonts = new EventTarget();
    Object.defineProperty(document, 'fonts', { value: fonts, configurable: true });
    try {
      const a = await buildDesigner();
      const b = await buildDesigner();
      const aChecks = jest.spyOn(layoutManagerOf(a.designer), 'needsLayout');
      const bChecks = jest.spyOn(layoutManagerOf(b.designer), 'needsLayout');

      fonts.dispatchEvent(new Event('loadingdone'));
      await nextFrame();

      // Each designer's forceLayout reaches its own layout only ...
      expect(aChecks).toHaveBeenCalledTimes(1);
      expect(bChecks).toHaveBeenCalledTimes(1);
      a.designer.dispose();
      b.designer.dispose();
    } finally {
      delete (document as unknown as { fonts?: unknown }).fonts;
    }
  });

  it('gives each designer, and each topic of it, its own bus', () => {
    const firstBus = first.designer.getLayoutEventBus();
    expect(second.designer.getLayoutEventBus()).not.toBe(firstBus);
    expect(first.topic(1).getLayoutEventBus()).toBe(firstBus);
  });
});
