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

import { ArcLine as ArcLine2d } from '@wisemapping/web2d';
import Topic from '../Topic';

class ArcLine extends ArcLine2d {
  private _targetTopic: Topic;

  private _sourceTopic: Topic;

  constructor(sourceTopic: Topic, targetTopic: Topic) {
    super({ strokeWidth: 2 });
    this._targetTopic = targetTopic;
    this._sourceTopic = sourceTopic;
  }

  // Adjust the x position so there is not overlap with the connector.
  setFrom(x: number, y: number): void {
    let xOffset = x;
    if (this._targetTopic.isCentralTopic()) {
      const sourceX = this._sourceTopic.getPosition().x;
      xOffset = Math.sign(sourceX) * 10;
    } else {
      xOffset = x + 3 * Math.sign(x);
    }

    super.setFrom(xOffset, y);
  }
}
export default ArcLine;
