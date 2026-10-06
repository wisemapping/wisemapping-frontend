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

import { buildDesigner } from '../commands/designer-harness';
import type Designer from '../../../src/components/Designer';
import type Topic from '../../../src/components/Topic';
import DragConnector from '../../../src/components/DragConnector';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

type DragListeners = Record<
  'startdragging' | 'dragging' | 'enddragging',
  (...args: unknown[]) => void
>;

const dragListeners = (designer: Designer): DragListeners =>
  (designer as unknown as { _dragManager: { _listeners: DragListeners } })._dragManager._listeners;

const spyMouseEvents = (topic: Topic): jest.SpyInstance =>
  jest.spyOn(topic, 'setMouseEventsEnabled');

/**
 * While a topic is dragged every other topic stops taking mouse events. The
 * drag handlers must work on the topics on the canvas now, not on the list
 * there was when the Designer was built: deleting a topic replaces that list.
 */
describe('Designer drag handlers', () => {
  it('disables topics added after a delete, and skips the deleted ones', async () => {
    const { designer, topic } = await buildDesigner();
    const deleted = topic(5);

    designer.getActionDispatcher().deleteEntities([5], []);
    designer
      .getModel()
      .filterSelectedTopics()
      .forEach((t) => t.setOnFocus(false));
    topic(3).setOnFocus(true);
    designer.createChildForSelectedNode();
    const added = designer.getModel().selectedTopic()!;
    expect(added.getId()).not.toBe(3);

    const addedSpy = spyMouseEvents(added);
    const deletedSpy = spyMouseEvents(deleted);
    const listeners = dragListeners(designer);

    listeners.startdragging();
    expect(addedSpy).toHaveBeenCalledWith(false);

    const dragTopic = { applyChanges: jest.fn(), isCancelled: () => false };
    listeners.enddragging({}, dragTopic);
    expect(addedSpy).toHaveBeenCalledWith(true);

    expect(deletedSpy).not.toHaveBeenCalled();
  });
});

/*
 * A topic dragged with the shortcut modifier held is dragged disconnected from every topic. The
 * modifier is the one the help shows and the selection reads (hasShortcutModifier): Cmd on a Mac,
 * Ctrl elsewhere. A Ctrl press on a Mac is the right click: it opens the context menu.
 */
describe('Designer drag to disconnect', () => {
  const onPlatform = (platform: string) => {
    Object.defineProperty(window.navigator, 'platform', { value: platform, configurable: true });
  };

  afterEach(() => {
    delete (window.navigator as { platform?: string }).platform;
    jest.restoreAllMocks();
  });

  /** Whether a drag step with these modifiers is forced to stay disconnected. */
  const forcesDisconnect = async (init: MouseEventInit): Promise<boolean> => {
    const checkConnection = jest
      .spyOn(DragConnector.prototype, 'checkConnection')
      .mockImplementation(() => undefined);
    checkConnection.mockClear();
    const { designer } = await buildDesigner();
    const dragTopic = { isVisible: () => true, isConnected: () => true };

    dragListeners(designer).dragging(new MouseEvent('mousemove', init), dragTopic);
    designer.dispose();

    expect(checkConnection).toHaveBeenCalledTimes(1);
    return checkConnection.mock.calls[0]![1];
  };

  it('Ctrl disconnects elsewhere, and the Windows key does not', async () => {
    onPlatform('Win32');
    expect(await forcesDisconnect({ ctrlKey: true })).toBe(true);
    // Before: the Windows key (Super on Linux) disconnected too.
    expect(await forcesDisconnect({ metaKey: true })).toBe(false);
    expect(await forcesDisconnect({})).toBe(false);
  });

  it('Cmd disconnects on a Mac, and Ctrl does not', async () => {
    onPlatform('MacIntel');
    expect(await forcesDisconnect({ metaKey: true })).toBe(true);
    // Before: Ctrl disconnected too, though on a Mac its press opens the context menu.
    expect(await forcesDisconnect({ ctrlKey: true })).toBe(false);
  });
});
