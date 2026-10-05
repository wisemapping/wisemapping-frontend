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
import ImageTopicShape from '../../src/components/shape/ImageTopicShape';
import type Topic from '../../src/components/Topic';

const topicWith = (size: { width: number; height: number } | undefined): Topic =>
  ({
    getModel: () => ({ getImageUrl: () => 'https://example.com/a.png', getImageSize: () => size }),
  }) as unknown as Topic;

// W4: Image.getSize() always returns a size, so the override can no longer return undefined.
describe('ImageTopicShape.getSize', () => {
  it('is the image size of the model', () => {
    expect(new ImageTopicShape(topicWith({ width: 30, height: 20 })).getSize()).toEqual({
      width: 30,
      height: 20,
    });
  });

  it('is the drawn size when the model has no image size', () => {
    const shape = new ImageTopicShape(topicWith(undefined));
    expect(shape.getSize()).toEqual({ width: 1, height: 1 });
  });
});
