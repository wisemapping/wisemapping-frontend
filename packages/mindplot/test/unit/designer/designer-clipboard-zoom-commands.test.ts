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

import Designer from '../../../src/components/Designer';
import { $msg } from '../../../src/components/Messages';
import ToolbarNotifier from '../../../src/components/model/ToolbarNotifier';
import { buildDesigner, Harness, SAMPLE_MAP } from '../commands/designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/** Copy and paste, zoom limits, collapse and new topics of a live designer. */

const undoSteps = (designer: Designer): number => {
  let steps = -1;
  const listener = (event?: unknown) => {
    steps = (event as { undoSteps: number }).undoSteps;
  };
  designer.addEvent('modelUpdate', listener);
  designer.getActionDispatcher().actionRunner.fireChangeEvent();
  designer.removeEvent('modelUpdate', listener);
  return steps;
};

const harnesses: Harness[] = [];
const open = async (): Promise<Harness> => {
  const harness = await buildDesigner();
  harnesses.push(harness);
  harness.designer.deselectAll();
  return harness;
};

const select = (harness: Harness, ...ids: number[]) => {
  harness.designer.deselectAll();
  ids.forEach((id) => harness.topic(id).setOnFocus(true));
};

const texts = (harness: Harness) =>
  harness.designer
    .getModel()
    .getTopics()
    .map((topic) => topic.getModel().getText());

type ClipboardStub = {
  write?: jest.Mock;
  read?: jest.Mock;
};

const setClipboard = (
  clipboard: ClipboardStub | undefined,
  permission?: () => Promise<unknown>,
) => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
  Object.defineProperty(navigator, 'permissions', {
    configurable: true,
    value: permission ? { query: permission } : undefined,
  });
};

/** A blob with text(), which the jsdom Blob lacks. */
const textBlob = (text: string) => ({ type: 'text/plain', text: async () => text }) as Blob;

/** The text of a blob the designer built, read the way jsdom allows. */
const readBlob = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });

/** A ClipboardItem that keeps its blobs, which jsdom does not provide. */
class FakeClipboardItem {
  constructor(readonly blobs: Record<string, Blob>) {}

  get types() {
    return Object.keys(this.blobs);
  }

  async getType(type: string) {
    return this.blobs[type];
  }
}

let notify: jest.SpyInstance;
beforeEach(() => {
  notify = jest.spyOn(ToolbarNotifier, 'show').mockImplementation(() => undefined);
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  (globalThis as unknown as { ClipboardItem: unknown }).ClipboardItem = FakeClipboardItem;
  setClipboard(undefined);
});

afterEach(() => {
  harnesses.splice(0).forEach((harness) => harness.designer.dispose());
  setClipboard(undefined);
  jest.restoreAllMocks();
});

