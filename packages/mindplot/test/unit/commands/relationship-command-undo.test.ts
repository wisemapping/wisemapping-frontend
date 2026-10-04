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

import { buildDesigner } from './designer-harness';

/**
 * Deleting a topic and undoing it rebuilds its relationships as new objects, so
 * a relationship command must find its relationships by id when it runs, not
 * hold on to the objects it was created with.
 */
describe('GenericRelationshipFunctionCommand undo/redo', () => {
  it('undoes a style change on a relationship rebuilt by an undone delete', async () => {
    const { designer, save } = await buildDesigner();
    const dispatcher = designer.getActionDispatcher();
    const liveRelationship = () => designer.getModel().getRelationships()[0];
    const before = save();

    dispatcher.changeRelationshipColor([liveRelationship()], '#ff0000');
    dispatcher.changeRelationshipEndArrow([liveRelationship()], false);
    const afterStyle = save();

    // B is the relationship's source: deleting it takes the relationship along.
    dispatcher.deleteEntities([3], []);
    expect(designer.getModel().getRelationships()).toHaveLength(0);
    designer.undo();
    expect(save()).toEqual(afterStyle);

    designer.undo();
    designer.undo();
    expect(liveRelationship().getModel().getStrokeColor()).toBeUndefined();
    expect(liveRelationship().getModel().getEndArrow()).toBe(true);
    expect(save()).toEqual(before);

    designer.redo();
    designer.redo();
    expect(save()).toEqual(afterStyle);
  });
});
