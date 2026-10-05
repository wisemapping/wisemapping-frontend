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

const MAP = [
  '<map name="features" version="tango">',
  '  <topic id="0" central="true" text="Central">',
  '    <topic id="1" text="A" position="200,-50" order="0">',
  '      <eicon id="😀"/>',
  '    </topic>',
  '  </topic>',
  '</map>',
].join('\n');

describe('RemoveFeatureFromTopicCommand', () => {
  // Feature ids are numbers and 0 is a valid one (FeatureModel.setId accepts any finite id).
  it('removes, and restores on undo, a feature whose id is 0', async () => {
    const { designer, save, topic } = await buildDesigner(MAP);
    const icon = topic(1).getModel().findFeatureByType('eicon')[0];
    icon.setId(0);
    const before = save();

    designer.getActionDispatcher().removeFeatureFromTopic(1, 0);
    expect(topic(1).getModel().findFeatureByType('eicon')).toHaveLength(0);

    designer.undo();
    expect(save()).toEqual(before);
  });
});