describe('Designer copy and paste through the internal clipboard', () => {
  it('copies nothing without a selection, or with only the central topic', async () => {
    const harness = await open();
    await harness.designer.copyToClipboard();
    select(harness, 0);
    await harness.designer.copyToClipboard();

    select(harness);
    const before = harness.save();
    await harness.designer.pasteClipboard();
    expect(harness.save()).toEqual(before);
  });

  it('pastes a copied branch as new floating topics, and undo takes them off the canvas', async () => {
    const harness = await open();
    select(harness, 0, 3);
    await harness.designer.copyToClipboard();
    const count = harness.designer.getModel().getTopics().length;

    await harness.designer.pasteClipboard();
    // B and its child B1, copied; the central topic is left out.
    expect(harness.designer.getModel().getTopics()).toHaveLength(count + 2);
    expect(texts(harness).filter((text) => text === 'B')).toHaveLength(2);
    expect(texts(harness).filter((text) => text === 'B1')).toHaveLength(2);

    harness.designer.undo();
    expect(harness.designer.getModel().getTopics()).toHaveLength(count);
  });

  it('removes the undone pasted topics from the saved map', async () => {
    const harness = await open();
    select(harness, 3);
    await harness.designer.copyToClipboard();
    const before = harness.save();

    await harness.designer.pasteClipboard();
    harness.designer.undo();
    expect(harness.save()).toEqual(before);
  });

  it('styles a pasted floating topic with the theme of the map', async () => {
    const harness = await buildDesigner(
      SAMPLE_MAP.replace('version="tango"', 'version="tango" theme="ocean"'),
    );
    harnesses.push(harness);
    select(harness, 4);
    await harness.designer.copyToClipboard();
    await harness.designer.pasteClipboard();

    const pasted = harness.designer.getModel().getTopics().slice(-1)[0]!;
    expect(pasted.getModel().getMindmap()).toBe(harness.designer.getMindmap());
    expect(pasted.getBackgroundColor('light')).toBe(harness.topic(5).getBackgroundColor('light'));
  });

  it('pastes the branch as children of a topic', async () => {
    const harness = await open();
    select(harness, 4);
    await harness.designer.copyToClipboard();

    await harness.designer.pasteClipboardAsChild(1);
    const children = harness
      .topic(1)
      .getChildren()
      .map((child) => child.getModel().getText());
    expect(children).toEqual(['A1', 'B1']);
    // The pasted topic belongs to the map it was pasted in.
    const pasted = harness.topic(1).getChildren()[1]!.getModel();
    expect(pasted.getMindmap()).toBe(harness.designer.getMindmap());
  });

  it('says so when pasting as a child with an empty clipboard or no parent', async () => {
    const harness = await open();
    await harness.designer.pasteClipboardAsChild(1);
    expect(notify).toHaveBeenLastCalledWith($msg('CLIPBOARD_IS_EMPTY'), true);
    await harness.designer.pasteClipboardAsChild(99);
    expect(notify).toHaveBeenLastCalledWith($msg('ONE_TOPIC_MUST_BE_SELECTED'), true);
  });
});

describe('Designer copy and paste through the system clipboard', () => {
  it('writes the map as text, and pastes what the clipboard holds', async () => {
    const harness = await open();
    const items: FakeClipboardItem[] = [];
    setClipboard(
      {
        write: jest.fn(async (written: FakeClipboardItem[]) => {
          items.push(...written);
        }),
        read: jest.fn(async () => items),
      },
      async () => ({ state: 'granted' }),
    );

    select(harness, 4);
    await harness.designer.copyToClipboard();
    expect(items).toHaveLength(1);
    const written = await readBlob(items[0]!.blobs['text/plain']!);
    expect(written).toContain('text="B1"');
    // Read back through a blob with text(), as a browser clipboard gives it.
    items[0] = new FakeClipboardItem({ 'text/plain': textBlob(written) });

    const count = harness.designer.getModel().getTopics().length;
    await harness.designer.pasteClipboard();
    expect(harness.designer.getModel().getTopics()).toHaveLength(count + 1);
  });

  it('writes to the clipboard when the browser can not query the permission', async () => {
    const harness = await open();
    const write = jest.fn(async () => undefined);
    setClipboard({ write }, async () => {
      throw new Error('clipboard-write is not a permission name');
    });

    select(harness, 4);
    await harness.designer.copyToClipboard();
    expect(write).toHaveBeenCalledTimes(1);
  });

  it('does not write to the clipboard when the permission is denied', async () => {
    const harness = await open();
    const write = jest.fn(async () => undefined);
    setClipboard({ write }, async () => ({ state: 'denied' }));

    select(harness, 4);
    await harness.designer.copyToClipboard();
    expect(write).not.toHaveBeenCalled();
  });

  it('falls back to the internal clipboard when the system one fails', async () => {
    const harness = await open();
    setClipboard(
      {
        write: jest.fn(async () => {
          throw new Error('denied');
        }),
        read: jest.fn(async () => {
          throw new Error('denied');
        }),
      },
      async () => ({ state: 'prompt' }),
    );

    select(harness, 4);
    await harness.designer.copyToClipboard();
    const count = harness.designer.getModel().getTopics().length;
    await harness.designer.pasteClipboard();
    expect(harness.designer.getModel().getTopics()).toHaveLength(count + 1);
  });

  it('pastes plain text into the selected topics', async () => {
    const harness = await open();
    const text = new FakeClipboardItem({ 'text/plain': textBlob('  Pasted  ') });
    setClipboard({ read: jest.fn(async () => [text]) });

    select(harness, 1, 3);
    await harness.designer.pasteClipboard();
    expect(harness.topic(1).getModel().getText()).toBe('Pasted');
    expect(harness.topic(3).getModel().getText()).toBe('Pasted');
  });

  it('does not add an undo step when pasting text with nothing selected', async () => {
    const harness = await open();
    const text = new FakeClipboardItem({ 'text/plain': textBlob('Pasted') });
    setClipboard({ read: jest.fn(async () => [text]) });
    const changed = jest.fn();
    harness.designer.addEvent('modelUpdate', changed);

    await harness.designer.pasteClipboard();
    expect(changed).not.toHaveBeenCalled();
    expect(undoSteps(harness.designer)).toBe(0);
  });
});

