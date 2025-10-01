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
import { $assert } from '@wisemapping/core-js';
import TopicConfig from '../TopicConfig';
import PositionType from '../PositionType';
import SizeType from '../SizeType';
import Topic from '../Topic';

class Shape {
  static isAtRight(sourcePoint: PositionType, targetPoint: PositionType): boolean {
    return sourcePoint.x < targetPoint.x;
  }

  static calculateRectConnectionPoint(
    rectCenterPoint: PositionType,
    rectSize: SizeType,
    isAtRight: boolean,
  ): PositionType {
    // This is used fix a minor difference ...z
    const correctionHardcode = 2;
    let result: PositionType;
    if (isAtRight) {
      result = {
        x: rectCenterPoint.x - rectSize.width / 2 + correctionHardcode,
        y: rectCenterPoint.y,
      };
    } else {
      result = {
        x: rectCenterPoint.x + rectSize.width / 2 - correctionHardcode,
        y: rectCenterPoint.y,
      };
    }

    return result;
  }

  static calculateRelationShipPointCoordinates(
    topic: Topic,
    controlPoint: PositionType,
  ): PositionType {
    const size = topic.getSize();
    const position = topic.getPosition();
    const yGap = position.y - controlPoint.y;
    const xGap = position.x - controlPoint.x;
    const disable = Math.abs(yGap) < 5 || Math.abs(xGap) < 5 || Math.abs(yGap - xGap) < 5;

    let y: number;
    let x: number;
    const gap = 5;
    if (controlPoint.y > position.y + size.height / 2) {
      y = position.y + size.height / 2 + gap;
      x = !disable ? position.x - (position.y - y) / (yGap / xGap) : position.x;
      if (x > position.x + size.width / 2) {
        x = position.x + size.width / 2;
      } else if (x < position.x - size.width / 2) {
        x = position.x - size.width / 2;
      }
    } else if (controlPoint.y < position.y - size.height / 2) {
      y = position.y - size.height / 2 - gap;
      x = !disable ? position.x - (position.y - y) / (yGap / xGap) : position.x;
      if (x > position.x + size.width / 2) {
        x = position.x + size.width / 2;
      } else if (x < position.x - size.width / 2) {
        x = position.x - size.width / 2;
      }
    } else if (controlPoint.x < position.x - size.width / 2) {
      x = position.x - size.width / 2 - gap;
      y = !disable ? position.y - (yGap / xGap) * (position.x - x) : position.y;
    } else {
      x = position.x + size.width / 2 + gap;
      y = !disable ? position.y - (yGap / xGap) * (position.x - x) : position.y;
    }

    return { x, y };
  }

  static calculateDefaultControlPoints(
    srcPos: PositionType,
    tarPos: PositionType,
  ): [PositionType, PositionType] {
    const deltaX = tarPos.x - srcPos.x;
    const deltaY = tarPos.y - srcPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Calculate the middle point of the imaginary line between nodes
    const midX = (srcPos.x + tarPos.x) / 2;
    const midY = (srcPos.y + tarPos.y) / 2;

    // Determine curve direction based on position relative to center (0,0)
    const avgX = (srcPos.x + tarPos.x) / 2;
    const avgY = (srcPos.y + tarPos.y) / 2;

    // Gap between control points (1/4 of line distance)
    const gapDistance = distance / 4;
    // Distance below/away from the line (1/4 of line distance)
    const curveDistance = distance / 4;

    let controlOffset1: PositionType;
    let controlOffset2: PositionType;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal connections (like bottom nodes)
      // Control points below the imaginary line, same Y, X positions around middle with gap
      const curveDirection = avgY >= 0 ? 1 : -1; // Positive Y = curve down, Negative Y = curve up

      // Determine which direction the line goes (left to right or right to left)
      if (deltaX >= 0) {
        // Line goes left to right: src control point left of middle, target control point right of middle
        controlOffset1 = {
          x: midX - gapDistance / 2 - srcPos.x, // Left of middle, relative to source
          y: curveDistance * curveDirection, // Below/above the line
        };
        controlOffset2 = {
          x: midX + gapDistance / 2 - tarPos.x, // Right of middle, relative to target
          y: curveDistance * curveDirection, // Below/above the line (same Y as control point 1)
        };
      } else {
        // Line goes right to left: src control point right of middle, target control point left of middle
        controlOffset1 = {
          x: midX + gapDistance / 2 - srcPos.x, // Right of middle, relative to source
          y: curveDistance * curveDirection, // Below/above the line
        };
        controlOffset2 = {
          x: midX - gapDistance / 2 - tarPos.x, // Left of middle, relative to target
          y: curveDistance * curveDirection, // Below/above the line (same Y as control point 1)
        };
      }
    } else {
      // Vertical connections (like left/right nodes)
      // Control points to the side of the imaginary line, same X, Y positions around middle with gap
      const curveDirection = avgX >= 0 ? 1 : -1; // Positive X = curve right, Negative X = curve left

      // Determine which direction the line goes (top to bottom or bottom to top)
      if (deltaY >= 0) {
        // Line goes top to bottom: src control point above middle, target control point below middle
        controlOffset1 = {
          x: curveDistance * curveDirection, // To the side of the line
          y: midY - gapDistance / 2 - srcPos.y, // Above middle, relative to source
        };
        controlOffset2 = {
          x: curveDistance * curveDirection, // To the side of the line (same X as control point 1)
          y: midY + gapDistance / 2 - tarPos.y, // Below middle, relative to target
        };
      } else {
        // Line goes bottom to top: src control point below middle, target control point above middle
        controlOffset1 = {
          x: curveDistance * curveDirection, // To the side of the line
          y: midY + gapDistance / 2 - srcPos.y, // Below middle, relative to source
        };
        controlOffset2 = {
          x: curveDistance * curveDirection, // To the side of the line (same X as control point 1)
          y: midY - gapDistance / 2 - tarPos.y, // Above middle, relative to target
        };
      }
    }

    return [controlOffset1, controlOffset2];
  }

  static workoutIncomingConnectionPoint(targetNode: Topic, sourcePosition: PositionType) {
    $assert(sourcePosition, 'sourcePoint can not be null');
    const pos = targetNode.getPosition();
    const size = targetNode.getSize();

    const isAtRight = Shape.isAtRight(sourcePosition, pos);
    const result = Shape.calculateRectConnectionPoint(pos, size, isAtRight);
    if (targetNode.getShapeType() === 'line') {
      result.y += targetNode.getSize().height / 2;
    }

    // Move a little the position...
    const offset = TopicConfig.CONNECTOR_WIDTH / 2;
    if (!isAtRight) {
      result.x += offset;
    } else {
      result.x -= offset;
    }

    return result;
  }
}

export default Shape;
