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

/*
 * New Relic: "node could not be found id:N" thrown from LayoutManager.predict(), called by
 * DragTopic.setPosition() on a mousemove after the dragged topic had been deleted mid-drag
 * (keyboard Delete / Cut while the button is still held). Real Designer and layout, no doubles.
 */
import type LayoutManager from '../../src/components/layout/LayoutManager';
import type Topic from '../../src/components/Topic';
import { buildDesigner } from './commands/designer-harness';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {},
}));

const mouseEvent = (type: string, clientX: number, clientY: number): MouseEvent =>
  new MouseEvent(type, { clientX, clientY, button: 0, bubbles: true, cancelable: true });

const pressOn = (topic: Topic, x: number, y: number) => {
  const native = (
    topic as unknown as { get2DElement: () => { peer: { _native: Element } } }
  ).get2DElement().peer._native;
  native.dispatchEvent(mouseEvent('mousedown', x, y));
};

describe('dragging a topic that is deleted during the drag', () => {
  it('does not throw on the next mouse move, nor drop the deleted topic', async () => {
    const { designer, topic } = await buildDesigner();
    const dispatcher = designer.getActionDispatcher();
    const dragTopic = jest.spyOn(dispatcher, 'dragTopic');

    const layoutManager = (
      designer as unknown as { _eventBussDispatcher: { getLayoutManager: () => LayoutManager } }
    )._eventBussDispatcher.getLayoutManager();
    const predict = jest.spyOn(layoutManager, 'predict');

    // A1 (2), child of A (1), sits at (226, 0); the harness maps client (x, y) to (x-50, y-50).
    // Moving around it keeps its drag node connected to A, so every move predicts.
    pressOn(topic(2), 276, 50);
    document.dispatchEvent(mouseEvent('mousemove', 290, 52));
    document.dispatchEvent(mouseEvent('mousemove', 300, 54));
    const predictsBeforeDelete = predict.mock.calls.length;
    expect(predictsBeforeDelete).toBeGreaterThan(0);

    // Deleted with the keyboard while the button is still held ...
    dispatcher.deleteEntities([2], []);
    expect(designer.getModel().findTopicById(2)).toBeFalsy();

    // Before the fix: predict(1, 2, ...) threw "node could not be found id:2".
    document.dispatchEvent(mouseEvent('mousemove', 310, 56));
    expect(predict).toHaveBeenCalledTimes(predictsBeforeDelete);

    // Before the fix: the drop threw "Could not find topic" (DragTopicCommand).
    document.dispatchEvent(mouseEvent('mouseup', 310, 56));
    expect(dragTopic).not.toHaveBeenCalled();
  });
});
