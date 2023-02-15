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

import { TopicShapeType } from '../model/INodeModel';
import Topic from '../Topic';
import LineTopicShape from './LineTopicShape';
import NoneTopicShape from './NoneTopicShape';
import RectTopicShape from './RectTopicShape';
import TopicShape from './TopicShape';

class TopicShapeFactory {
  static create(value: TopicShapeType, topic: Topic): TopicShape {
    let result: TopicShape;
    switch (value) {
      case 'rectangle':
        result = new RectTopicShape(0, value);
        break;
      case 'elipse':
        result = new RectTopicShape(0.9, value);
        break;
      case 'rounded rectangle':
        result = new RectTopicShape(0.6, value);
        break;
      case 'line':
        result = new LineTopicShape(topic.getBorderColor());
        break;
      case 'none':
        result = new NoneTopicShape();
        break;
      case 'image':
        result = new NoneTopicShape();
        break;
      default: {
        const exhaustiveCheck: never = value;
        throw new Error(exhaustiveCheck);
      }
    }
    result.setPosition(0, 0);
    return result;
  }
}

export default TopicShapeFactory;
