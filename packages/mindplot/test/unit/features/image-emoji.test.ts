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
import ImageEmoji from '../../../src/components/ImageEmoji';
import Topic from '../../../src/components/Topic';

/**
 * Minimal topic: a real web2d group plus a redraw that runs the emoji steps of
 * Topic.redraw (add the glyph to the group, then set up its delete widget).
 */
const buildTopic = (designer: object) => {
  const group = new Group();
  const model = { getImageEmojiChar: () => '😀' };
  let feature: ImageEmoji | undefined;
  const topic = {
    getModel: () => model,
    get2DElement: () => group,
    isReadOnly: () => false,
    getId: () => 1,
    getDesigner: () => designer,
    getFontSize: () => 10,
    redraw: () => {
      feature!.addToGroup(group);
      feature!.setupDeleteWidget();
    },
  };
  feature = new ImageEmoji(topic as unknown as Topic);
  return { feature, group, topic };
};

describe('ImageEmoji delete widget with two designers on the page (BL4-23)', () => {
  // jsdom does not lay out SVG text.
  beforeEach(() => {
    jest.spyOn(Text.prototype, 'getShapeWidth').mockReturnValue(30);
    jest.spyOn(Text.prototype, 'getShapeHeight').mockReturnValue(30);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hovering the emoji on one map does not close the delete widget on the other', () => {
    const first = buildTopic({});
    const second = buildTopic({});
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
