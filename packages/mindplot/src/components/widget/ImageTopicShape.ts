/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { Image } from '@wisemapping/web2d';
import SizeType from '../SizeType';
import Topic from '../Topic';

class ImageTopicShape extends Image {
  private _topic: Topic;

  constructor(topic: Topic) {
    super();
    const model = topic.getModel();
    const url = model.getImageUrl();
    const size = model.getImageSize();

    super.setHref(url);
    super.setSize(size.width, size.height);
    this._topic = topic;
  }

  getSize(): SizeType {
    return this._topic.getModel().getImageSize();
  }

  setPosition(): void {
    // Ignore ...
  }
}

export default ImageTopicShape;
