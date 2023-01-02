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
import { $msg } from './Messages';
import { TopicShapeType } from './model/INodeModel';
import Topic from './Topic';

type FontStlye = {
  font: string;
  size: number;
  style: string;
  weight: string;
  color: string;
};

type TopicStyleType = {
  borderColor: string;
  backgroundColor: string;
  connectionStyle: LineType;
  connectionColor: string;
  fontStyle: FontStlye;
  msgKey: string;
  shapeType: TopicShapeType;
};

const TopicDefaultStyles = {
  CENTRAL_TOPIC: {
    borderColor: 'rgb(57,113,177)',
    backgroundColor: 'rgb(80,157,192)',
    fontStyle: {
      font: 'Verdana',
      size: 10,
      style: 'normal',
      weight: 'bold',
      color: '#ffffff',
    },
    connectionStyle: LineType.THICK_CURVED,
    connectionColor: '#495879',
    msgKey: 'CENTRAL_TOPIC',
    shapeType: 'rounded rectangle' as TopicShapeType,
  },
  MAIN_TOPIC: {
    borderColor: 'rgb(2,59,185)',
    backgroundColor: 'rgb(224,229,239)',
    fontStyle: {
      font: 'Arial',
      size: 8,
      style: 'normal',
      weight: 'normal',
      color: 'rgb(82,92,97)',
    },
    connectionStyle: LineType.THICK_CURVED,
    connectionColor: '#495879',
    msgKey: 'MAIN_TOPIC',
    shapeType: 'line' as TopicShapeType,
  },
  SUB_TOPIC: {
    borderColor: 'rgb(2,59,185)',
    backgroundColor: 'rgb(224,229,239)',
    fontStyle: {
      font: 'Arial',
      size: 6,
      style: 'normal',
      weight: 'normal',
      color: 'rgb(82,92,97)',
    },
    connectionStyle: LineType.THICK_CURVED,
    connectionColor: '#495879',
    msgKey: 'SUB_TOPIC',
    shapeType: 'line' as TopicShapeType,
  },

  ISOLATED_TOPIC: {
    borderColor: 'rgb(2,59,185)',
    backgroundColor: 'rgb(224,229,239)',
    fontStyle: {
      font: 'Verdana',
      size: 8,
      style: 'normal',
      weight: 'normal',
      color: 'rgb(82,92,97)',
    },
    msgKey: 'ISOLATED_TOPIC',
    connectionStyle: LineType.THIN_CURVED,
    connectionColor: '#495879',
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

  static defaultFontStyle(topic: Topic): FontStlye {
    return this._getStyles(topic).fontStyle;
  }

  static defaultBackgroundColor(topic: Topic): string {
    return this._getStyles(topic).backgroundColor;
  }

  static defaultBorderColor(topic: Topic): string {
    return this._getStyles(topic).borderColor;
  }

  static getInnerPadding(topic: Topic): number {
    return Math.round(topic.getOrBuildTextShape().getFontHeight() * 0.5);
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
