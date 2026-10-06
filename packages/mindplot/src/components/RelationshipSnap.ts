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
import type PositionType from './PositionType';
import type Topic from './Topic';

/**
 * Where a relationship meets a topic. Its own module, so that the relationship and its control
 * points both use it without importing each other.
 */
const RelationshipSnap = {
  /**
   * Calculate the best snap point on a topic's border for a relationship connection
   * @param topic The topic to connect to
   * @param targetPosition The position we're connecting toward (other topic or control point)
   * @returns The optimal connection point on the topic's border
   */
  calculateSnapPoint(topic: Topic, targetPosition: PositionType): PositionType {
    const pos = topic.getPosition();
    const size = topic.getSize();
    const centerOffset = 7; // 7px offset from topic border for visual spacing

    // Calculate direction to target to minimize connection distance
    const deltaX = targetPosition.x - pos.x;
    const deltaY = targetPosition.y - pos.y;

    // Determine which edge is closest by comparing angles
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Define 10 connection points per side evenly distributed along each edge
    const horizontalPoints = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
    const verticalPoints = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];

    if (absY > absX) {
      // Vertical connection is shorter (top or bottom)
      const edgeY =
        deltaY < 0
          ? pos.y - size.height / 2 - centerOffset // Top border (move up/away)
          : pos.y + size.height / 2 + centerOffset; // Bottom border (move down/away)

      // Calculate all 10 connection points along the horizontal edge
      const connectionPoints = horizontalPoints.map((ratio) => {
        const x = pos.x - size.width / 2 + size.width * ratio;
        return {
          x,
          y: edgeY,
          distance: Math.hypot(x - targetPosition.x, edgeY - targetPosition.y),
        };
      });

      // Find the closest point
      const closest = connectionPoints.reduce((min, point) =>
        point.distance < min.distance ? point : min,
      );

      return { x: closest.x, y: closest.y };
    }

    // Horizontal connection is shorter (left or right)
    const edgeX =
      deltaX < 0
        ? pos.x - size.width / 2 - centerOffset // Left border (move left/away)
        : pos.x + size.width / 2 + centerOffset; // Right border (move right/away)

    // Calculate all 10 connection points along the vertical edge
    const connectionPoints = verticalPoints.map((ratio) => {
      const y = pos.y - size.height / 2 + size.height * ratio;
      return { x: edgeX, y, distance: Math.hypot(edgeX - targetPosition.x, y - targetPosition.y) };
    });

    // Find the closest point
    const closest = connectionPoints.reduce((min, point) =>
      point.distance < min.distance ? point : min,
    );

    return { x: closest.x, y: closest.y };
  },
};

export default RelationshipSnap;
