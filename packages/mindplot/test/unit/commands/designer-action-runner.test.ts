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

jest.mock('../../../src/components/SvgImageIcon', () => ({
  __esModule: true,
  default: class MockSvgImageIcon {},
}));
jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import LayoutEventBus from '../../../src/components/layout/LayoutEventBus';
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
