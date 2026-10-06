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

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

type DragListeners = Record<'startdragging' | 'enddragging', (...args: unknown[]) => void>;

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
    listeners.enddragging({} as MouseEvent, dragTopic);
    expect(addedSpy).toHaveBeenCalledWith(true);

    expect(deletedSpy).not.toHaveBeenCalled();
  });
});
