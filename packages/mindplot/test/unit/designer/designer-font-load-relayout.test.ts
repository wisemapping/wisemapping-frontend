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
 * A web font that finishes loading changes the text metrics. web2d drops its cached measurements
 * then, but nothing redrew the topics, so they kept the size measured with the fallback font
 * until something else redrew them (BL5-124). The designer now redraws and lays out once.
 */
import { buildDesigner } from '../commands/designer-harness';
import Topic from '../../../src/components/Topic';
import LayoutManager from '../../../src/components/layout/LayoutManager';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

// jsdom has no FontFaceSet. web2d starts listening on the first measurement, so it is defined
// before any topic is built.
const fonts = new EventTarget();
Object.defineProperty(document, 'fonts', { value: fonts, configurable: true });

// The width of a character: the metrics of the font in use.
let charWidth = 5;

const nextFrame = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = function getBBox(
    this: SVGElement,
  ) {
    if (this.tagName.toLowerCase() !== 'text') {
      return { x: 0, y: 0, width: 60, height: 14 } as DOMRect;
    }
    return {
      x: 0,
      y: 0,
      width: (this.textContent || '').length * charWidth,
      height: 12,
    } as DOMRect;
  };
});

afterEach(() => {
  charWidth = 5;
});

afterAll(() => {
  jest.restoreAllMocks();
  delete (document as unknown as { fonts?: unknown }).fonts;
});

describe('Designer and web font loading (BL5-124)', () => {
  it('resizes the topics and lays out once, however many fonts load in a frame', async () => {
    const harness = await buildDesigner();
    const topics = harness.designer.getModel().getTopics();
    // B1 (4) is a leaf on the left: its position follows the width of B (3).
    const b = harness.topic(3);
    const widthBefore = b.getSize().width;
    const b1XBefore = harness.topic(4).getPosition().x;

    const redraws = jest.spyOn(Topic.prototype, 'redraw');
    const layouts = jest.spyOn(LayoutManager.prototype, 'layout');
    charWidth = 8;
    fonts.dispatchEvent(new Event('loadingdone'));
    fonts.dispatchEvent(new Event('loadingdone'));
    expect(redraws).not.toHaveBeenCalled();
    await nextFrame();

    expect(redraws).toHaveBeenCalledTimes(topics.length);
    expect(layouts).toHaveBeenCalledTimes(1);
    expect(b.getSize().width).toBe(widthBefore + 'B'.length * 3);
    expect(harness.topic(4).getPosition().x).toBeLessThan(b1XBefore);

    redraws.mockRestore();
    layouts.mockRestore();
    harness.designer.dispose();
  });

  it('stops listening once disposed, also for a frame already asked for', async () => {
    const harness = await buildDesigner();
    const redraws = jest.spyOn(Topic.prototype, 'redraw');

    fonts.dispatchEvent(new Event('loadingdone'));
    harness.designer.dispose();
    await nextFrame();
    fonts.dispatchEvent(new Event('loadingdone'));
    await nextFrame();

    expect(redraws).not.toHaveBeenCalled();
    redraws.mockRestore();
  });
});
