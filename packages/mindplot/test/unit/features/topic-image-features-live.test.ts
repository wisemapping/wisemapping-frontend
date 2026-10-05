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

import { Image, Text } from '@wisemapping/web2d';
import ElementDeleteWidget from '../../../src/components/ElementDeleteWidget';
import ImageEmojiFeature from '../../../src/components/ImageEmojiFeature';
import ImageSVGFeature, { brandIconHref } from '../../../src/components/ImageSVGFeature';
import Topic from '../../../src/components/Topic';
import { BRAND_ICON_PATHS } from '../../../src/components/GalleryIconData';
import { buildDesigner, Harness, SAMPLE_MAP } from '../commands/designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * The image of a topic: a gallery icon (a Material glyph or a brand image) or a
 * big emoji, drawn above the text, removable with the delete widget.
 */

const svgFeature = (topic: Topic): ImageSVGFeature =>
  (topic as unknown as { _imageSVGFeature: ImageSVGFeature })._imageSVGFeature;
const emojiFeature = (topic: Topic): ImageEmojiFeature =>
  (topic as unknown as { _imageEmojiFeature: ImageEmojiFeature })._imageEmojiFeature;

// B (3) is a rounded rectangle on the classic theme once given an explicit shape.
const withImage = (attribute: string) =>
  SAMPLE_MAP.replace('text="B" ', `text="B" shape="rectangle" ${attribute} `);

const harnesses: Harness[] = [];
const open = async (xml: string): Promise<Harness> => {
  const harness = await buildDesigner(xml);
  harnesses.push(harness);
  return harness;
};

afterEach(() => {
  harnesses.splice(0).forEach((harness) => harness.designer.dispose());
  jest.restoreAllMocks();
});

const nativeOf = (element: unknown): SVGElement =>
  (element as { peer: { _native: SVGElement } }).peer._native;

/** Hovers the image, then clicks the delete widget that shows next to it. */
const clickDeleteWidget = (harness: Harness, image: unknown) => {
  nativeOf(image).dispatchEvent(new MouseEvent('mouseover'));
  const widget = (
    ElementDeleteWidget.getInstance(harness.designer) as unknown as { _widget: unknown }
  )._widget;
  expect(widget).toBeTruthy();
  nativeOf(widget).dispatchEvent(new MouseEvent('click'));
};

describe('Gallery icon of a topic', () => {
  it('draws a Material glyph above the text, and grows the topic for it', async () => {
    const harness = await open(withImage('imageGallery="star"'));
    const feature = svgFeature(harness.topic(3));
    const glyph = feature.getOrBuildSVGElement();
    expect(glyph).toBeInstanceOf(Text);
    expect(feature.hasSVG()).toBe(true);

    // jsdom measures every text as 60 x 14.
    expect(feature.calculateSVGDimensions()).toEqual({ height: 24, width: 60 });
    expect(feature.calculateTopicSizeAdjustments(40, 20, 14, 5)).toEqual({
      width: 70,
      height: 5 + 24 + 12 + 14 + 5,
    });
    // Never narrower than the topic already is.
    expect(feature.calculateTopicSizeAdjustments(200, 20, 14, 5).width).toBe(200);

    const { textY } = feature.positionSVGAndAdjustText(100, 24, 14, 5);
    expect(textY).toBe(5 + 24 + 12);
    expect(glyph!.getPosition()).toEqual({ x: 20, y: 5 });
  });

  it('draws a brand icon as a self-contained image in the font colour', async () => {
    const harness = await open(withImage('imageGallery="twitter"'));
    const topic = harness.topic(3);
    const feature = svgFeature(topic);
    const image = feature.getOrBuildSVGElement() as Image;
    expect(image).toBeInstanceOf(Image);
    expect(feature.calculateSVGDimensions()).toEqual({ height: 24, width: 24 });

    const fontColor = topic.getFontColor(topic.getThemeVariant());
    expect(image.getHref()).toBe(brandIconHref(BRAND_ICON_PATHS.twitter, fontColor));

    harness.designer.getActionDispatcher().changeFontColorToTopic([3], '#ff0000');
    feature.updateIconColor();
    expect(image.getHref()).toBe(brandIconHref(BRAND_ICON_PATHS.twitter, '#ff0000'));
  });

  it('keeps the default colour on a line topic', async () => {
    const harness = await open(
      SAMPLE_MAP.replace('text="B" ', 'text="B" shape="line" imageGallery="twitter" '),
    );
    const image = svgFeature(harness.topic(3)).getOrBuildSVGElement() as Image;
    expect(image.getHref()).toBe(brandIconHref(BRAND_ICON_PATHS.twitter, '#000000'));
  });

  it('draws nothing for an unknown icon, and warns about it once', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const harness = await open(withImage('imageGallery="no-such-icon"'));
    const feature = svgFeature(harness.topic(3));
    const before = warn.mock.calls.length;

    expect(feature.hasSVG()).toBe(false);
    expect(feature.getOrBuildSVGElement()).toBeUndefined();
    expect(feature.calculateSVGDimensions()).toEqual({ height: 0, width: 0 });
    expect(warn.mock.calls.length).toBe(before);
    expect(warn.mock.calls.some(([message]) => String(message).includes('no-such-icon'))).toBe(
      true,
    );
  });

  it('lays a topic without image out as text only', async () => {
    const harness = await open(SAMPLE_MAP);
    const feature = svgFeature(harness.topic(3));
    expect(feature.calculateTopicSizeAdjustments(40, 20, 14, 5)).toEqual({
      width: 40,
      height: 20,
    });
    const { height } = harness.topic(3).getSize();
    expect(feature.positionSVGAndAdjustText(100, 0, 14, 5).textY).toBe((height - 14) / 2);
  });

  it('is removed, undoably, with the delete widget', async () => {
    const harness = await open(withImage('imageGallery="star"'));
    const before = harness.save();
    const glyph = svgFeature(harness.topic(3)).getOrBuildSVGElement();

    clickDeleteWidget(harness, glyph);
    expect(harness.topic(3).getImageGalleryIconName()).toBeUndefined();
    expect(svgFeature(harness.topic(3)).hasSVG()).toBe(false);

    harness.designer.undo();
    expect(harness.save()).toEqual(before);
  });

  it('removes its drawing from the topic', async () => {
    const harness = await open(withImage('imageGallery="star"'));
    const feature = svgFeature(harness.topic(3));
    const glyph = feature.getOrBuildSVGElement()!;
    expect(nativeOf(glyph).isConnected).toBe(true);

    feature.remove();
    expect(nativeOf(glyph).isConnected).toBe(false);
    // The model still has the icon: it is drawn again on the next build.
    expect(feature.getOrBuildSVGElement()).not.toBe(glyph);
  });
});

