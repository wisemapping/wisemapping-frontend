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
import { $assert, $defined } from '@wisemapping/core-js';
import { Point, Group } from '@wisemapping/web2d';

import Topic from './Topic';
import { TopicShape } from './model/INodeModel';
import Shape from './util/Shape';

class MainTopic extends Topic {
  /**
         * @extends mindplot.Topic
         * @constructs
         * @param model
         * @param options
         */
  constructor(model, options) {
    super(model, options);
    this.INNER_RECT_ATTRIBUTES = { stroke: '0.5 solid #009900' };
  }

  _buildDragShape() {
    const innerShape = this._buildShape(this.INNER_RECT_ATTRIBUTES, this.getShapeType());
    const size = this.getSize();
    innerShape.setSize(size.width, size.height);
    innerShape.setPosition(0, 0);
    innerShape.setOpacity(0.5);
    innerShape.setCursor('default');
    innerShape.setVisibility(true);

    const brColor = this.getBorderColor();
    innerShape.setAttribute('strokeColor', brColor);

    const bgColor = this.getBackgroundColor();
    innerShape.setAttribute('fillColor', bgColor);

    //  Create group ...
    const groupAttributes = {
      width: 100,
      height: 100,
      coordSizeWidth: 100,
      coordSizeHeight: 100,
    };
    const group = new Group(groupAttributes);
    group.append(innerShape);

    // Add Text ...
    if (this.getShapeType() !== TopicShape.IMAGE) {
      const textShape = this._buildTextShape(true);
      const text = this.getText();
      textShape.setText(text);
      textShape.setOpacity(0.5);
      group.append(textShape);
    }
    return group;
  }

  /** */
  updateTopicShape(targetTopic, workspace) {
    // Change figure based on the connected topic ...
    const model = this.getModel();
    let shapeType = model.getShapeType();
    if (!targetTopic.isCentralTopic()) {
      if (!$defined(shapeType)) {
        // Get the real shape type ...
        shapeType = this.getShapeType();
        this._setShapeType(shapeType, false);
      }
    }
  }

  /** */
  disconnect(workspace) {
    super.disconnect(workspace);
    const size = this.getSize();

    const model = this.getModel();
    let shapeType = model.getShapeType();
    if (!$defined(shapeType)) {
      // Change figure ...
      shapeType = this.getShapeType();
      this._setShapeType(TopicShape.ROUNDED_RECT, false);
    }
    const innerShape = this.getInnerShape();
    innerShape.setVisibility(true);
  }

  _updatePositionOnChangeSize(oldSize, newSize) {
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

  /** */
  workoutIncomingConnectionPoint(sourcePosition) {
    return Shape.workoutIncomingConnectionPoint(this, sourcePosition);
  }

  /** */
  workoutOutgoingConnectionPoint(targetPosition) {
    $assert(targetPosition, 'targetPoint can not be null');
    const pos = this.getPosition();
    const isAtRight = Shape.isAtRight(targetPosition, pos);
    const size = this.getSize();

    let result;
    if (this.getShapeType() === TopicShape.LINE) {
      result = new Point();
      const groupPosition = this._elem2d.getPosition();
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
      result = Shape.calculateRectConnectionPoint(pos, size, isAtRight, true);
    }
    return result;
  }
}

export default MainTopic;
