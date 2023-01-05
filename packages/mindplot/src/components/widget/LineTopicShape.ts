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
import { Line } from '@wisemapping/web2d';
import SizeType from '../SizeType';
import Topic from '../Topic';

class LineTopicShape extends Line {
  private _topic: Topic;

  private _size: SizeType;

  constructor(topic: Topic) {
    const stokeColor = topic.getConnectionColor();
    super({
      strokeColor: stokeColor,
      strokeWidth: 1,
    });
    this._topic = topic;
  }

  setSize(width: number, height: number): void {
    this._size = { width, height };
    super.setFrom(0, height);
    super.setTo(width, height);
  }

  getSize() {
    return this._size;
  }

  setPosition() {
    // Overwrite behaviour ...
  }

  setFill() {
    // Overwrite behaviour ...
  }
}

export default LineTopicShape;