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

import { buildDesigner, SAMPLE_MAP } from './designer-harness';

/**
 * Commands flagged with the same discardDuplicated key (the color pickers) are
 * collapsed into one undo step, so picking several colors in a row is undone at
 * once. That only holds for the same targets, and the step must undo back to
 * the value before the first pick.
 */
describe('DesignerUndoManager merging of duplicated commands', () => {
  const undoSteps = (designer: Awaited<ReturnType<typeof buildDesigner>>['designer']) => {
    let steps = -1;
    const listener = (event?: unknown) => {
      steps = (event as { undoSteps: number }).undoSteps;
    };
    designer.addEvent('modelUpdate', listener);
    designer.getActionDispatcher().actionRunner.fireChangeEvent();
    designer.removeEvent('modelUpdate', listener);
    return steps;
  };

  it('undoes successive picks on the same topic in one step, back to the first value', async () => {
    // A starts black.
    const map = SAMPLE_MAP.replace('text="A" ', 'text="A" fontStyle=";;#000000;;;" ');
    const { designer, save, topic } = await buildDesigner(map);
    const dispatcher = designer.getActionDispatcher();
    const before = save();
    expect(topic(1).getModel().getFontColor()).toBe('#000000');

    dispatcher.changeFontColorToTopic([1], '#ff0000');
    dispatcher.changeFontColorToTopic([1], '#00ff00');
    const after = save();
    expect(undoSteps(designer)).toBe(1);

    designer.undo();
    expect(topic(1).getModel().getFontColor()).toBe('#000000');
    expect(save()).toEqual(before);

    designer.redo();
    expect(topic(1).getModel().getFontColor()).toBe('#00ff00');
    expect(save()).toEqual(after);
  });

  it('keeps changes on different topics as separate undo steps', async () => {
    const { designer, save, topic } = await buildDesigner();
    const dispatcher = designer.getActionDispatcher();
    const before = save();

    dispatcher.changeFontColorToTopic([1], '#ff0000');
    const afterFirst = save();
    dispatcher.changeFontColorToTopic([3], '#00ff00');
    const afterSecond = save();
    expect(undoSteps(designer)).toBe(2);

    designer.undo();
    expect(topic(3).getModel().getFontColor()).toBeUndefined();
    expect(topic(1).getModel().getFontColor()).toBe('#ff0000');
    expect(save()).toEqual(afterFirst);

    designer.undo();
    expect(topic(1).getModel().getFontColor()).toBeUndefined();
    expect(save()).toEqual(before);

    designer.redo();
    designer.redo();
    expect(save()).toEqual(afterSecond);
  });
});