describe('Designer zoom limits', () => {
  it('refuses to zoom in or out past the limits, and says so', async () => {
    const harness = await open();
    const zoom = () => harness.designer.getModel().getZoom();

    for (let i = 0; i < 50; i += 1) harness.designer.zoomIn();
    const closest = zoom();
    harness.designer.zoomIn();
    expect(zoom()).toBe(closest);
    expect(notify).toHaveBeenLastCalledWith($msg('ZOOM_ERROR'), true);

    notify.mockClear();
    for (let i = 0; i < 50; i += 1) harness.designer.zoomOut();
    const farthest = zoom();
    expect(farthest).toBeGreaterThan(closest);
    harness.designer.zoomOut();
    expect(zoom()).toBe(farthest);
    expect(notify).toHaveBeenLastCalledWith($msg('ZOOM_ERROR'), true);
  });
});

describe('Designer collapse and new topics need one selected topic', () => {
  it('collapses and expands the selected branch, but not the central topic', async () => {
    const harness = await open();
    select(harness, 1);
    harness.designer.shrinkSelectedBranch();
    expect(harness.topic(1).areChildrenShrunken()).toBe(true);
    harness.designer.shrinkSelectedBranch();
    expect(harness.topic(1).areChildrenShrunken()).toBe(false);

    select(harness, 0);
    harness.designer.shrinkSelectedBranch();
    expect(undoSteps(harness.designer)).toBe(2);
  });

  it.each([
    ['shrinkSelectedBranch', [], 'ONLY_ONE_TOPIC_MUST_BE_SELECTED_COLLAPSE'],
    ['shrinkSelectedBranch', [1, 3], 'ONLY_ONE_TOPIC_MUST_BE_SELECTED_COLLAPSE'],
    ['createChildForSelectedNode', [], 'ONE_TOPIC_MUST_BE_SELECTED'],
    ['createChildForSelectedNode', [1, 3], 'ONLY_ONE_TOPIC_MUST_BE_SELECTED'],
    ['createSiblingForSelectedNode', [], 'ONE_TOPIC_MUST_BE_SELECTED'],
    ['createSiblingForSelectedNode', [1, 3], 'ONLY_ONE_TOPIC_MUST_BE_SELECTED'],
  ] as const)('%s with %j selected says %s', async (method, ids, message) => {
    const harness = await open();
    select(harness, ...ids);
    const before = harness.save();
    harness.designer[method]();
    expect(harness.save()).toEqual(before);
    expect(notify).toHaveBeenCalledWith($msg(message), true);
  });

  it('adds a child, rather than a sibling, to a floating topic', async () => {
    const harness = await open();
    select(harness, 5);
    harness.designer.createSiblingForSelectedNode();
    expect(harness.topic(5).getChildren()).toHaveLength(1);
  });
});
