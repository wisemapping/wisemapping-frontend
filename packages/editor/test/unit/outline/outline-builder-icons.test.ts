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
import { ContentType, INodeModel, SvgImageIcon } from '@wisemapping/mindplot';
import { OutlineBuilder } from '../../../src/components/action-widget/pane/outline-view-dialog/OutlineBuilder';

// A topic with one gallery icon feature.
const nodeWithIcon = (iconType: string): INodeModel =>
  ({
    getId: () => 1,
    getText: () => 'Topic',
    getPlainText: () => 'Topic',
    getContentType: () => ContentType.PLAIN,
    getChildren: () => [],
    getFeatures: () => [{ getType: () => 'icon', getIconType: () => iconType }],
  }) as unknown as INodeModel;

describe('OutlineBuilder icons', () => {
  afterEach(() => jest.restoreAllMocks());

  // The outline resolved icons with require(), which the browser bundle does not have: every
  // icon was dropped with an "Icon not found" warning, so the outline showed no icons.
  it('resolves a gallery icon with the same lookup as the canvas', () => {
    // Jest loads the mindplot bundle, whose icon list is empty here: stub the canvas lookup.
    const lookup = jest
      .spyOn(SvgImageIcon, 'getImageUrl')
      .mockReturnValue('data:image/svg+xml;base64,AAAA');

    const { iconUrls } = new OutlineBuilder().buildOutlineData(nodeWithIcon('bulb_light_on'), 0);

    expect(lookup).toHaveBeenCalledWith('bulb_light_on');
    expect(iconUrls).toEqual(['data:image/svg+xml;base64,AAAA']);
  });
});
