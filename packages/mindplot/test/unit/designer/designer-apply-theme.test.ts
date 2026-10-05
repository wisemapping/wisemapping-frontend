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
import { buildDesigner, SAMPLE_MAP } from '../commands/designer-harness';
import Topic from '../../../src/components/Topic';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

// BL5-161: applyTheme redrew only the central topic's tree.
describe('Designer.applyTheme', () => {
  it('redraws every topic with the new theme, floating ones included', async () => {
    const { designer } = await buildDesigner();
    const redraw = jest.spyOn(Topic.prototype, 'redraw');

    designer.applyTheme('prism');

    const redrawn = new Set((redraw.mock.contexts as Topic[]).map((t) => t.getId()));
    const ids = designer
      .getModel()
      .getTopics()
      .map((t) => t.getId());
    expect(ids.filter((id) => !redrawn.has(id))).toEqual([]);
    redraw.mockRestore();
  });

  it('gives a floating topic the colours of a map loaded with that theme', async () => {
    const { designer, topic } = await buildDesigner();
    designer.applyTheme('prism');

    const loaded = await buildDesigner(
      SAMPLE_MAP.replace('<map name="sample"', '<map name="sample" theme="prism"'),
    );
    // The fill and stroke of every rendered element of the topic.
    const colours = (t: Topic): string[] =>
      Array.from(t.get2DElement().getNode().querySelectorAll('*'))
        .map((e) => `${e.tagName}:${e.getAttribute('fill')}:${e.getAttribute('stroke')}`)
        .sort();
    // The central topic's tree always followed the theme ...
    expect(colours(topic(1))).toEqual(colours(loaded.topic(1)));
    // ... and the floating topic now does too.
    expect(colours(topic(5))).toEqual(colours(loaded.topic(5)));
  });
});
