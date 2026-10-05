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
import { Group, Text } from '@wisemapping/web2d';
import ImageSVGFeature from '../../../src/components/ImageSVGFeature';
import Topic from '../../../src/components/Topic';
import ElementDeleteWidget from '../../../src/components/ElementDeleteWidget';

/**
 * Minimal topic: a real web2d group plus a redraw that runs the gallery icon
 * steps of Topic.redraw (add the glyph to the group, then build its delete tip).
 */
const buildTopic = (initialIcon: string | undefined, designer?: object) => {
  let iconName = initialIcon;
  const group = new Group();
  const model = {
    getImageGalleryIconName: () => iconName,
    setImageGalleryIconName: (value: string | undefined) => {
      iconName = value;
    },
  };
  let feature: ImageSVGFeature | undefined;
  const topic = {
    getModel: () => model,
    get2DElement: () => group,
    isReadOnly: () => false,
    getId: () => 1,
    getDesigner: () => designer,
    getFontStyle: () => 'normal',
    // 'line' keeps the icon color out of the theme lookup.
    getShapeType: () => 'line',
    getThemeVariant: () => 'light',
    redraw: () => {
      if (feature!.hasSVG()) {
        feature!.addToGroup(group);
        feature!.buildRemoveTip();
      }
    },
  };
  feature = new ImageSVGFeature(topic as unknown as Topic);
  return { feature, group, topic };
};

describe('ImageSVGFeature delete widget (B-EMOJIWIDGET)', () => {
  let addEvent: jest.SpyInstance;

  // Events registered on one glyph, in order.
  const eventsOn = (text: unknown): string[] =>
    addEvent.mock.calls.filter((_, i) => addEvent.mock.contexts[i] === text).map((c) => c[0]);

  beforeEach(() => {
    addEvent = jest.spyOn(Text.prototype, 'addEvent');
  });

  afterEach(() => {
    addEvent.mockRestore();
  });

  it('registers a single mouseover/mouseout pair however many redraws happen', () => {
    const { feature, topic } = buildTopic('star');
    for (let i = 0; i < 5; i++) {
      topic.redraw();
    }

    expect(eventsOn(feature.getOrBuildSVGElement()!)).toEqual(['mouseover', 'mouseout']);
  });

  it('decorates the new glyph once after the icon changes', () => {
    const { feature, topic } = buildTopic('star');
    topic.redraw();
    const before = feature.getOrBuildSVGElement()!;

    feature.setGalleryIconName('favorite');
    for (let i = 0; i < 3; i++) {
      topic.redraw();
    }

    const after = feature.getOrBuildSVGElement()!;
    expect(after).not.toBe(before);
    expect(eventsOn(before)).toEqual(['mouseover', 'mouseout']);
    expect(eventsOn(after)).toEqual(['mouseover', 'mouseout']);
  });
});

describe('ImageSVGFeature delete widget with two designers on the page (BL4-23)', () => {
  // jsdom does not lay out SVG text.
  beforeEach(() => {
    jest.spyOn(Text.prototype, 'getShapeWidth').mockReturnValue(30);
    jest.spyOn(Text.prototype, 'getShapeHeight').mockReturnValue(30);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hovering the icon on one map does not close the delete widget on the other', () => {
    const first = buildTopic('star', {});
    const second = buildTopic('star', {});
    first.topic.redraw();
    second.topic.redraw();
    const append = jest.spyOn(first.group, 'append');
    const removeChild = jest.spyOn(first.group, 'removeChild');

    // Hovering the icon shows its delete widget in the topic ...
    first.feature.getOrBuildSVGElement()!.trigger('mouseover', {});
    expect(append).toHaveBeenCalledTimes(1);
    const widget = append.mock.calls[0][0];

    // ... and hovering the icon on the other map must not close it.
    second.feature.getOrBuildSVGElement()!.trigger('mouseover', {});

    expect(removeChild).not.toHaveBeenCalledWith(widget);
  });
});

describe('ImageSVGFeature delete widget target (BL5-188)', () => {
  it('hands the widget a Removable, not an icon with a fake feature model', () => {
    const decorate = jest.spyOn(ElementDeleteWidget.prototype, 'decorate');
    try {
      const { topic } = buildTopic('star');
      topic.redraw();

      expect(decorate).toHaveBeenCalledTimes(1);
      const removable = decorate.mock.calls[0][1];
      // The gallery icon is no feature of the topic: it used to answer getModel() with {}.
      expect('getModel' in removable).toBe(false);
      expect('setGroup' in removable).toBe(false);
      expect(removable.getGroup()).toBeNull();
    } finally {
      decorate.mockRestore();
    }
  });
});
