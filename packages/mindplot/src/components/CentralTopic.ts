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
import { $assert } from './util/assert';
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

  workoutIncomingConnectionPoint(sourcePosition: PositionType): PositionType {
    // This is called on central topic (parent) to get connection point FROM children
    const orientation = this.getOrientation();

    if (orientation === 'vertical') {
      // Tree layout: central topic receives connections from children at BOTTOM center
      const pos = this.getPosition();
      const size = this.getSize();
      return {
        x: pos.x,
        y: pos.y + size.height / 2, // Bottom center
      };
    }

    // Mindmap layout: center of the topic
    // For central topic in mindmap, we don't offset based on source position
    return this.getPosition();
  }

  setCursor(type: string): void {
    super.setCursor(type === 'move' ? 'default' : type);
  }

  updateTopicShape(): boolean {
    return true;
  }

  updatePositionOnChangeSize(): void {
    // Center main topic ...
    const zeroPoint = { x: 0, y: 0 };
    this.setPosition(zeroPoint);
  }

  getShrinkConnector(): null {
    return null;
  }

  workoutOutgoingConnectionPoint(targetPosition: PositionType) {
    $assert(targetPosition, 'targetPoint can not be null');

    // Central topic doesn't connect to a parent, but keep for consistency
    const pos = this.getPosition();
    const isAtRight = Shape.isAtRight(targetPosition, pos);
    const size = this.getSize();

    return Shape.calculateRectConnectionPoint(pos, size, !isAtRight);
  }
}

export default CentralTopic;
