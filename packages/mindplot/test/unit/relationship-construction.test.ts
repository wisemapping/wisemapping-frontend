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

jest.mock('../../src/components/SvgImageIcon', () => ({
  __esModule: true,
  default: class MockSvgImageIcon {},
}));
jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

// Counts the control point controllers built, still building real ones. The module is loaded
// lazily: it imports Relationship, which imports it back ...
jest.mock('../../src/components/RelationshipControlPoints', () => {
  const actual = () => jest.requireActual('../../src/components/RelationshipControlPoints');
  return {
    __esModule: true,
    get PivotType() {
      return actual().PivotType;
    },
    default: jest.fn((relationship: unknown) => new (actual().default)(relationship)),
  };
});

import RelationshipControlPoints from '../../src/components/RelationshipControlPoints';
import { buildDesigner } from './commands/designer-harness';

describe('Relationship construction (BL4-28)', () => {
  it('builds a single control point controller per relationship, the one it uses', async () => {
    const Controller = RelationshipControlPoints as unknown as jest.Mock;
    Controller.mockClear();

    const { designer } = await buildDesigner();
    const relationships = designer.getModel().getRelationships();

    expect(relationships).toHaveLength(1);
    expect(Controller).toHaveBeenCalledTimes(1);
    const [relationship] = relationships;
    expect(
      (relationship as unknown as { _controlPointsController: unknown })._controlPointsController,
    ).toBe(Controller.mock.results[0].value);
  });
});
