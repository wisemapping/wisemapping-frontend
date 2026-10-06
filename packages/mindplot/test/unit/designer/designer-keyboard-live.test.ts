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

import DesignerKeyboard from '../../../src/components/DesignerKeyboard';
import { $msg } from '../../../src/components/Messages';
import ToolbarNotifier from '../../../src/components/model/ToolbarNotifier';
import type { Harness } from '../commands/designer-harness';
import { buildDesigner } from '../commands/designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * The keyboard of a live designer, driven by real key events on the document.
 *
 * Laid out as a mind map:            As a tree:
 *   C (0,0)                            C (0,0)
 *   ├── R1 (113,-23.5), collapsed      R1 (-93,107)  L1 (0,107)  R2 (93,107)
 *   │   ├── R1a (226,-47)              R1a, R1b (y 214)  L1a (0,214)
 *   │   └── R1b (226,0)
 *   ├── L1 (-113,0)
 *   │   └── L1a (-226,0)
 *   └── R2 (113,23.5)
 *   F (600,600), floating
 */
const MAP = `<map name="nav" version="tango">
<topic id="0" central="true" text="C">
  <topic id="1" text="R1" order="0" shrink="true">
    <topic id="11" text="R1a" order="0"/>
    <topic id="12" text="R1b" order="1"/>
  </topic>
  <topic id="2" text="L1" order="1"><topic id="21" text="L1a" order="0"/></topic>
  <topic id="3" text="R2" order="2"/>
</topic>
<topic id="5" text="F" position="600,600"/>
</map>`;
const TREE = MAP.replace('version="tango"', 'version="tango" layout="tree"');
const EXPANDED = MAP.replace(' shrink="true"', '');

const KEYS: Record<string, string> = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown',
};

const press = (key: string, modifiers: Partial<KeyboardEventInit> = {}): void => {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: KEYS[key] ?? key, bubbles: true, ...modifiers }),
  );
};

const harnesses: Harness[] = [];

const open = async (xml = MAP): Promise<Harness> => {
  const harness = await buildDesigner(xml);
  harnesses.push(harness);
  harness.designer.deselectAll();
  harness.designer.getContainer().dispatchEvent(new MouseEvent('mouseenter'));
  return harness;
};

const select = (harness: Harness, id: number) => {
  harness.designer.deselectAll();
  harness.topic(id).setOnFocus(true);
};

const selected = (harness: Harness): number | undefined =>
  harness.designer.getModel().selectedTopic()?.getId();

/** Selects `from`, presses the arrow, and answers the topic selected after it. */
const arrow = (harness: Harness, from: number, key: string): number | undefined => {
  select(harness, from);
  press(key);
  return selected(harness);
};

let notify: jest.SpyInstance;
beforeEach(() => {
  notify = jest.spyOn(ToolbarNotifier, 'show').mockImplementation(() => undefined);
});

afterEach(() => {
  harnesses.splice(0).forEach((harness) => harness.designer.dispose());
  jest.restoreAllMocks();
});

