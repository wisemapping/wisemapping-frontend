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

import { LineType } from '../../../src/components/BaseConnectionLine';
import { buildDesigner } from '../commands/designer-harness';

describe('Topic with two designers on the page', () => {
  it('redraws a changed connection into its own canvas, not the last designer built', async () => {
    const first = await buildDesigner();
    const second = await buildDesigner();

    const firstCanvas = first.designer.getWorkSpace();
    const secondCanvas = second.designer.getWorkSpace();
    const firstAppend = jest.spyOn(firstCanvas, 'append');
    const firstRemove = jest.spyOn(firstCanvas, 'removeChild');
    const secondAppend = jest.spyOn(secondCanvas, 'append');
    const secondRemove = jest.spyOn(secondCanvas, 'removeChild');

    const child = first.topic(1);
    const oldLine = child.getOutgoingLine()!;
    const newStyle =
      oldLine.getLineType() === LineType.POLYLINE_STRAIGHT
        ? LineType.THIN_CURVED
        : LineType.POLYLINE_STRAIGHT;

    // Changing the parent's connection style makes the child rebuild its line.
    first.topic(0).setConnectionStyle(newStyle);

    const newLine = child.getOutgoingLine()!;
    expect(newLine).not.toBe(oldLine);
    expect(newLine.getLineType()).toBe(newStyle);

    expect(firstRemove).toHaveBeenCalledWith(oldLine.getLine().getElementClass());
    expect(firstAppend).toHaveBeenCalledWith(newLine);
    expect(secondRemove).not.toHaveBeenCalled();
    expect(secondAppend).not.toHaveBeenCalled();
  });
});
