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
import { LineType } from '../ConnectionLine';
import { FontStyleType } from '../FontStyleType';
import { FontWeightType } from '../FontWeightType';
import { TopicShapeType } from '../model/INodeModel';
import Topic from '../Topic';
import DefaultTheme, { TopicStyleType } from './DefaultTheme';
import { TopicType } from './Theme';

const defaultStyles = new Map<TopicType, TopicStyleType>([
  [
    'CentralTopic',
    {
      msgKey: 'CENTRAL_TOPIC',
      borderColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Verdana',
      fontSize: 10,
      fontStyle: 'normal' as FontStyleType,
      fontWeight: 'bold' as FontWeightType,
      fontColor: '#000000',
      connectionStyle: LineType.ARC,
      connectionColor: '#345780',
      shapeType: 'rounded rectangle' as TopicShapeType,
      outerBackgroundColor: '#F4B82D',
      outerBorderColor: '#F4B82D',
    },
  ],
  [
    'MainTopic',
    {
      msgKey: 'MAIN_TOPIC',
      borderColor: [
        '#9B7BEB',
        '#E5628C',
        '#EB5130',
        '#F3AE3D',
        '#F8D651',
        '#A5D945',
        '#6BC953',
        '#6AD6D7',
        '#4CA6F7',
        '#4B6FF6',
      ],
      backgroundColor: [
        '#9B7BEB',
        '#E5628C',
        '#EB5130',
        '#F3AE3D',
        '#F8D651',
        '#A5D945',
        '#6BC953',
        '#6AD6D7',
        '#4CA6F7',
        '#4B6FF6',
      ],
      connectionColor: [
        '#9B7BEB',
        '#E5628C',
        '#EB5130',
        '#F3AE3D',
        '#F8D651',
        '#A5D945',
        '#6BC953',
        '#6AD6D7',
        '#4CA6F7',
        '#4B6FF6',
      ],
      fontFamily: 'Verdana',
      fontSize: 9,
      fontStyle: 'normal' as FontStyleType,
      fontWeight: 'normal' as FontWeightType,
      fontColor: '#000000',
      connectionStyle: LineType.ARC,
      shapeType: 'rounded rectangle' as TopicShapeType,
      outerBackgroundColor: '#F4B82D',
      outerBorderColor: '#F4B82D',
    },
  ],
  [
    'SubTopic',
    {
      msgKey: 'SUB_TOPIC',
      borderColor: '#96e3ff',
      backgroundColor: '#96e3ff',
      fontFamily: 'Verdana',
      fontSize: 8,
      fontStyle: 'normal' as FontStyleType,
      fontWeight: 'normal' as FontWeightType,
      fontColor: '#000000',
      connectionStyle: LineType.THICK_CURVED,
      connectionColor: '#345780',
      shapeType: 'line' as TopicShapeType,
      outerBackgroundColor: '#F4B82D',
      outerBorderColor: '#F4B82D',
    },
  ],
  [
    'IsolatedTopic',
    {
      msgKey: 'ISOLATED_TOPIC',
      borderColor: '#023BB9',
      backgroundColor: '#96e3ff',
      fontFamily: 'Verdana',
      fontSize: 8,
      fontStyle: 'normal' as FontStyleType,
      fontWeight: 'normal' as FontWeightType,
      fontColor: '#000000',
      connectionStyle: LineType.THICK_CURVED,
      connectionColor: '#345780',
      shapeType: 'line' as TopicShapeType,
      outerBackgroundColor: '#F4B82D',
      outerBorderColor: '#F4B82D',
    },
  ],
]);

class PrismTheme extends DefaultTheme {
  constructor() {
    super(defaultStyles);
  }

  getCanvasCssStyle(): string {
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

  getConnectionColor(topic: Topic): string {
    const model = topic.getModel();
    let result: string | undefined = model.getConnectionColor();

    if (!result) {
      let colors: string[] = [];
      colors = colors.concat(this.resolve('connectionColor', topic) as string[] | string);

      // if the element is an array, use topic order to decide color ..
      let order = topic.getOrder();
      order = order || 0;

      const index = order % colors.length;
      result = colors[index];
    }
    return result!;
  }

  getBorderColor(topic: Topic): string {
    const model = topic.getModel();
    let result = model.getBorderColor();

    // If the the style is a line, the color is alward the connection one.

    // If border color has not been defined, use the connection color for the border ...
    if (!result) {
      if (topic.getShapeType() === 'line') {
        result = 'none';
      } else {
        let colors: string[] = [];
        colors = colors.concat(this.resolve('borderColor', topic) as string[] | string);

        // if the element is an array, use topic order to decide color ..
        let order = topic.getOrder();
        order = order || 0;

        const index = order % colors.length;
        result = colors[index];
      }
    }
    return result;
  }
}

export default PrismTheme;
