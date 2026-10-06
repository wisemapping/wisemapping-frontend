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
import ChangeEvent from '../../../src/components/layout/ChangeEvent';
import type LayoutManager from '../../../src/components/layout/LayoutManager';
import type EventBusDispatcher from '../../../src/components/layout/EventBusDispatcher';
import type Designer from '../../../src/components/Designer';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const layoutManagerOf = (designer: Designer): LayoutManager =>
  (
    designer as unknown as { _eventBussDispatcher: EventBusDispatcher }
  )._eventBussDispatcher.getLayoutManager();

/**
 * The layout reports position and order changes. A change that carries no
 * order (a topic the layout does not order yet) must leave the topic's order
 * alone instead of clearing it.
 */
describe('Designer layout change handler', () => {
  it('keeps the order of a topic when the change carries none', async () => {
    const { designer, topic } = await buildDesigner();
    const floating = topic(5);
    floating.getModel().setOrder(3);

    const event = new ChangeEvent(5);
    event.setPosition({ x: 410, y: 400 });
    layoutManagerOf(designer).fireEvent('change', event);

    expect(floating.getModel().getOrder()).toBe(3);
    expect(floating.getPosition()).toEqual({ x: 410, y: 400 });
  });

  it('applies the order a change carries', async () => {
    const { designer, topic } = await buildDesigner();

    const event = new ChangeEvent(1);
    event.setOrder(4);
    layoutManagerOf(designer).fireEvent('change', event);

    expect(topic(1).getOrder()).toBe(4);
  });
});
