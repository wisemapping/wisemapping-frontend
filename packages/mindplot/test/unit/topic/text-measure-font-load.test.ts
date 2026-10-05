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

/*
 * web2d caches the text measurements across redraws (W2, daa3cb0d), so an unchanged redraw
 * measures nothing. A web font that finishes loading changes the metrics of the text measured
 * with the fallback font, so the cache must be dropped then (document.fonts 'loadingdone'),
 * and the next redraw must measure again and size the topic with the new metrics.
 */
jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import { buildDesigner } from '../commands/designer-harness';

// jsdom has no FontFaceSet. web2d starts listening on the first measurement, so it is defined
// before any topic is built.
const fonts = new EventTarget();
Object.defineProperty(document, 'fonts', { value: fonts, configurable: true });

// The width of a character: the metrics of the font in use.
let charWidth = 5;
let measures = 0;

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = function getBBox(
    this: SVGElement,
  ) {
    if (this.tagName.toLowerCase() !== 'text') {
      return { x: 0, y: 0, width: 60, height: 14 } as DOMRect;
    }
    measures += 1;
    return {
      x: 0,
      y: 0,
      width: (this.textContent || '').length * charWidth,
      height: 12,
    } as DOMRect;
  };
});

afterAll(() => {
  jest.restoreAllMocks();
  delete (document as unknown as { fonts?: unknown }).fonts;
});

describe('topic text measurement and web font loading', () => {
  it('measures again, and resizes the topic, once a web font finishes loading', async () => {
    const harness = await buildDesigner();
    // Topic 1 has the text 'A'.
    const child = harness.topic(1);
    const redraw = () => child.redraw(child.getThemeVariant(), false);
    redraw();
    const widthBefore = child.getSize().width;

    measures = 0;
    redraw();
    expect(measures).toBe(0);

    // The web font arrives: the same text is now wider.
    charWidth = 8;
    redraw();
    expect(measures).toBe(0);
    expect(child.getSize().width).toBe(widthBefore);

    fonts.dispatchEvent(new Event('loadingdone'));
    redraw();
    expect(measures).toBe(1);
    expect(child.getSize().width).toBe(widthBefore + 'A'.length * 3);

    measures = 0;
    redraw();
    expect(measures).toBe(0);
  });
});
