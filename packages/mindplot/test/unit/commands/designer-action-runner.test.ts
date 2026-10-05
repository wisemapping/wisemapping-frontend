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

import LayoutEventBus from '../../../src/components/layout/LayoutEventBus';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import { buildDesigner } from './designer-harness';

/**
 * Undo/redo with nothing to undo or redo must not report a model update: the
 * editor autosaves on modelUpdate, so it would mark an untouched map as dirty.
 */
describe('DesignerActionRunner undo/redo on an empty stack', () => {
  it.each(['undo', 'redo'] as const)('%s does nothing on an empty stack', async (action) => {
    const { designer, save } = await buildDesigner();
    const before = save();

    const modelUpdate = jest.fn();
    designer.addEvent('modelUpdate', modelUpdate);
    const fireLayoutEvent = jest.spyOn(LayoutEventBus, 'fireEvent');

    designer[action]();

    expect(modelUpdate).not.toHaveBeenCalled();
    expect(fireLayoutEvent).not.toHaveBeenCalledWith('forceLayout');
    expect(save()).toEqual(before);
    fireLayoutEvent.mockRestore();
  });

  it('still reports the update when there is something to undo and redo', async () => {
    const { designer } = await buildDesigner();
    designer.getActionDispatcher().changeTextToTopic([1], 'Changed');

    const modelUpdate = jest.fn();
    designer.addEvent('modelUpdate', modelUpdate);

    designer.undo();
    expect(modelUpdate).toHaveBeenLastCalledWith({ undoSteps: 0, redoSteps: 1 });

    designer.redo();
    expect(modelUpdate).toHaveBeenLastCalledWith({ undoSteps: 1, redoSteps: 0 });
  });
});

/**
 * BL5-94: a command that connects a topic lays out in Topic.connectTo (its forceLayout), then the
 * runner fired forceLayout again with nothing left to lay out. Layout is idempotent, so that
 * second one is skipped; a command that leaves a change for the layout still gets one.
 */
describe('DesignerActionRunner layouts per command (BL5-94)', () => {
  it('lays out once for a command whose connection laid out already', async () => {
    const { designer, topic } = await buildDesigner();
    const layout = jest.spyOn(LayoutManager.prototype, 'layout');

    const model = designer.getMindmap().createNode('MainTopic');
    model.setText('A2');
    model.setPosition(350, 0);
    model.setOrder(1);
    designer.getActionDispatcher().addTopics([model], [1]);

    expect(topic(model.getId()).getParent()?.getId()).toBe(1);
    // Before: 2, the second one moving nothing.
    expect(layout).toHaveBeenCalledTimes(1);
    layout.mockRestore();
  });
});
