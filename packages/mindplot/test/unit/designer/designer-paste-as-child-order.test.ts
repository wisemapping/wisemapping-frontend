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

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import { buildDesigner } from '../commands/designer-harness';
import Designer from '../../../src/components/Designer';
import Topic from '../../../src/components/Topic';

const clipboardWith = (...texts: string[]): string =>
  [
    '<map name="clipboard" version="tango">',
    '  <topic id="100" central="true" text="Central">',
    ...texts.map(
      (text, index) =>
        `    <topic id="${101 + index}" text="${text}" position="100,${index * 30}" order="${index}"/>`,
    ),
    '  </topic>',
    '</map>',
  ].join('\n');

const setClipboard = (designer: Designer, text: string): void => {
  (designer as unknown as { _internalClipboard: string })._internalClipboard = text;
};

const canUndo = (designer: Designer): boolean =>
  (
    designer.getActionDispatcher().actionRunner as unknown as {
      _undoManager: { canUndo: () => boolean };
    }
  )._undoManager.canUndo();

beforeEach(() => {
  // The paste paths log where the clipboard text came from.
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

/** Children of `parent` on one side, as the layout shows them: by order. */
const childrenTextByOrder = (parent: Topic, side?: number): string[] =>
  parent
    .getChildren()
    .filter((child) => side === undefined || (child.getOrder() ?? 0) % 2 === side)
    .sort((a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0))
    .map((child) => child.getModel().getText() ?? '');

/**
 * Pasting as child inserts the copied topics in one step. Each needs its own
 * order: given the same one, every insert pushes the previous ones down and
 * the pasted siblings come out reversed.
 */
describe('Designer.pasteClipboardAsChild on a loaded map', () => {
  it('keeps the copied topics in clipboard order after the existing children', async () => {
    const { designer, topic } = await buildDesigner();
    setClipboard(designer, clipboardWith('P1', 'P2', 'P3'));

    await designer.pasteClipboardAsChild(1);

    expect(childrenTextByOrder(topic(1))).toEqual(['A1', 'P1', 'P2', 'P3']);
  });

  it('keeps the copied topics in clipboard order under the central topic', async () => {
    const { designer, topic } = await buildDesigner();
    setClipboard(designer, clipboardWith('P1', 'P2'));

    await designer.pasteClipboardAsChild(0);

    const central = topic(0);
    const pasted = central
      .getChildren()
      .filter((child) => (child.getModel().getText() ?? '').startsWith('P'));
    const side = (pasted[0].getOrder() ?? 0) % 2;
    expect(childrenTextByOrder(central, side).filter((text) => text.startsWith('P'))).toEqual([
      'P1',
      'P2',
    ]);
  });

  it('pushes no undo step when the clipboard is empty, even on a collapsed parent', async () => {
    const { designer, topic } = await buildDesigner();
    topic(1).setChildrenShrunken(true);

    await designer.pasteClipboardAsChild(1);

    expect(canUndo(designer)).toBe(false);
    expect(topic(1).areChildrenShrunken()).toBe(true);
  });
});

/**
 * A new child of a collapsed topic expands it. The expansion has to go through
 * the undo stack, or undoing leaves the parent open.
 */
describe('Designer.createChildForSelectedNode on a collapsed topic', () => {
  it('collapses the parent again once the add is undone', async () => {
    const { designer, topic } = await buildDesigner();
    const parent = topic(1);
    parent.setChildrenShrunken(true);
    designer
      .getModel()
      .filterSelectedTopics()
      .forEach((t) => t.setOnFocus(false));
    parent.setOnFocus(true);

    designer.createChildForSelectedNode();
    expect(parent.areChildrenShrunken()).toBe(false);
    expect(parent.getChildren()).toHaveLength(2);

    while (canUndo(designer)) {
      designer.undo();
    }

    expect(parent.getChildren()).toHaveLength(1);
    expect(parent.areChildrenShrunken()).toBe(true);
  });

  // BL4-06: AddTopicCommand expands the parent itself, so the add is a single undo step.
  it('reverts the add and the expand with one undo', async () => {
    const { designer, topic, save } = await buildDesigner();
    const parent = topic(1);
    parent.setChildrenShrunken(true);
    const before = save();
    designer.deselectAll();
    parent.setOnFocus(true);

    designer.createChildForSelectedNode();
    expect(parent.areChildrenShrunken()).toBe(false);
    expect(parent.getChildren()).toHaveLength(2);

    designer.undo();

    expect(parent.getChildren()).toHaveLength(1);
    expect(parent.areChildrenShrunken()).toBe(true);
    expect(save()).toEqual(before);
    expect(canUndo(designer)).toBe(false);
  });

  it('places the new child after the hidden ones, as on an expanded parent', async () => {
    const { designer, topic } = await buildDesigner();
    const parent = topic(1);
    parent.setChildrenShrunken(true);
    designer.deselectAll();
    parent.setOnFocus(true);

    designer.createChildForSelectedNode();

    expect(childrenTextByOrder(parent)).toEqual(['A1', '']);
    const [hidden, added] = parent
      .getChildren()
      .sort((a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0));
    expect(added.getPosition().x).toBe(hidden.getPosition().x);
    expect(added.getPosition().y).toBeGreaterThan(hidden.getPosition().y);
  });
});

describe('Designer.pasteClipboardAsChild on a collapsed topic (BL4-06)', () => {
  it('reverts the paste and the expand with one undo', async () => {
    const { designer, topic, save } = await buildDesigner();
    const parent = topic(1);
    parent.setChildrenShrunken(true);
    const before = save();
    setClipboard(designer, clipboardWith('P1', 'P2'));

    await designer.pasteClipboardAsChild(1);
    expect(parent.areChildrenShrunken()).toBe(false);
    expect(childrenTextByOrder(parent)).toEqual(['A1', 'P1', 'P2']);

    designer.undo();

    expect(parent.areChildrenShrunken()).toBe(true);
    expect(save()).toEqual(before);
    expect(canUndo(designer)).toBe(false);
  });
});
