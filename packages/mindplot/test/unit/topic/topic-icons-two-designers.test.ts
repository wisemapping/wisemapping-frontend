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
jest.mock('../../../src/components/SvgImageIcon', () => ({
  __esModule: true,
  default: class MockSvgImageIcon {},
}));
jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import WidgetBuilder from '../../../src/components/WidgetBuilder';
import { buildDesigner, Harness } from '../commands/designer-harness';

const stubWidgetManager = (harness: Harness) => {
  const widgetManager = {
    createTooltipForLink: jest.fn(),
    configureTooltipForNode: jest.fn(),
  };
  jest
    .spyOn(harness.designer, 'getWidgetManager')
    .mockReturnValue(widgetManager as unknown as WidgetBuilder);
  return widgetManager;
};

describe('Topic icons with two designers on the page', () => {
  it('builds the topic with its own designer', async () => {
    const first = await buildDesigner();
    const second = await buildDesigner();

    expect(first.topic(1).getDesigner()).toBe(first.designer);
    expect(second.topic(1).getDesigner()).toBe(second.designer);
  });

  it.each([
    ['link', { url: 'https://example.com' }, 'createTooltipForLink'],
    ['note', { text: 'hello' }, 'configureTooltipForNode'],
  ] as const)(
    'wires a %s icon to the designer of its topic, not the last designer built',
    async (type, attributes, tooltip) => {
      const first = await buildDesigner();
      const second = await buildDesigner();
      const firstWidgets = stubWidgetManager(first);
      const secondWidgets = stubWidgetManager(second);
      const firstEdit = jest.fn();
      const secondEdit = jest.fn();
      first.designer.addEvent('featureEdit', firstEdit);
      second.designer.addEvent('featureEdit', secondEdit);

      const topic = first.topic(1);
      const icon = topic.addFeature(topic.getModel().createFeature(type, attributes));

      expect(firstWidgets[tooltip]).toHaveBeenCalledWith(topic, expect.anything(), icon);
      expect(secondWidgets[tooltip]).not.toHaveBeenCalled();

      icon.getElement().trigger('click', { stopPropagation: () => undefined });
      expect(firstEdit).toHaveBeenCalledWith({ event: type, topic });
      expect(secondEdit).not.toHaveBeenCalled();
    },
  );

  it('keeps the delete widget open on one map when icons change on the other (BL-12)', async () => {
    const first = await buildDesigner();
    const second = await buildDesigner();
    stubWidgetManager(first);
    stubWidgetManager(second);

    const topic = first.topic(1);
    const icon = topic.addFeature(topic.getModel().createFeature('note', { text: 'hello' }));
    const topicGroup = topic.get2DElement();
    const append = jest.spyOn(topicGroup, 'append');
    const removeChild = jest.spyOn(topicGroup, 'removeChild');

    // Hovering the icon shows its delete widget in the topic ...
    icon.getElement().trigger('mouseover', {});
    expect(append).toHaveBeenCalledTimes(1);
    const widget = append.mock.calls[0][0];

    // ... and adding icons on the other map (which re-adds its icons) must not close it.
    const other = second.topic(1);
    other.addFeature(other.getModel().createFeature('note', { text: 'a' }));
    other.addFeature(other.getModel().createFeature('link', { url: 'https://example.com' }));

    expect(removeChild).not.toHaveBeenCalledWith(widget);
  });
});
