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
import { Point } from '@wisemapping/web2d';
import { $assert } from '@wisemapping/core-js';
import Topic from './Topic';
import Shape from './util/Shape';

class CentralTopic extends Topic {
  _buildDragShape() {
    // Ignore ..
  }

  _registerEvents(): void {
    super._registerEvents();

    // This disable the drag of the central topic.
    // But solves the problem of deselecting the nodes when the screen is clicked.
    this.addEvent('mousedown', (event: MouseEvent) => {
      event.stopPropagation();
    });
  }

  workoutIncomingConnectionPoint(): Point {
    return this.getPosition();
  }

  setCursor(type: string) {
    super.setCursor(type === 'move' ? 'default' : type);
  }

  updateTopicShape() {
    // Overwite behaviour ...
  }

  _updatePositionOnChangeSize() {
    // Center main topic ...
    const zeroPoint = new Point(0, 0);
    this.setPosition(zeroPoint);
  }

  getShrinkConnector() {
    return null;
  }

  /** */
  workoutOutgoingConnectionPoint(targetPosition: Point) {
    $assert(targetPosition, 'targetPoint can not be null');
    const pos = this.getPosition();
    const isAtRight = Shape.isAtRight(targetPosition, pos);
    const size = this.getSize();
    return Shape.calculateRectConnectionPoint(pos, size, !isAtRight);
  }
}

export default CentralTopic;
