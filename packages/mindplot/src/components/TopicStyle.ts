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
import { $msg } from './Messages';
import { TopicShape } from './model/INodeModel';
import Topic from './Topic';

type TopicStyleType = {
  borderColor: string;
  backgroundColor: string;
  fontStyle: {
    font: string;
    size: number;
    style: string;
    weight: string;
    color: string;
  };
  msgKey: string;
  shapeType: string;
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
    msgKey: 'CENTRAL_TOPIC',
    shapeType: TopicShape.ROUNDED_RECT,
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
    msgKey: 'MAIN_TOPIC',
    shapeType: TopicShape.LINE,
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
    msgKey: 'SUB_TOPIC',
    shapeType: TopicShape.LINE,
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
    shapeType: TopicShape.LINE,
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

  static defaultText(topic: Topic) {
    const { msgKey } = this._getStyles(topic);
    return $msg(msgKey);
  }

  static defaultFontStyle(topic: Topic) {
    return this._getStyles(topic).fontStyle;
  }

  static defaultBackgroundColor(topic: Topic) {
    return this._getStyles(topic).backgroundColor;
  }

  static defaultBorderColor(topic: Topic) {
    return this._getStyles(topic).borderColor;
  }

  static getInnerPadding(topic: Topic) {
    return Math.round(topic.getTextShape().getFontHeight() * 0.5);
  }

  static defaultShapeType(topic) {
    return this._getStyles(topic).shapeType;
  }
}

export default TopicStyle;
