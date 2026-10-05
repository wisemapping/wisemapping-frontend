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
// SvgIconAssets is mapped to test/unit/__mocks__/SvgIconAssets.ts (jest.config.js), which
// lists the icon files on disk.
import { Image } from '@wisemapping/web2d';
import ActionDispatcher from '../../src/components/ActionDispatcher';
import SvgImageIcon from '../../src/components/SvgImageIcon';
import Topic from '../../src/components/Topic';
import SvgIconModel from '../../src/components/model/SvgIconModel';

const topic = { getId: () => 7 } as unknown as Topic;

const click = (icon: SvgImageIcon) => icon.getElement().trigger('click', {});
const href = (icon: SvgImageIcon) => (icon.getElement() as Image).getHref();

describe('SvgImageIcon', () => {
  let changeFeatureToTopic: jest.Mock;

  beforeEach(() => {
    changeFeatureToTopic = jest.fn();
    ActionDispatcher.setInstance({ changeFeatureToTopic } as unknown as ActionDispatcher);
  });

  it('changes the icon type through the action dispatcher, so it can be undone', () => {
    const model = new SvgIconModel({ id: 'flag_blue' });
    const icon = new SvgImageIcon(topic, model, false);

    click(icon);

    expect(changeFeatureToTopic).toHaveBeenCalledWith(7, model.getId(), { id: 'flag_green' });
    // The command changes the model, not the icon.
    expect(model.getIconType()).toBe('flag_blue');
  });

  it('shows the icon type the model has after a change, e.g. an undo', () => {
    const model = new SvgIconModel({ id: 'flag_blue' });
    const icon = new SvgImageIcon(topic, model, false);
    expect(href(icon)).toBe('flag_blue.svg');

    model.setAttributes({ id: 'flag_orange' });

    expect(href(icon)).toBe('flag_orange.svg');
  });

  it('cycles an icon stored with a descriptive name', () => {
    // 'home' is shown as things_address_book.
    const model = new SvgIconModel({ id: 'home' });
    const icon = new SvgImageIcon(topic, model, false);
    expect(href(icon)).toBe('things_address_book.svg');

    click(icon);

    expect(changeFeatureToTopic).toHaveBeenCalledWith(7, model.getId(), { id: 'things_wrench' });
  });
});
