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
import { TopicType, ThemeVariant } from './Theme';

const defaultStyles = new Map<TopicType, TopicStyleType>([
  [
    'CentralTopic',
    {
      msgKey: 'CENTRAL_TOPIC',
      borderColor: '#3971B1',
      backgroundColor: '#509DC0',
      fontFamily: 'Verdana',
      fontSize: 10,
      fontStyle: 'normal' as FontStyleType,
      fontWeight: 'bold' as FontWeightType,
      fontColor: '#ffffff',
      connectionStyle: LineType.THICK_CURVED,
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
      borderColor: '#023BB9',
      backgroundColor: '#E0E5EF',
      fontFamily: 'Verdana',
      fontSize: 9,
      fontStyle: 'normal' as FontStyleType,
      fontWeight: 'normal' as FontWeightType,
      fontColor: '#525C61',
      connectionStyle: LineType.THICK_CURVED,
      connectionColor: '#345780',
      shapeType: 'line' as TopicShapeType,
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
      fontColor: '#525C61',
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
      fontColor: '#525C61',
      connectionStyle: LineType.THICK_CURVED,
      connectionColor: '#345780',
      shapeType: 'line' as TopicShapeType,
      outerBackgroundColor: '#F4B82D',
      outerBorderColor: '#F4B82D',
    },
  ],
]);

class ClassicTheme extends DefaultTheme {
  constructor(variant: ThemeVariant) {
    super(defaultStyles, variant);
  }

  getCanvasCssStyle(): string {
    const isDark = this._variant === 'dark';
    const backgroundColor = isDark ? '#1a1a1a' : '#f2f2f2';
    const gridColor = isDark ? '#333333' : '#ebe9e7';

    return `position: relative;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
      overflow: hidden;
      opacity: 1;
      background-color: ${backgroundColor};
      background-image: linear-gradient(${gridColor} 1px, transparent 1px),
      linear-gradient(to right, ${gridColor} 1px, ${backgroundColor} 1px);
      background-size: 50px 50px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;`;
  }

  getBackgroundColor(topic: Topic): string {
    const isDark = this._variant === 'dark';
    const model = topic.getModel();
    let result = model.getBackgroundColor();

    // If topic has a custom background color, always use it
    if (result) {
      return result;
    }

    // For dark mode, use enhanced colors
    if (isDark) {
      if (topic.isCentralTopic()) {
        // Central topic in dark mode - use a light color for contrast
        result = '#F4B82D';
      } else {
        // Main topics in dark mode - use classic blue tones
        const darkColors = [
          '#1E40AF', // Blue
          '#1E3A8A', // Dark Blue
          '#3730A3', // Indigo
          '#581C87', // Purple
          '#7C2D12', // Red
          '#92400E', // Orange
          '#A16207', // Yellow
          '#365314', // Green
          '#0F766E', // Teal
          '#155E75', // Cyan
        ];
        const order = topic.getOrder() || 0;
        result = darkColors[order % darkColors.length];
      }
    } else {
      // For light mode, always use original theme colors
      result = this.resolve('backgroundColor', topic) as string;
    }

    return result;
  }

  getFontColor(topic: Topic): string {
    const isDark = this._variant === 'dark';
    const model = topic.getModel();
    let result = model.getFontColor();

    // If topic has a custom font color, always use it
    if (result) {
      return result;
    }

    // For dark mode, use enhanced font colors
    if (isDark) {
      if (topic.isCentralTopic()) {
        result = '#000000'; // Black text on light central topic
      } else {
        result = '#FFFFFF'; // White text on colored topics
      }
    } else {
      // For light mode, always use original theme colors
      result = this.resolve('fontColor', topic) as string;
    }

    return result;
  }
}

export default ClassicTheme;