describe('Emoji image of a topic', () => {
  it('draws the emoji three times the font size, above the text', async () => {
    const harness = await open(withImage('imageEmoji="😀"'));
    const topic = harness.topic(3);
    const feature = emojiFeature(topic);
    expect(feature.hasEmoji()).toBe(true);

    const { height } = feature.calculateEmojiDimensions();
    expect(height).toBe(topic.getFontSize() * 3);
    const adjusted = feature.calculateTopicSizeAdjustments(40, 20, 14, 6);
    expect(adjusted.height).toBeGreaterThan(height + 14);
  });

  it('follows changes of the emoji and of the font size', async () => {
    const harness = await open(withImage('imageEmoji="😀"'));
    const topic = harness.topic(3);
    harness.topic(3).setOnFocus(true);
    harness.designer.changeImageEmojiChar('🎉');
    harness.designer.changeFontSize(20);
    expect(emojiFeature(topic).getOrBuildEmojiTextShape()!.getText()).toBe('🎉');
    expect(emojiFeature(topic).calculateEmojiDimensions().height).toBe(60);
  });

  it('replaces a gallery icon, and is replaced by one', async () => {
    const harness = await open(withImage('imageEmoji="😀"'));
    const topic = harness.topic(3);
    topic.setOnFocus(true);

    harness.designer.changeImageGalleryIconName('star');
    expect(topic.getImageEmojiChar()).toBeUndefined();
    expect(topic.getImageGalleryIconName()).toBe('star');

    harness.designer.changeImageEmojiChar('😀');
    expect(topic.getImageGalleryIconName()).toBeUndefined();
    expect(topic.getImageEmojiChar()).toBe('😀');
  });

  it('is removed, undoably, with the delete widget', async () => {
    const harness = await open(withImage('imageEmoji="😀"'));
    const before = harness.save();
    const shape = emojiFeature(harness.topic(3)).getOrBuildEmojiTextShape();

    clickDeleteWidget(harness, shape);
    expect(harness.topic(3).getImageEmojiChar()).toBeUndefined();

    harness.designer.undo();
    expect(harness.save()).toEqual(before);
  });

  it('applies visibility, opacity and position to its drawing only when it has one', async () => {
    const plain = await open(SAMPLE_MAP);
    const none = emojiFeature(plain.topic(3));
    expect(() => {
      none.setVisibility(false);
      none.setOpacity(0.5);
      none.setPosition(1, 2);
    }).not.toThrow();
    expect(none.getPosition()).toBeUndefined();
    expect(none.getSize()).toBeUndefined();

    const harness = await open(withImage('imageEmoji="😀"'));
    const feature = emojiFeature(harness.topic(3));
    feature.setPosition(7, 9);
    expect(feature.getPosition()).toEqual({ x: 7, y: 9 });
    feature.setOpacity(0.5);
    expect(nativeOf(feature.getEmojiTextShape()).style.opacity).toBe('0.5');
    feature.setVisibility(false);
    expect(nativeOf(feature.getEmojiTextShape()).getAttribute('visibility')).toBe('hidden');
  });
});
