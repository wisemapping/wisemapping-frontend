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

import HTMLTopicSelected from '../../../src/components/HTMLTopicSelected';
import { buildDesigner, Harness } from '../commands/designer-harness';

type PlusButtons = { _rightPlus: HTMLElement | null; _bottomPlus: HTMLElement | null };

describe('HTMLTopicSelected with two designers on the page (BL4-22)', () => {
  const spyCreate = (harness: Harness) => ({
    child: jest.spyOn(harness.designer, 'createChildForSelectedNode').mockImplementation(),
    sibling: jest.spyOn(harness.designer, 'createSiblingForSelectedNode').mockImplementation(),
  });

  it.each(['child', 'sibling'] as const)(
    'a shadow built without a designer adds the %s on the map of its topic, not the last one built',
    async (kind) => {
      const first = await buildDesigner();
      // The last designer built is the one in globalThis.designer.
      const second = await buildDesigner();
      const firstCreate = spyCreate(first);
      const secondCreate = spyCreate(second);

      const topic = first.topic(1);
      const container = first.designer.getContainer();
      const shadow = new HTMLTopicSelected(topic, container, first.designer.getScreenManager());
      shadow.show();

      // Topic 1 is horizontal: the right button adds a child, the bottom one a sibling.
      const buttons = shadow as unknown as PlusButtons;
      (kind === 'child' ? buttons._rightPlus : buttons._bottomPlus)!.click();

      expect(firstCreate[kind]).toHaveBeenCalledTimes(1);
      expect(secondCreate[kind]).not.toHaveBeenCalled();
      shadow.dispose();
    },
  );
});

describe('HTMLTopicSelected reads the designer from its topic (BL5-09)', () => {
  it('a shadow built without a designer stays hidden while several topics are selected', async () => {
    const { designer, topic } = await buildDesigner();
    topic(1).setOnFocus(true);
    topic(3).setOnFocus(true);

    const shadow = new HTMLTopicSelected(
      topic(1),
      designer.getContainer(),
      designer.getScreenManager(),
    );

    expect((shadow as unknown as { _isVisible: boolean })._isVisible).toBe(false);
    shadow.dispose();
  });
});
