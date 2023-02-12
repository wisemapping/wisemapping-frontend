/*
 *    Copyright [2011] [wisemapping]
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
import { LineType } from './ConnectionLine';
import { FontStyleType } from './FontStyleType';
import { FontWeightType } from './FontWeightType';
import { $msg } from './Messages';
import { TopicShapeType } from './model/INodeModel';
import ColorUtil from './render/ColorUtil';
import Topic from './Topic';

type FontStyle = {
  font: string;
  size: number;
  style: FontStyleType;
  weight: FontWeightType;
  color: string;
};

type TopicStyleType = {
  borderColor: string;
  backgroundColor: string;
  connectionStyle: LineType;
  connectionColor: string;
  fontStyle: FontStyle;
  msgKey: string;
  shapeType: TopicShapeType;
};

const TopicDefaultStyles = {
  CENTRAL_TOPIC: {
    borderColor: '#3971B1',
    backgroundColor: '#509DC0',
    fontStyle: {
      font: 'Verdana',
      size: 10,
      style: 'normal' as FontStyleType,
      weight: 'bold' as FontWeightType,
      color: '#ffffff',
    },
    connectionStyle: LineType.THICK_CURVED,
    connectionColor: '#345780',
    msgKey: 'CENTRAL_TOPIC',
    shapeType: 'rounded rectangle' as TopicShapeType,
  },
  MAIN_TOPIC: {
    borderColor: '#023BB9',
    backgroundColor: '#E0E5EF',
    fontStyle: {
      font: 'Verdana',
      size: 8,
      style: 'normal' as FontStyleType,
      weight: 'normal' as FontWeightType,
      color: '#525C61',
    },
    connectionStyle: LineType.ARC,
    connectionColor: '#345780',
    msgKey: 'MAIN_TOPIC',
    shapeType: 'line' as TopicShapeType,
  },
  SUB_TOPIC: {
    borderColor: '#96e3ff',
    backgroundColor: '#96e3ff',
    fontStyle: {
      font: 'Verdana',
      size: 8,
      style: 'normal' as FontStyleType,
      weight: 'normal' as FontWeightType,
      color: '#525C61',
    },
    connectionStyle: LineType.ARC,
    connectionColor: '#345780',
    msgKey: 'SUB_TOPIC',
    shapeType: 'line' as TopicShapeType,
  },

  ISOLATED_TOPIC: {
    borderColor: '#023BB9',
    backgroundColor: '#96e3ff',
    fontStyle: {
      font: 'Verdana',
      size: 8,
      style: 'normal' as FontStyleType,
      weight: 'normal' as FontWeightType,
      color: '#525C61',
    },
    msgKey: 'ISOLATED_TOPIC',
    connectionStyle: LineType.THICK_CURVED,
    connectionColor: '#345780',
    shapeType: 'line' as TopicShapeType,
  },
};

class TopicStyle {
  static _getStyles(topic: Topic): TopicStyleType {
    $assert(topic, 'topic can not be null');

    let result: TopicStyleType;
    if (topic.isCentralTopic()) {
      result = TopicDefaultStyles.CENTRAL_TOPIC;
    } else {
      const targetTopic = topic.getOutgoingConnectedTopic();
      if (targetTopic) {
        if (targetTopic.isCentralTopic()) {
          result = TopicDefaultStyles.MAIN_TOPIC;
        } else {
          result = TopicDefaultStyles.SUB_TOPIC;
        }
      } else {
        result = TopicDefaultStyles.ISOLATED_TOPIC;
      }
    }
    return result;
  }

  static defaultText(topic: Topic): string {
    const { msgKey } = this._getStyles(topic);
    return $msg(msgKey);
  }

  static defaultFontStyle(topic: Topic): FontStyle {
    return this._getStyles(topic).fontStyle;
  }

  static defaultCanvasCssStyle(): string {
    return `position: relative;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
      overflow: hidden;
      opacity: 1;
      background-color: #f2f2f2;
      background-image: linear-gradient(#ebe9e7 1px, transparent 1px),
      linear-gradient(to right, #ebe9e7 1px, #f2f2f2 1px);
      background-size: 50px 50px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;`;
  }

  static defaultOuterBorderColor(topic: Topic): string {
    let result: string;
    if (topic.getShapeType() === 'line') {
      result = '#F4B82D';
    } else {
      const innerBorderColor = topic.getBorderColor();
      result = ColorUtil.lightenColor(innerBorderColor, 70);
    }
    return result;
  }

  static defaultOuterBackgroundColor(topic: Topic, onFocus: boolean): string {
    let result: string;
    if (topic.getShapeType() === 'line') {
      result = onFocus ? '#F4B82D' : '#FCEBC0';
    } else {
      const innerBgColor = topic.getBackgroundColor();
      result = ColorUtil.lightenColor(innerBgColor, 70);
    }
    return result;
  }

  static defaultBackgroundColor(topic: Topic): string {
    return this._getStyles(topic).backgroundColor;
  }

  static defaultBorderColor(topic: Topic): string {
    return this._getStyles(topic).borderColor;
  }

  static getInnerPadding(topic: Topic): number {
    return topic.getOrBuildTextShape().getFontHeight() * 0.5;
  }

  static defaultShapeType(topic: Topic): TopicShapeType {
    return this._getStyles(topic).shapeType;
  }

  static defaultConnectionType(topic: Topic): LineType {
    return this._getStyles(topic).connectionStyle;
  }

  static defaultConnectionColor(topic: Topic): string {
    return this._getStyles(topic).connectionColor;
  }
}

export default TopicStyle;
