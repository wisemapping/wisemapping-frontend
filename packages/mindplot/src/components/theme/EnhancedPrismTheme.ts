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

class EnhancedPrismTheme extends DefaultTheme {
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

  getConnectionColor(topic: Topic): string {
    const isDark = this._variant === 'dark';
    let result: string | null = null;

    // Color of the node is the connection is the color of the parent ...
    const parent = topic.getParent();
    if (parent && !parent.isCentralTopic()) {
      result = this.resolve('connectionColor', parent, false) as string;
    }

    if (!result) {
      if (isDark) {
        // For dark mode, use darker connection colors that match the background colors
        const darkConnectionColors = [
          '#6B46C1', // Purple
          '#BE185D', // Pink
          '#DC2626', // Red
          '#D97706', // Orange
          '#CA8A04', // Yellow
          '#65A30D', // Green
          '#059669', // Emerald
          '#0891B2', // Cyan
          '#2563EB', // Blue
          '#4F46E5', // Indigo
        ];
        const order = topic.getOrder() || 0;
        result = darkConnectionColors[order % darkConnectionColors.length];
      } else {
        // For light mode, use original connection colors
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
    const isDark = this._variant === 'dark';
    const model = topic.getModel();
    let result = model.getBorderColor();

    // If border color has not been defined, use the connection color for the border ...
    if (!result) {
      if (isDark) {
        // For dark mode, use darker border colors that match the background colors
        const darkBorderColors = [
          '#6B46C1', // Purple
          '#BE185D', // Pink
          '#DC2626', // Red
          '#D97706', // Orange
          '#CA8A04', // Yellow
          '#65A30D', // Green
          '#059669', // Emerald
          '#0891B2', // Cyan
          '#2563EB', // Blue
          '#4F46E5', // Indigo
        ];
        const order = topic.getOrder() || 0;
        result = darkBorderColors[order % darkBorderColors.length];
      } else {
        // For light mode, use original border colors
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
        // Main topics in dark mode - use darker, more muted colors
        const darkColors = [
          '#6B46C1', // Purple
          '#BE185D', // Pink
          '#DC2626', // Red
          '#D97706', // Orange
          '#CA8A04', // Yellow
          '#65A30D', // Green
          '#059669', // Emerald
          '#0891B2', // Cyan
          '#2563EB', // Blue
          '#4F46E5', // Indigo
        ];
        const order = topic.getOrder() || 0;
        result = darkColors[order % darkColors.length];
      }
    } else if (topic.isCentralTopic()) {
      // Central topic in light mode - use a soft color
      result = '#E8F4FD'; // Light blue
    } else {
      // Main topics in light mode - use lighter, more muted colors
      const lightColors = [
        '#E8E2F3', // Light purple
        '#FCE4EC', // Light pink
        '#FFEBEE', // Light red
        '#FFF3E0', // Light orange
        '#FFFDE7', // Light yellow
        '#F1F8E9', // Light green
        '#E0F2F1', // Light teal
        '#E0F7FA', // Light cyan
        '#E3F2FD', // Light blue
        '#F3E5F5', // Light indigo
      ];
      const order = topic.getOrder() || 0;
      result = lightColors[order % lightColors.length];
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
      // For light mode, use dark text for good contrast on light backgrounds
      result = '#2D3748'; // Dark gray text for better readability
    }

    return result;
  }
}

export default EnhancedPrismTheme;
