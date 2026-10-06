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

import type MultitTextEditor from '../../../src/components/MultilineTextEditor';
import type { Harness } from '../commands/designer-harness';
import { buildDesigner } from '../commands/designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * The text editor of a live designer: opened on a topic, typed into, and
 * committed through an undoable command.
 */

const textarea = (): HTMLTextAreaElement | null =>
  document.querySelector('#textContainer textarea');

const container = (): HTMLElement | null => document.querySelector('#textContainer');

const editorOf = (harness: Harness): MultitTextEditor => harness.designer.getTextEditor();

const keydown = (init: KeyboardEventInit) =>
  textarea()!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }));

const type = (text: string) => {
  const element = textarea()!;
  element.value = text;
  element.dispatchEvent(new Event('input', { bubbles: true }));
};

const harnesses: Harness[] = [];
const open = async (): Promise<Harness> => {
  const harness = await buildDesigner();
  harnesses.push(harness);
  return harness;
};

afterEach(() => {
  harnesses.splice(0).forEach((harness) => harness.designer.dispose());
  document.body.innerHTML = '';
  jest.restoreAllMocks();
});

describe('MultilineTextEditor on a live designer', () => {
  it('opens on the topic with its text selected, and hides the topic text', async () => {
    const harness = await open();
    harness.topic(3).showTextEditor(undefined as unknown as string);

    const element = textarea()!;
    expect(element.value).toBe('B');
    expect(element.selectionStart).toBe(0);
    expect(element.selectionEnd).toBe(1);
    expect(container()!.style.display).toBe('block');
    expect(harness.topic(3).getOrBuildTextShape().isVisible()).toBe(false);
    expect(editorOf(harness).getActiveTopic()).toBe(harness.topic(3));
  });

  it('opens with a typed character, the cursor after it', async () => {
    const harness = await open();
    harness.topic(3).showTextEditor('x');
    const element = textarea()!;
    expect(element.value).toBe('x');
    expect(element.selectionStart).toBe(1);
  });

  it('commits the text on Enter as one undoable change', async () => {
    const harness = await open();
    const before = harness.save();
    harness.topic(3).showTextEditor('');
    type('Renamed');
    expect(harness.topic(3).getText()).toBe('Renamed');

    keydown({ code: 'Enter', key: 'Enter' });
    expect(editorOf(harness).isActive()).toBe(false);
    expect(container()).toBeNull();
    expect(harness.topic(3).getModel().getText()).toBe('Renamed');
    expect(harness.topic(3).getOrBuildTextShape().isVisible()).toBe(true);

    harness.designer.undo();
    expect(harness.save()).toEqual(before);
  });

  it.each([{ ctrlKey: true }, { metaKey: true }])(
    'inserts a line break at the cursor on Enter with %j',
    async (modifier) => {
      const harness = await open();
      harness.topic(3).showTextEditor('');
      type('HeadTail');
      const element = textarea()!;
      element.setSelectionRange(4, 4);

      keydown({ code: 'Enter', key: 'Enter', ...modifier });
      expect(element.value).toBe('Head\nTail');
      expect(element.selectionStart).toBe(5);
      expect(element.getAttribute('rows')).toBe('2');
      expect(editorOf(harness).isActive()).toBe(true);
      expect(harness.topic(3).getText()).toBe('Head\nTail');
    },
  );

  it('replaces the selected text with the line break', async () => {
    (await open()).topic(3).showTextEditor('');
    type('Head-Tail');
    textarea()!.setSelectionRange(4, 5);
    keydown({ code: 'Enter', key: 'Enter', ctrlKey: true });
    expect(textarea()!.value).toBe('Head\nTail');
  });

  it('sizes the editor to the longest line', async () => {
    (await open()).topic(3).showTextEditor('');
    type('a\nlonger line\nb');
    const element = textarea()!;
    expect(element.getAttribute('rows')).toBe('3');
    expect(element.getAttribute('cols')).toBe('11');
    expect(container()!.style.width).toBe('13em');
  });

  it('keeps its keys, clicks and touches from reaching the page', async () => {
    const harness = await open();
    harness.topic(3).showTextEditor('');
    const reached = jest.fn();
    ['keydown', 'keypress', 'click', 'dblclick', 'mousedown', 'touchstart', 'touchend'].forEach(
      (name) => document.addEventListener(name, reached),
    );

    keydown({ code: 'KeyA', key: 'a' });
    textarea()!.dispatchEvent(new KeyboardEvent('keypress', { key: 'a', bubbles: true }));
    ['click', 'dblclick', 'mousedown', 'touchstart', 'touchend'].forEach((name) =>
      container()!.dispatchEvent(new Event(name, { bubbles: true })),
    );
    expect(reached).not.toHaveBeenCalled();
    expect(editorOf(harness).isActive()).toBe(true);
  });

  it('takes the colour of the topic text, and none from a text without one', async () => {
    const harness = await open();
    const editor = editorOf(harness);
    const color = harness.topic(3).getOrBuildTextShape().getColor();
    expect(color).toBeTruthy();
    editor.show(harness.topic(3), 'B');
    expect(textarea()!.style.color).not.toBe('');
    expect(container()!.style.color).toBe(textarea()!.style.color);
    editor.close(false);

    jest.spyOn(harness.topic(1).getOrBuildTextShape(), 'getColor').mockReturnValue(null);
    editor.show(harness.topic(1), 'A');

    // Not the colour of the topic edited before.
    expect(textarea()!.style.color).toBe('');
    expect(container()!.style.color).toBe('');
  });

  it('closes a previous editor, unsaved, when opened on another topic', async () => {
    const harness = await open();
    const editor = editorOf(harness);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    editor.show(harness.topic(3), 'draft');
    editor.show(harness.topic(1), 'other');

    expect(warn).toHaveBeenCalledWith('Editor was already displayed. Closing previous editor.');
    expect(harness.topic(3).getModel().getText()).toBe('B');
    expect(document.querySelectorAll('#textContainer')).toHaveLength(1);
    expect(editor.getActiveTopic()).toBe(harness.topic(1));
  });

  it('does not commit to a topic deleted while it was being edited', async () => {
    const harness = await open();
    const editor = editorOf(harness);
    editor.show(harness.topic(5), 'draft');
    harness.designer.getActionDispatcher().deleteEntities([5], []);
    const afterDelete = harness.save();

    editor.close(true);
    expect(editor.isActive()).toBe(false);
    expect(harness.save()).toEqual(afterDelete);
  });

  it('lays the map out once a frame while typing, and not after it closed', async () => {
    const harness = await open();
    harness.topic(3).showTextEditor('');
    const frames: FrameRequestCallback[] = [];
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const layout = jest.fn();
    harness.designer.getLayoutEventBus().addEvent('forceLayout', layout);

    type('a');
    type('ab');
    type('abc');
    expect(frames).toHaveLength(1);
    frames[0]!(0);
    expect(layout).toHaveBeenCalledTimes(1);

    // The layout asks for frames of its own: the editor's next one is the one typing adds.
    const requested = frames.length;
    type('abcd');
    expect(frames).toHaveLength(requested + 1);
    keydown({ code: 'Escape', key: 'Escape' });
    layout.mockClear();
    frames[requested]!(0);
    expect(layout).not.toHaveBeenCalled();
  });

  it('ignores an input event after it closed', async () => {
    const harness = await open();
    harness.topic(3).showTextEditor('');
    const element = textarea()!;
    keydown({ code: 'Escape', key: 'Escape' });

    element.value = 'late';
    element.dispatchEvent(new Event('input'));
    expect(harness.topic(3).getText()).toBe('B');
  });
});
