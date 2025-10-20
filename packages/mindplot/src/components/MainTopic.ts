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
import { Group, ElementClass, ElementPeer } from '@wisemapping/web2d';
import { $assert, $defined } from './util/assert';

import Topic from './Topic';
import Shape from './util/Shape';
import Canvas from './Canvas';
import SizeType from './SizeType';
import PositionType from './PositionType';
import TopicShapeFactory from './shape/TopicShapeFactory';

class MainTopic extends Topic {
  buildDragShape(): ElementClass<ElementPeer> {
    const shapeType = this.getShapeType();
    const innerShape = TopicShapeFactory.create(shapeType, this);
    const size = this.getSize();
    innerShape.setSize(size.width, size.height);
    innerShape.setPosition(0, 0);
    innerShape.setOpacity(0.5);
    innerShape.setCursor('default');
    innerShape.setVisibility(true);

    const brColor = this.getBorderColor(this.getThemeVariant());
    innerShape.setStroke(null, null, brColor);

    const bgColor = this.getBackgroundColor(this.getThemeVariant());
    innerShape.setFill(bgColor);

    //  Create group ...
    const groupAttributes = {
      width: 100,
      height: 100,
      coordSizeWidth: 100,
      coordSizeHeight: 100,
    };
    const group = new Group(groupAttributes);
    innerShape.appendTo(group);

    const textShape = this.buildTextShape(true);
    const text = this.getText();
    textShape.setText(text);
    textShape.setOpacity(0.5);

    // Copy text position of the topic element ...
    const textPosition = this.getOrBuildTextShape().getPosition();
    textShape.setPosition(textPosition.x, textPosition.y);

    group.append(textShape);
    return group;
  }

  disconnect(canvas: Canvas) {
    super.disconnect(canvas);

    const innerShape = this.getInnerShape();
    innerShape.setVisibility(true);
  }

  updatePositionOnChangeSize(oldSize: SizeType, newSize: SizeType) {
    const xOffset = Math.round((newSize.width - oldSize.width) / 2);
    const pos = this.getPosition();
    if ($defined(pos)) {
      if (pos.x > 0) {
        pos.x += xOffset;
      } else {
        pos.x -= xOffset;
      }
      this.setPosition(pos);
    }
  }

  workoutIncomingConnectionPoint(sourcePosition: PositionType): PositionType {
    // This is called on the parent to get connection point FROM child
    const orientation = this.getOrientation();

    if (orientation === 'vertical') {
      // Tree layout: parent receives connection from child at BOTTOM center
      const pos = this.getPosition();
      const size = this.getSize();
      return {
        x: pos.x,
        y: pos.y + size.height / 2, // Bottom center
      };
    }

    // Mindmap layout: use existing horizontal logic
    return Shape.workoutIncomingConnectionPoint(this, sourcePosition);
  }

  workoutOutgoingConnectionPoint(targetPosition: PositionType): PositionType {
    $assert(targetPosition, 'targetPoint can not be null');

    // This is called on the child to get connection point TO parent
    const orientation = this.getOrientation();

    if (orientation === 'vertical') {
      // Tree layout: child connects to parent from TOP center
      const pos = this.getPosition();
      const size = this.getSize();
      return {
        x: pos.x,
        y: pos.y - size.height / 2, // Top center
      };
    }

    // Mindmap layout: use existing horizontal logic
    const pos = this.getPosition();
    const isAtRight = Shape.isAtRight(targetPosition, pos);
    const size = this.getSize();

    let result: PositionType = { x: 0, y: 0 };
    if (this.getShapeType() === 'line') {
      const groupPosition = this.get2DElement().getPosition();
      const innerShareSize = this.getInnerShape().getSize();

      if (innerShareSize) {
        const magicCorrectionNumber = 0.3;
        if (!isAtRight) {
          result.x = groupPosition.x + innerShareSize.width - magicCorrectionNumber;
        } else {
          result.x = groupPosition.x + magicCorrectionNumber;
        }
        result.y = groupPosition.y + innerShareSize.height;
      } else {
        // Hack: When the size has not being defined. This is because the node has not being added.
        // Try to do our best ...
        if (!isAtRight) {
          result.x = pos.x + size.width / 2;
        } else {
          result.x = pos.x - size.width / 2;
        }
        result.y = pos.y + size.height / 2;
      }
    } else {
      result = Shape.calculateRectConnectionPoint(pos, size, isAtRight);
    }
    return { ...result };
  }
}

export default MainTopic;
