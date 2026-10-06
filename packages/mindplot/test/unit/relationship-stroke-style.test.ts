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

import { buildDesigner } from './commands/designer-harness';
import type Relationship from '../../src/components/Relationship';
import { StrokeStyle } from '../../src/components/model/RelationshipModel';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const lineOf = (relationship: Relationship): SVGElement => relationship.getLine().getNode();

describe('Relationship stroke style (BL5-121)', () => {
  it('draws a solid relationship without a dash array, also after a dashed one', async () => {
    const { designer } = await buildDesigner();
    const [relationship] = designer.getModel().getRelationships();
    const model = relationship!.getModel();

    model.setStrokeStyle(StrokeStyle.DASHED);
    relationship!.redraw();
    expect(lineOf(relationship!).getAttribute('stroke-dasharray')).toBe('8,4');

    // It wrote '0,0', a dash array of zero lengths, rather than removing it.
    model.setStrokeStyle(StrokeStyle.SOLID);
    relationship!.redraw();
    expect(lineOf(relationship!).hasAttribute('stroke-dasharray')).toBe(false);

    model.setStrokeStyle(StrokeStyle.DOTTED);
    relationship!.redraw();
    expect(lineOf(relationship!).getAttribute('stroke-dasharray')).toBe('1,3');
  });
});
