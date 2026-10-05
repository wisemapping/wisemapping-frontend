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

import { buildDesigner } from './designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * Undo of a delete must put every topic back where it was: under its parent
 * (including the central topic, whose id is 0) or, for a floating topic, back
 * in the mindmap branches so it is saved again.
 */
describe('DeleteCommand undo/redo', () => {
  it('reconnects a first-level topic to the central topic (id 0)', async () => {
    const { designer, save, topic } = await buildDesigner();
    const before = save();

    designer.getActionDispatcher().deleteEntities([1], []);
    const after = save();

    designer.undo();
    expect(topic(1).getParent()?.getId()).toBe(0);
    expect(save()).toEqual(before);

    designer.redo();
    expect(save()).toEqual(after);
  });

  it('keeps a restored floating topic in the saved map', async () => {
    const { designer, save, topic } = await buildDesigner();
    const before = save();

    designer.getActionDispatcher().deleteEntities([5], []);
    const after = save();
    expect(after).not.toContain('text="Floating"');

    designer.undo();
    expect(topic(5).getParent()).toBeNull();
    expect(
      designer
        .getMindmap()
        .getBranches()
        .map((b) => b.getId()),
    ).toContain(5);
    expect(save()).toEqual(before);

    designer.redo();
    expect(save()).toEqual(after);
  });

  it('does not hand a floating topic the parent of another deleted topic', async () => {
    const { designer, save, topic } = await buildDesigner();

    // A topic created after load comes after the floating one in the designer
    // model, so the delete walks the floating topic first.
    const model = designer.getMindmap().createNode('MainTopic');
    model.setText('A2');
    model.setPosition(350, 0);
    designer.getActionDispatcher().addTopics([model], [1]);
    const newId = model.getId();
    const before = save();

    designer.getActionDispatcher().deleteEntities([5, newId], []);
    const after = save();

    designer.undo();
    expect(topic(5).getParent()).toBeNull();
    expect(topic(newId).getParent()?.getId()).toBe(1);
    expect(save()).toEqual(before);

    designer.redo();
    expect(save()).toEqual(after);
  });
});
