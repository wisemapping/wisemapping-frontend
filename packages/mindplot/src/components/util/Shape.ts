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
    const y = srcPos.y - tarPos.y;
    const x = srcPos.x - tarPos.x;
    const div = Math.abs(x) > 0.1 ? x : 0.1; // Prevent division by 0.

    const m = y / div;
    const l = Math.sqrt(y * y + x * x) / 3;
    let fix = 1;
    if (srcPos.x > tarPos.x) {
      fix = -1;
    }

    const x1 = srcPos.x + Math.sqrt((l * l) / (1 + m * m)) * fix;
    const y1 = m * (x1 - srcPos.x) + srcPos.y;
    const x2 = tarPos.x + Math.sqrt((l * l) / (1 + m * m)) * fix * -1;
    const y2 = m * (x2 - tarPos.x) + tarPos.y;

    return [new Point(-srcPos.x + x1, -srcPos.y + y1), new Point(-tarPos.x + x2, -tarPos.y + y2)];
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
