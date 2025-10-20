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

  // Adjust the x/y position so there is not overlap with the connector.
  setFrom(x: number, y: number): void {
    const orientation = this._targetTopic.getOrientation();
    let xOffset = x;
    let yOffset = y;

    if (orientation === 'vertical') {
      // Tree layout: adjust Y position
      if (this._targetTopic.isCentralTopic()) {
        const sourceY = this._sourceTopic.getPosition().y;
        yOffset = Math.sign(sourceY) * 10;
      } else {
        yOffset = y + 3 * Math.sign(y);
      }
    } else if (this._targetTopic.isCentralTopic()) {
      // Mindmap layout: adjust X position for central topic
      const sourceX = this._sourceTopic.getPosition().x;
      xOffset = Math.sign(sourceX) * 10;
    } else {
      // Mindmap layout: adjust X position for non-central topic
      xOffset = x + 3 * Math.sign(x);
    }

    super.setFrom(xOffset, yOffset);
  }
}
export default ArcLine;
