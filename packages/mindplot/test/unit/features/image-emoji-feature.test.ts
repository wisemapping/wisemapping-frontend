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
import ImageEmojiFeature from '../../../src/components/ImageEmojiFeature';
import Topic from '../../../src/components/Topic';
import ElementDeleteWidget from '../../../src/components/ElementDeleteWidget';

/**
 * Minimal topic: a real web2d group plus a redraw that runs the emoji steps of
 * Topic.redraw (add the glyph to the group, then set up its delete widget).
 */
const buildTopic = (initialEmoji: string | undefined, designer?: object) => {
  let emoji = initialEmoji;
  const group = new Group();
  const model = {
    getImageEmojiChar: () => emoji,
    setImageEmojiChar: (value: string | undefined) => {
      emoji = value;
    },
  };
  let feature: ImageEmojiFeature | undefined;
  const topic = {
    getModel: () => model,
    get2DElement: () => group,
    isReadOnly: () => false,
    getId: () => 1,
    getDesigner: () => designer,
    getFontSize: () => 10,
    getFontStyle: () => 'normal',
    getThemeVariant: () => 'light',
    redraw: () => {
      if (feature!.hasEmoji()) {
        feature!.addToGroup(group);
        feature!.setupDeleteWidget();
      }
    },
  };
  feature = new ImageEmojiFeature(topic as unknown as Topic);
  return { feature, group, topic };
};

const glyphs = (group: Group): string[] =>
  Array.from(group.getNode().querySelectorAll('text')).map((t) => t.textContent || '');

describe('ImageEmojiFeature', () => {
  describe('delete widget (B-EMOJIWIDGET)', () => {
    let addEvent: jest.SpyInstance;

    // Events registered on one glyph, in order.
    const eventsOn = (text: Text): string[] =>
      addEvent.mock.calls.filter((_, i) => addEvent.mock.contexts[i] === text).map((c) => c[0]);

    beforeEach(() => {
      addEvent = jest.spyOn(Text.prototype, 'addEvent');
    });

    afterEach(() => {
      addEvent.mockRestore();
    });

    it('registers a single mouseover/mouseout pair however many redraws happen', () => {
      const { feature, topic } = buildTopic('😀');
      for (let i = 0; i < 5; i++) {
        topic.redraw();
      }

      expect(eventsOn(feature.getEmojiTextShape()!)).toEqual(['mouseover', 'mouseout']);
    });

    it('decorates the new glyph once after the emoji changes', () => {
      const { feature, topic } = buildTopic('😀');
      topic.redraw();
      const before = feature.getEmojiTextShape()!;

      feature.setEmojiChar('🚀');
      for (let i = 0; i < 3; i++) {
        topic.redraw();
      }

      const after = feature.getEmojiTextShape()!;
      expect(after).not.toBe(before);
      expect(eventsOn(before)).toEqual(['mouseover', 'mouseout']);
      expect(eventsOn(after)).toEqual(['mouseover', 'mouseout']);
    });
  });

  describe('changing the emoji (B-EMOJISWAP)', () => {
    it('replaces the old glyph instead of stacking a second one', () => {
      const { feature, group, topic } = buildTopic('😀');
      topic.redraw();
      expect(glyphs(group)).toEqual(['😀']);

      feature.setEmojiChar('🚀');

      expect(glyphs(group)).toEqual(['🚀']);
    });

    it('removes the glyph when the emoji is cleared', () => {
      const { feature, group, topic } = buildTopic('😀');
      topic.redraw();

      feature.setEmojiChar(undefined);

      expect(glyphs(group)).toEqual([]);
    });
  });
});

describe('ImageEmojiFeature delete widget with two designers on the page (BL4-23)', () => {
  // jsdom does not lay out SVG text.
  beforeEach(() => {
    jest.spyOn(Text.prototype, 'getShapeWidth').mockReturnValue(30);
    jest.spyOn(Text.prototype, 'getShapeHeight').mockReturnValue(30);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hovering the emoji on one map does not close the delete widget on the other', () => {
    const first = buildTopic('😀', {});
    const second = buildTopic('😀', {});
    first.topic.redraw();
    second.topic.redraw();
    const append = jest.spyOn(first.group, 'append');
    const removeChild = jest.spyOn(first.group, 'removeChild');

    // Hovering the emoji shows its delete widget in the topic ...
    first.feature.getEmojiTextShape()!.trigger('mouseover', {});
    expect(append).toHaveBeenCalledTimes(1);
    const widget = append.mock.calls[0][0];

    // ... and hovering the emoji on the other map must not close it.
    second.feature.getEmojiTextShape()!.trigger('mouseover', {});

    expect(removeChild).not.toHaveBeenCalledWith(widget);
  });
});

// BL5-160: the emoji size read the text box twice (getShapeWidth, then getShapeHeight).
describe('ImageEmojiFeature size', () => {
  let measure: jest.SpyInstance;
  let width: jest.SpyInstance;
  let height: jest.SpyInstance;

  beforeEach(() => {
    measure = jest.spyOn(Text.prototype, 'measure').mockReturnValue({ width: 30, height: 36 });
    width = jest.spyOn(Text.prototype, 'getShapeWidth');
    height = jest.spyOn(Text.prototype, 'getShapeHeight');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('measures the glyph once', () => {
    const { feature, topic } = buildTopic('😀');
    topic.redraw();
    measure.mockClear();

    expect(feature.getSize()).toEqual({ width: 30, height: 36 });
    expect(measure).toHaveBeenCalledTimes(1);
    expect(width).not.toHaveBeenCalled();
    expect(height).not.toHaveBeenCalled();
  });

  it('measures the glyph once for its delete widget', () => {
    const { feature, group, topic } = buildTopic('😀', {});
    topic.redraw();
    const append = jest.spyOn(group, 'append');
    measure.mockClear();

    // Hovering the emoji shows its delete widget, placed from the glyph size.
    feature.getEmojiTextShape()!.trigger('mouseover', {});

    expect(append).toHaveBeenCalledTimes(1);
    expect(measure).toHaveBeenCalledTimes(1);
    expect(width).not.toHaveBeenCalled();
    expect(height).not.toHaveBeenCalled();
  });
});

describe('ImageEmojiFeature delete widget target (BL5-188)', () => {
  it('hands the widget a Removable, not an icon with a fake feature model', () => {
    const decorate = jest.spyOn(ElementDeleteWidget.prototype, 'decorate');
    try {
      const { topic } = buildTopic('😀');
      topic.redraw();

      expect(decorate).toHaveBeenCalledTimes(1);
      const removable = decorate.mock.calls[0][1];
      // The emoji is no feature of the topic: it used to answer getModel() with {}.
      expect('getModel' in removable).toBe(false);
      expect('setGroup' in removable).toBe(false);
      expect(removable.getGroup()).toBeNull();
    } finally {
      decorate.mockRestore();
    }
  });
});
