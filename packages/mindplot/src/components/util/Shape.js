/*
 *    Copyright [2015] [wisemapping]
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
import * as web2d from '@wisemapping/web2d';
import { $assert, $defined } from '@wisemapping/core-js';
import { TopicShape } from '../model/INodeModel';
import { CONNECTOR_WIDTH } from '../TopicConfig';

const Shape = {
  isAtRight(sourcePoint, targetPoint) {
    $assert(sourcePoint, 'Source can not be null');
    $assert(targetPoint, 'Target can not be null');
    return sourcePoint.x < targetPoint.x;
  },

  calculateRectConnectionPoint(rectCenterPoint, rectSize, isAtRight) {
    $assert(rectCenterPoint, 'rectCenterPoint can  not be null');
    $assert(rectSize, 'rectSize can  not be null');
    $assert($defined(isAtRight), 'isRight can  not be null');

    // Node is placed at the right ?
    const result = new web2d.Point();

    // This is used fix a minor difference ...z
    const correctionHardcode = 2;
    if (isAtRight) {
      result.setValue(
        rectCenterPoint.x - rectSize.width / 2 + correctionHardcode,
        rectCenterPoint.y,
      );
    } else {
      result.setValue(
        parseFloat(rectCenterPoint.x) + rectSize.width / 2 - correctionHardcode,
        rectCenterPoint.y,
      );
    }

    return result;
  },

  calculateRelationShipPointCoordinates(topic, controlPoint) {
    const size = topic.getSize();
    const position = topic.getPosition();
    const yGap = position.y - controlPoint.y;
    const xGap = position.x - controlPoint.x;
    const disable = Math.abs(yGap) < 5 || Math.abs(xGap) < 5 || Math.abs(yGap - xGap) < 5;

    let y;
    let x;
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

    return new web2d.Point(x, y);
  },

  calculateDefaultControlPoints(srcPos, tarPos) {
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

    return [
      new web2d.Point(-srcPos.x + x1, -srcPos.y + y1),
      new web2d.Point(-tarPos.x + x2, -tarPos.y + y2),
    ];
  },

  workoutIncomingConnectionPoint(targetNode, sourcePosition) {
    $assert(sourcePosition, 'sourcePoint can not be null');
    const pos = targetNode.getPosition();
    const size = targetNode.getSize();

    const isAtRight = Shape.isAtRight(sourcePosition, pos);
    const result = Shape.calculateRectConnectionPoint(pos, size, isAtRight);
    if (targetNode.getShapeType() === TopicShape.LINE) {
      result.y += targetNode.getSize().height / 2;
    }

    // Move a little the position...
    const offset = CONNECTOR_WIDTH / 2;
    if (!isAtRight) {
      result.x += offset;
    } else {
      result.x -= offset;
    }

    result.x = Math.ceil(result.x);
    result.y = Math.ceil(result.y);
    return result;
  },
};

export default Shape;
