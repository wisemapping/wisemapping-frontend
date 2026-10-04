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
import { afterEach, describe, expect, it, jest } from '@jest/globals';

type FakeCanvas = { width: number; height: number; toDataURL: () => string };
const html2canvasMock =
  jest.fn<(e: HTMLElement, o: Record<string, unknown>) => Promise<FakeCanvas>>();
const addImage = jest.fn();

jest.mock('html2canvas', () => ({
  __esModule: true,
  default: (e: HTMLElement, o: Record<string, unknown>) => html2canvasMock(e, o),
}));

// A4 landscape, in mm.
jest.mock('jspdf', () => ({
  __esModule: true,
  default: class {
    internal = { pageSize: { getWidth: () => 297, getHeight: () => 210 } };

    addImage(...args: unknown[]) {
      addImage(...args);
    }

    output() {
      return 'data:application/pdf;base64,AAAA';
    }
  },
}));

// eslint-disable-next-line import/first
import PDFExporter from '../../../src/components/export/PDFExporter';

const svg = () => document.createElementNS('http://www.w3.org/2000/svg', 'svg');
const fakeCanvas = (width: number, height: number): FakeCanvas => ({
  width,
  height,
  toDataURL: () => 'data:image/png;base64,AAAA',
});
const PX_TO_MM = 25.4 / 96;

describe('PDFExporter', () => {
  afterEach(() => {
    html2canvasMock.mockReset();
    addImage.mockReset();
    jest.restoreAllMocks();
  });

  it('removes the temporary container when rendering fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    html2canvasMock.mockRejectedValue(new Error('boom'));
    const before = document.body.childElementCount;

    await expect(new PDFExporter(svg()).export()).rejects.toThrow();
    expect(document.body.childElementCount).toBe(before);
  });

  it('does not allow tainting the canvas it has to read back', async () => {
    html2canvasMock.mockResolvedValue(fakeCanvas(800, 400));

    await new PDFExporter(svg()).export();

    const options = html2canvasMock.mock.calls[0][1];
    expect(options.useCORS).toBe(true);
    expect(options.allowTaint).toBe(false);
  });

  it('keeps the original size (converted to mm) when it fits on the page', async () => {
    // html2canvas renders at scale 2, so 800x400 canvas pixels are 400x200 CSS pixels.
    html2canvasMock.mockResolvedValue(fakeCanvas(800, 400));

    await new PDFExporter(svg(), false).export();

    const [, , x, y, width, height] = addImage.mock.calls[0] as number[];
    expect(width).toBeCloseTo(400 * PX_TO_MM, 3);
    expect(height).toBeCloseTo(200 * PX_TO_MM, 3);
    expect(x).toBeCloseTo((297 - width) / 2, 3);
    expect(y).toBeCloseTo((210 - height) / 2, 3);
  });

  it('shrinks an original size that does not fit on the page', async () => {
    html2canvasMock.mockResolvedValue(fakeCanvas(4000, 1000));

    await new PDFExporter(svg(), false).export();

    const [, , , , width, height] = addImage.mock.calls[0] as number[];
    expect(width).toBeCloseTo(297, 3);
    expect(height).toBeCloseTo(297 / 4, 3);
  });

  it('fits the image to the page with a margin', async () => {
    html2canvasMock.mockResolvedValue(fakeCanvas(800, 400));

    await new PDFExporter(svg(), true).export();

    const [, , , , width, height] = addImage.mock.calls[0] as number[];
    expect(width).toBeCloseTo(297 * 0.95, 3);
    expect(height).toBeCloseTo((297 * 0.95) / 2, 3);
  });
});
