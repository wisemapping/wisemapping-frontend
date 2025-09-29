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
      fontColor: '#FFFFFF',
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
      fontColor: '#FFFFFF',
      connectionStyle: LineType.ARC,
      connectionColor: '#345780',
      shapeType: 'none' as TopicShapeType,
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
      connectionStyle: LineType.ARC,
      connectionColor: '#345780',
      shapeType: 'line' as TopicShapeType,
      outerBackgroundColor: '#F4B82D',
      outerBorderColor: '#F4B82D',
    },
  ],
]);

class DarkPrismTheme extends DefaultTheme {
  constructor(variant: ThemeVariant) {
    super(defaultStyles, variant);
  }

  getCanvasCssStyle(): string {
    const isLight = this._variant === 'light';
    const backgroundColor = isLight ? '#f2f2f2' : '#1a1a1a';
    const gridColor = isLight ? '#ebe9e7' : '#333333';

    if (isLight) {
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
    return `position: relative;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
        overflow: hidden;
        opacity: 1;
        background-color: ${backgroundColor};
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;`;
  }

  getConnectionColor(topic: Topic): string {
    const isLight = this._variant === 'light';
    let result: string | null = null;

    // Color of the node is the connection is the color of the parent ...
    const parent = topic.getParent();
    if (parent && !parent.isCentralTopic()) {
      result = this.resolve('connectionColor', parent, false) as string;
    }

    if (!result) {
      if (isLight) {
        // For light mode, use bright connection colors that match the background colors
        const lightConnectionColors = [
          '#8B5CF6', // Purple
          '#EC4899', // Pink
          '#EF4444', // Red
          '#F59E0B', // Amber
          '#EAB308', // Yellow
          '#22C55E', // Green
          '#10B981', // Emerald
          '#06B6D4', // Cyan
          '#3B82F6', // Blue
          '#6366F1', // Indigo
        ];
        const order = topic.getOrder() || 0;
        result = lightConnectionColors[order % lightConnectionColors.length];
      } else {
        // For dark mode, use original connection colors
        let colors: string[] = [];
        colors = colors.concat(this.resolve('connectionColor', topic) as string[] | string);

        // if the element is an array, use topic order to decide color ..
        let order = topic.getOrder();
        order = order || 0;

        const index = order % colors.length;
        result = colors[index];
      }
    }
    return result!;
  }

  getBorderColor(topic: Topic): string {
    const isLight = this._variant === 'light';
    const model = topic.getModel();
    let result = model.getBorderColor();

    // If border color has not been defined, use the connection color for the border ...
    if (!result) {
      if (isLight) {
        // For light mode, use bright border colors that match the background colors
        const lightBorderColors = [
          '#8B5CF6', // Purple
          '#EC4899', // Pink
          '#EF4444', // Red
          '#F59E0B', // Amber
          '#EAB308', // Yellow
          '#22C55E', // Green
          '#10B981', // Emerald
          '#06B6D4', // Cyan
          '#3B82F6', // Blue
          '#6366F1', // Indigo
        ];
        const order = topic.getOrder() || 0;
        result = lightBorderColors[order % lightBorderColors.length];
      } else {
        // For dark mode, use original border colors
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

  getBackgroundColor(topic: Topic): string {
    const isLight = this._variant === 'light';
    const model = topic.getModel();
    let result = model.getBackgroundColor();

    // If topic has a custom background color, always use it
    if (result) {
      return result;
    }

    // For light mode, use enhanced colors (DarkPrism is dark by default)
    if (isLight) {
      if (topic.isCentralTopic()) {
        // Central topic in light mode - use a dark color for contrast
        result = '#1F2937';
      } else {
        // Main topics in light mode - use bright colors
        const lightColors = [
          '#8B5CF6', // Purple
          '#EC4899', // Pink
          '#EF4444', // Red
          '#F59E0B', // Amber
          '#EAB308', // Yellow
          '#22C55E', // Green
          '#10B981', // Emerald
          '#06B6D4', // Cyan
          '#3B82F6', // Blue
          '#6366F1', // Indigo
        ];
        const order = topic.getOrder() || 0;
        result = lightColors[order % lightColors.length];
      }
    } else {
      // For dark mode, always use original theme colors
      result = this.resolve('backgroundColor', topic) as string;
    }

    return result;
  }

  getFontColor(topic: Topic): string {
    const isLight = this._variant === 'light';
    const model = topic.getModel();
    let result = model.getFontColor();

    // If topic has a custom font color, always use it
    if (result) {
      return result;
    }

    // For light mode, use enhanced font colors (DarkPrism is dark by default)
    if (isLight) {
      if (topic.isCentralTopic()) {
        result = '#FFFFFF'; // White text on dark central topic
      } else {
        result = '#FFFFFF'; // White text on bright colored topics
      }
    } else {
      // For dark mode, always use original theme colors
      result = this.resolve('fontColor', topic) as string;
    }

    return result;
  }
}

export default DarkPrismTheme;