describe('DesignerKeyboard arrow navigation on a mind map', () => {
  it('selects the central topic when nothing is selected', async () => {
    const harness = await open();
    press('right');
    expect(selected(harness)).toBe(0);
  });

  it('goes from the central topic to the child on the side of the arrow', async () => {
    const harness = await open();
    expect(arrow(harness, 0, 'right')).toBe(1);
    expect(arrow(harness, 0, 'left')).toBe(2);
  });

  it('walks towards the root, and away from it into the children', async () => {
    const harness = await open();
    expect(arrow(harness, 2, 'right')).toBe(0);
    expect(arrow(harness, 2, 'left')).toBe(21);
    expect(arrow(harness, 21, 'right')).toBe(2);
  });

  it('expands a collapsed branch to step into it', async () => {
    const harness = await open();
    expect(harness.topic(1).areChildrenShrunken()).toBe(true);
    expect(arrow(harness, 1, 'right')).toBe(11);
    expect(harness.topic(1).areChildrenShrunken()).toBe(false);
    expect(arrow(harness, 12, 'left')).toBe(1);
  });

  it('moves between siblings on the same side with up and down', async () => {
    const harness = await open();
    expect(arrow(harness, 1, 'down')).toBe(3);
    expect(arrow(harness, 3, 'up')).toBe(1);
    // L1 has no sibling on its side, and nothing above it in line.
    expect(arrow(harness, 2, 'up')).toBe(2);
  });

  it('falls back to the closest topic in line with the arrow', async () => {
    // F, floating level with R1b, has no parent to walk back to: left finds R1b.
    const harness = await open(EXPANDED.replace('position="600,600"', 'position="600,0"'));
    expect(arrow(harness, 5, 'left')).toBe(12);
    // Nothing further left of L1a.
    expect(arrow(harness, 21, 'left')).toBe(21);
  });

  it('does not land on a topic hidden in a collapsed branch', async () => {
    const harness = await open();
    expect(arrow(harness, 3, 'right')).toBe(3);
    expect(harness.topic(1).areChildrenShrunken()).toBe(true);
  });

  it('stays on a floating topic with nothing in line', async () => {
    const harness = await open();
    expect(arrow(harness, 5, 'up')).toBe(5);
  });
});

describe('DesignerKeyboard arrow navigation on a tree', () => {
  it('goes down to the closest child and up to the parent', async () => {
    const harness = await open(TREE);
    expect(arrow(harness, 0, 'down')).toBe(2);
    expect(arrow(harness, 2, 'down')).toBe(21);
    expect(arrow(harness, 21, 'up')).toBe(2);
    expect(arrow(harness, 2, 'up')).toBe(0);
  });

  it('moves between siblings with left and right', async () => {
    const harness = await open(TREE);
    expect(arrow(harness, 2, 'left')).toBe(1);
    expect(arrow(harness, 2, 'right')).toBe(3);
  });

  it('expands a collapsed branch to go down into it', async () => {
    const harness = await open(TREE);
    expect(arrow(harness, 1, 'down')).toBe(11);
    expect(harness.topic(1).areChildrenShrunken()).toBe(false);
  });

  it('stays put at the edges of the tree', async () => {
    const harness = await open(TREE);
    expect(arrow(harness, 0, 'up')).toBe(0);
    expect(arrow(harness, 3, 'down')).toBe(3);
  });
});

