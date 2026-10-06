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
 * The 'Material Icons' font has no Twitter, Instagram, LinkedIn, YouTube or WhatsApp icon, so the
 * gallery drew an unrelated glyph for them (BL5-123). They are drawn from the path of the
 * @mui/icons-material icon the editor's picker shows, in the topic text colour.
 */
import { Image, Text } from '@wisemapping/web2d';
import { buildDesigner } from '../commands/designer-harness';
import { brandIconHref } from '../../../src/components/ImageSVGFeature';
import { BRAND_ICON_PATHS } from '../../../src/components/GalleryIconData';
import type Topic from '../../../src/components/Topic';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const BRANDS = ['twitter', 'instagram', 'linkedin', 'youtube', 'whatsapp'];

const MAP = [
  '<map name="brands" version="tango">',
  '  <topic id="0" central="true" text="Central">',
  ...BRANDS.map(
    (brand, i) =>
      `    <topic id="${i + 1}" text="${brand}" position="200,${i * 80}" order="${i}" shape="rectangle" imageGallery="${brand}"/>`,
  ),
  '    <topic id="9" text="Star" position="-200,0" order="5" shape="rectangle" imageGallery="star"/>',
  '  </topic>',
  '</map>',
].join('\n');

const svgOf = (href: string): Document =>
  new DOMParser().parseFromString(
    decodeURIComponent(href.replace('data:image/svg+xml,', '')),
    'image/svg+xml',
  );

describe('brand gallery icons', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('draws each brand icon as a 24px image of its path in the topic text colour', async () => {
    const harness = await buildDesigner(MAP);
    BRANDS.forEach((brand, i) => {
      const topic: Topic = harness.topic(i + 1);
      const icon = topic.getOrBuildImageSVGElement();
      expect(icon).toBeInstanceOf(Image);

      const image = icon as Image;
      expect(image.getSize()).toEqual({ width: 24, height: 24 });
      const path = svgOf(image.getHref()).querySelector('path')!;
      expect(path.getAttribute('d')).toBe(BRAND_ICON_PATHS[brand]);
      expect(path.getAttribute('fill')).toBe(topic.getFontColor(topic.getThemeVariant()));
      // In the topic, above its text, like a glyph icon.
      expect(image.getNode().parentNode).toBe(topic.get2DElement().getNode());
      expect(Number(image.getNode().getAttribute('y'))).toBeLessThan(
        topic.getOrBuildTextShape().getPosition().y,
      );
    });
  });

  it('keeps drawing the other gallery icons with the font', async () => {
    const harness = await buildDesigner(MAP);
    const star = harness.topic(9).getOrBuildImageSVGElement();
    expect(star).toBeInstanceOf(Text);
    expect((star as Text).getText()).toBe('');
  });

  it('follows a topic text colour change, rewriting the image only when it changes', async () => {
    const harness = await buildDesigner(MAP);
    const topic = harness.topic(1);
    const image = topic.getOrBuildImageSVGElement() as Image;
    const setHref = jest.spyOn(image, 'setHref');

    topic.redraw(topic.getThemeVariant(), false);
    expect(setHref).not.toHaveBeenCalled();

    topic.getModel().setFontColor('#ff0000');
    topic.redraw(topic.getThemeVariant(), false);
    expect(image.getHref()).toBe(brandIconHref(BRAND_ICON_PATHS.twitter!, '#ff0000'));
    expect(setHref).toHaveBeenCalledTimes(1);
  });
});
