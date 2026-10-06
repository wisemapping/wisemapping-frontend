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

import type { ActionDispatcherCommands } from '../../../src/components/ActionDispatcher';
import ActionDispatcher from '../../../src/components/ActionDispatcher';
import type PositionType from '../../../src/components/PositionType';
import type Topic from '../../../src/components/Topic';
import { buildDesigner } from './designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * The commands are property signatures, so strictFunctionTypes applies to them (ts-jest
 * type-checks this file). As methods, an implementation could take less than its callers pass:
 * StandaloneActionDispatcher.dragTopic took a Topic where DragTopic passes null to disconnect.
 */
describe('ActionDispatcherCommands (T5)', () => {
  it('rejects an implementation that narrows what its callers pass', () => {
    // @ts-expect-error null disconnects the topic: an implementation must take it
    const narrowed: ActionDispatcherCommands['dragTopic'] = (
      _topicId: number,
      _position: PositionType,
      _order: number | undefined,
      _parentTopic: Topic,
    ) => undefined;
    expect(narrowed).toBeInstanceOf(Function);
  });

  it('is what the designer and getInstance hand out, and dragTopic takes a null parent', async () => {
    const { designer, save } = await buildDesigner();
    const fromDesigner: ActionDispatcherCommands = designer.getActionDispatcher();
    const fromInstance: ActionDispatcherCommands = ActionDispatcher.getInstance();
    expect(fromInstance).toBe(fromDesigner);

    // A1 dragged away from A, connected to nothing.
    fromInstance.dragTopic(2, { x: 500, y: 300 }, undefined, null);

    expect(save()).toMatch(/<topic position="500,300"[^>]* id="2"\/>/);
    expect(designer.getModel().findTopicById(2)?.getOutgoingConnectedTopic()).toBeNull();
  });
});
