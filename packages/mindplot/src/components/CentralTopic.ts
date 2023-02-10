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
import { $assert } from '@wisemapping/core-js';
import PositionType from './PositionType';
import Topic from './Topic';
import Shape from './util/Shape';

class CentralTopic extends Topic {
  buildDragShape() {
    // Ignore ..
  }

  registerEvents(): void {
    super.registerEvents();

    // This disable the drag of the central topic.
    // But solves the problem of deselecting the nodes when the screen is clicked.
    this.addEvent('mousedown', (event: MouseEvent) => {
      event.stopPropagation();
    });
  }

  workoutIncomingConnectionPoint(): PositionType {
    return this.getPosition();
  }

  setCursor(type: string): void {
    super.setCursor(type === 'move' ? 'default' : type);
  }

  updateTopicShape(): void {
    // Overwite behaviour ...
  }

  _updatePositionOnChangeSize(): void {
    // Center main topic ...
    const zeroPoint = { x: 0, y: 0 };
    this.setPosition(zeroPoint);
  }

  getShrinkConnector(): null {
    return null;
  }

  workoutOutgoingConnectionPoint(targetPosition: PositionType) {
    $assert(targetPosition, 'targetPoint can not be null');

    const pos = this.getPosition();
    const isAtRight = Shape.isAtRight(targetPosition, pos);
    const size = this.getSize();

    return Shape.calculateRectConnectionPoint(pos, size, !isAtRight);
  }
}

export default CentralTopic;
