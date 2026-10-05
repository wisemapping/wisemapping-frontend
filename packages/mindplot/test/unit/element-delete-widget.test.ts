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
import { Group } from '@wisemapping/web2d';
import ElementDeleteWidget from '../../src/components/ElementDeleteWidget';
import Icon from '../../src/components/Icon';

const buildIcon = () => {
  const addEvent = jest.fn();
  const icon = { addEvent } as unknown as Icon;
  return { icon, addEvent };
};

describe('ElementDeleteWidget.decorate (BL4-27)', () => {
  it('adds the hover listeners to an icon only once', () => {
    const widget = ElementDeleteWidget.getInstance({} as never);
    const { icon, addEvent } = buildIcon();

    widget.decorate(1, icon, new Group());
    widget.decorate(1, icon, new Group());

    expect(addEvent.mock.calls.map((call) => call[0])).toEqual(['mouseover', 'mouseout']);
  });

  it('does not mark the icon with properties of its own', () => {
    const widget = ElementDeleteWidget.getInstance({} as never);
    const { icon } = buildIcon();
    const keys = Object.keys(icon);

    widget.decorate(1, icon, new Group());

    expect(Object.keys(icon)).toEqual(keys);
  });

  it('decorates an icon for each widget that is asked to', () => {
    const { icon, addEvent } = buildIcon();

    ElementDeleteWidget.getInstance({} as never).decorate(1, icon, new Group());
    ElementDeleteWidget.getInstance({} as never).decorate(1, icon, new Group());

    expect(addEvent).toHaveBeenCalledTimes(4);
  });
});