describe('DesignerKeyboard shortcuts', () => {
  it.each([
    ['Enter', {}, 'createSiblingForSelectedNode'],
    ['Tab', {}, 'createChildForSelectedNode'],
    ['Insert', {}, 'createChildForSelectedNode'],
    [' ', {}, 'shrinkSelectedBranch'],
    ['z', { ctrlKey: true }, 'undo'],
    ['z', { ctrlKey: true, shiftKey: true }, 'redo'],
    ['c', { metaKey: true }, 'copyToClipboard'],
    ['v', { ctrlKey: true }, 'pasteClipboard'],
    ['l', { ctrlKey: true }, 'addLink'],
    ['k', { metaKey: true }, 'addNote'],
    ['a', { ctrlKey: true }, 'selectAll'],
    ['b', { ctrlKey: true }, 'changeFontWeight'],
    ['i', { metaKey: true }, 'changeFontStyle'],
    ['Backspace', {}, 'deleteSelectedEntities'],
  ] as const)('%s %j calls Designer.%s', async (key, modifiers, method) => {
    const harness = await open();
    select(harness, 3);
    const spy = jest.spyOn(harness.designer, method).mockImplementation(() => undefined);
    press(key, modifiers);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('ctrl+shift+a deselects everything', async () => {
    const harness = await open();
    select(harness, 3);
    press('a', { ctrlKey: true, shiftKey: true });
    expect(selected(harness)).toBeUndefined();
  });

  it('f2 opens the text editor of the selected topic with its text', async () => {
    const harness = await open();
    const showEditor = jest.spyOn(harness.topic(3), 'showTextEditor').mockImplementation();
    press('F2');
    expect(showEditor).not.toHaveBeenCalled();

    select(harness, 3);
    press('F2');
    expect(showEditor).toHaveBeenCalledWith('R2');
  });

  it('ctrl+shift+v pastes as a child of the selected topic, and needs a selection', async () => {
    const harness = await open();
    const paste = jest.spyOn(harness.designer, 'pasteClipboardAsChild').mockResolvedValue();
    press('v', { ctrlKey: true, shiftKey: true });
    expect(paste).not.toHaveBeenCalled();

    select(harness, 3);
    press('v', { ctrlKey: true, shiftKey: true });
    expect(paste).toHaveBeenCalledWith(3);
  });

  it('alt+shift+arrows move the selected topic in the tree, and need a selection', async () => {
    const harness = await open();
    const move = jest.spyOn(harness.designer, 'moveTopicInTree').mockReturnValue(true);
    press('up', { altKey: true, shiftKey: true });
    expect(move).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith($msg('ONE_TOPIC_MUST_BE_SELECTED'), true);

    select(harness, 3);
    (
      [
        ['up', 'up'],
        ['down', 'down'],
        ['left', 'outdent'],
        ['right', 'indent'],
      ] as const
    ).forEach(([key, expected]) => {
      press(key, { altKey: true, shiftKey: true });
      expect(move).toHaveBeenLastCalledWith(harness.topic(3), expected);
    });
  });
});

describe('DesignerKeyboard typing on a selected topic', () => {
  const type = (key: string, init: Partial<KeyboardEventInit> = {}) =>
    document.dispatchEvent(new KeyboardEvent('keypress', { key, bubbles: true, ...init }));

  it('opens the text editor with the typed character', async () => {
    const harness = await open();
    select(harness, 3);
    const showEditor = jest.spyOn(harness.topic(3), 'showTextEditor').mockImplementation();
    type('x', { code: 'KeyX' });
    expect(showEditor).toHaveBeenCalledWith('x');
  });

  it('ignores modified keys, excluded keys and an empty selection', async () => {
    const harness = await open();
    const showEditor = jest.spyOn(harness.topic(3), 'showTextEditor').mockImplementation();
    type('x', { code: 'KeyX' });

    select(harness, 3);
    type('x', { code: 'KeyX', ctrlKey: true });
    type('x', { code: 'KeyX', metaKey: true });
    type('Enter', { code: 'Enter' });
    expect(showEditor).not.toHaveBeenCalled();
  });

  it('ignores typing while the keyboard is paused', async () => {
    const harness = await open();
    select(harness, 3);
    const showEditor = jest.spyOn(harness.topic(3), 'showTextEditor').mockImplementation();
    DesignerKeyboard.pause();
    try {
      type('x', { code: 'KeyX' });
      press('Enter');
    } finally {
      DesignerKeyboard.resume();
    }
    expect(showEditor).not.toHaveBeenCalled();
  });
});

describe('DesignerKeyboard lifecycle', () => {
  it('stops driving the designer once disposed, and can be disposed twice', async () => {
    const harness = await open();
    select(harness, 3);
    const keyboard = (harness.designer as unknown as { _keyboard: DesignerKeyboard })._keyboard;
    const remove = jest
      .spyOn(harness.designer, 'deleteSelectedEntities')
      .mockImplementation(() => undefined);
    const showEditor = jest.spyOn(harness.topic(3), 'showTextEditor').mockImplementation();

    keyboard.dispose();
    keyboard.dispose();
    press('Delete');
    document.dispatchEvent(new KeyboardEvent('keypress', { key: 'x', code: 'KeyX' }));
    expect(remove).not.toHaveBeenCalled();
    expect(showEditor).not.toHaveBeenCalled();
  });

  it('becomes the active keyboard on a pointer down', async () => {
    const first = await open();
    const second = await open();
    const keyboardOf = (harness: Harness) =>
      (harness.designer as unknown as { _keyboard: DesignerKeyboard })._keyboard;
    expect(keyboardOf(second).isActive()).toBe(true);

    first.designer.getContainer().dispatchEvent(new Event('pointerdown'));
    expect(keyboardOf(first).isActive()).toBe(true);
    expect(keyboardOf(second).isActive()).toBe(false);
  });
});
