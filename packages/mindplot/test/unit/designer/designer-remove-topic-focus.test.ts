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

import { buildDesigner } from '../commands/designer-harness';

/**
 * Deleting a topic removes its whole subtree. Only the topic the user deleted
 * hands the focus to its parent: its descendants are going away too, and
 * focusing each of them fires selection events and pans the viewport.
 */
describe('Designer.removeTopic', () => {
  it('navigates once, to the parent of the deleted topic', async () => {
    const { designer, topic } = await buildDesigner();
    const central = topic(0);
    const goToNode = jest.spyOn(designer, 'goToNode');

    designer.removeTopic(topic(1));

    expect(goToNode).toHaveBeenCalledTimes(1);
    expect(goToNode).toHaveBeenCalledWith(central);
    expect(designer.getModel().findTopicById(2)).toBeUndefined();
  });

  it('does not focus a deleted descendant', async () => {
    const { designer, topic } = await buildDesigner();
    const deletedParent = topic(3);
    const setOnFocus = jest.spyOn(deletedParent, 'setOnFocus');

    designer.removeTopic(deletedParent);

    expect(setOnFocus).not.toHaveBeenCalledWith(true);
  });
});
