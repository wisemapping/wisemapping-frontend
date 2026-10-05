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
import Topic from '../../../src/components/Topic';

// BL5-85: the variant toggle walked only the central topic's tree.
describe('Designer.setThemeVariant', () => {
  it('applies the variant to every topic, floating ones included', async () => {
    const { designer, topic } = await buildDesigner();
    const redraw = jest.spyOn(Topic.prototype, 'redraw');

    designer.setThemeVariant('dark');

    const topics = designer.getModel().getTopics();
    expect(topics.map((t) => t.getThemeVariant())).toEqual(topics.map(() => 'dark'));
    // The floating topic is redrawn with the new variant.
    expect(redraw.mock.contexts).toContain(topic(5));
    redraw.mockRestore();
  });
});
