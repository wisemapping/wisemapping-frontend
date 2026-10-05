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

const mapWithIcon = (iconId: string): string =>
  [
    '<map name="unknown-icon" version="tango">',
    '  <topic id="0" central="true" text="Central">',
    `    <topic id="1" text="With icon" position="200,0" order="0"><icon id="${iconId}"/></topic>`,
    '  </topic>',
    '</map>',
  ].join('\n');

/**
 * An image icon whose id has no image (an old map, or one imported from another tool) used to
 * throw in the ImageIcon constructor, so the map failed to load. SvgImageIcon already warns and
 * returns an empty URL for it: the topic keeps the icon feature and draws an empty image.
 */
describe('an image icon with an unknown id', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads the map, warns, and keeps the icon on the topic', async () => {
    const { topic, save } = await buildDesigner(mapWithIcon('nonexistent_icon_12345'));

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('nonexistent_icon_12345'));
    expect(topic(1).getModel().findFeatureByType('icon')).toHaveLength(1);
    expect(save()).toContain('nonexistent_icon_12345');
  });

  it('can be added to a topic', async () => {
    const { designer, topic } = await buildDesigner(mapWithIcon('nonexistent_icon_12345'));

    expect(() => designer.addIconType('image', 'nonexistent_icon_12345')).not.toThrow();
    expect(topic(1).getModel().findFeatureByType('icon').length).toBeGreaterThanOrEqual(1);
  });
});
