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

import { LineType } from '../ConnectionLine';
import { FontStyleType } from '../FontStyleType';
import { FontWeightType } from '../FontWeightType';
import { TopicShapeType } from '../model/INodeModel';
import { TopicType, ThemeVariant } from './Theme';
import type { BackgroundPatternType } from '../model/CanvasStyleType';

// Import JSON files
import prismDefault from './styles/prism-default.json';
import prismLight from './styles/prism-light.json';
import prismDark from './styles/prism-dark.json';
import classicDefault from './styles/classic-default.json';
import classicLight from './styles/classic-light.json';
import classicDark from './styles/classic-dark.json';
import robotDefault from './styles/robot-default.json';
import robotLight from './styles/robot-light.json';
import robotDark from './styles/robot-dark.json';
import sunriseDefault from './styles/sunrise-default.json';
import sunriseLight from './styles/sunrise-light.json';
import sunriseDark from './styles/sunrise-dark.json';
import oceanDefault from './styles/ocean-default.json';
import oceanLight from './styles/ocean-light.json';
import oceanDark from './styles/ocean-dark.json';
import auroraDefault from './styles/aurora-default.json';
import auroraLight from './styles/aurora-light.json';
import auroraDark from './styles/aurora-dark.json';

export type TopicStyleType = {
  borderColor: string | string[];
  borderStyle: string;
  backgroundColor: string | string[];
  connectionColor: string | string[];
  connectionStyle: LineType;
  fontFamily: string;
  fontSize: number;
  fontStyle: FontStyleType;
  fontWeight: FontWeightType;
  fontColor: string;
  msgKey: string;
  shapeType: TopicShapeType;
  outerBackgroundColor: string;
  outerBorderColor: string;
};

export type CanvasStyleType = {
  backgroundColor: string;
  gridColor?: string;
  opacity?: number;
  showGrid?: boolean;
  gridPattern?: BackgroundPatternType;
};

type JsonTopicStyleType = {
  borderColor?: string | string[];
  borderStyle?: string;
  backgroundColor?: string | string[];
  connectionColor?: string | string[];
  connectionStyle?: string;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: string;
  fontWeight?: string;
  fontColor?: string;
  msgKey?: string;
  shapeType?: string;
  outerBackgroundColor?: string;
  outerBorderColor?: string;
};

type JsonCanvasStyleType = {
  backgroundColor?: string;
  gridColor?: string;
  opacity?: number;
  showGrid?: boolean;
  gridPattern?: BackgroundPatternType;
};

type JsonThemeStyles = {
  [key in TopicType]?: JsonTopicStyleType;
} & {
  Canvas?: JsonCanvasStyleType;
};

/**
 * ThemeStyle class responsible for loading JSON style files and merging them based on variant
 */
export class ThemeStyle {
  private _mergedStyles: Map<TopicType, TopicStyleType>;

  private _canvasStyle: CanvasStyleType;

  constructor(themeName: string, variant: ThemeVariant) {
    const { topicStyles, canvasStyle } = this.loadAndMergeStyles(themeName, variant);
    this._mergedStyles = topicStyles;
    this._canvasStyle = canvasStyle;
  }

  /**
   * Get the merged styles for a specific topic type
   */
  getStyles(topicType: TopicType): TopicStyleType {
    const styles = this._mergedStyles.get(topicType);
    if (!styles) {
      throw new Error(`No styles found for topic type: ${topicType}`);
    }
    return styles;
  }

  /**
   * Get all merged styles
   */
  getAllStyles(): Map<TopicType, TopicStyleType> {
    return this._mergedStyles;
  }

  /**
   * Get canvas styles
   */
  getCanvasStyle(): CanvasStyleType {
    return this._canvasStyle;
  }

  /**
   * Load and merge styles from JSON files
   */
  private loadAndMergeStyles(
    themeName: string,
    variant: ThemeVariant,
  ): { topicStyles: Map<TopicType, TopicStyleType>; canvasStyle: CanvasStyleType } {
    // Load default styles
    const defaultStyles = this.loadJsonStyles(`${themeName}-default.json`);

    // Load light mode overrides (always apply these first)
    const lightStyles = this.loadJsonStyles(`${themeName}-light.json`);

    // Load variant-specific styles (dark mode overrides)
    const variantStyles = this.loadJsonStyles(`${themeName}-${variant}.json`);

    // Merge topic styles: default -> light -> variant
    const mergedLight = this.mergeStyles(defaultStyles, lightStyles);
    const topicStyles = this.mergeStylesFromMap(mergedLight, variantStyles);

    // Merge canvas styles: default -> light -> variant
    const canvasStyle = this.mergeCanvasStyles(defaultStyles, lightStyles, variantStyles);

    return { topicStyles, canvasStyle };
  }

  /**
   * Load styles from JSON file
   */
  private loadJsonStyles(filename: string): JsonThemeStyles {
    try {
      return this.loadStylesByFilename(filename);
    } catch (error) {
      console.warn(`Failed to load styles from ${filename}:`, error);
      return {};
    }
  }

  /**
   * Load styles by filename using imported JSON files
   */
  private loadStylesByFilename(filename: string): JsonThemeStyles {
    switch (filename) {
      case 'prism-default.json':
        return prismDefault as JsonThemeStyles;
      case 'prism-light.json':
        return prismLight as JsonThemeStyles;
      case 'prism-dark.json':
        return prismDark as JsonThemeStyles;
      case 'classic-default.json':
        return classicDefault as JsonThemeStyles;
      case 'classic-light.json':
        return classicLight as JsonThemeStyles;
      case 'classic-dark.json':
        return classicDark as JsonThemeStyles;
      case 'robot-default.json':
        return robotDefault as JsonThemeStyles;
      case 'robot-light.json':
        return robotLight as JsonThemeStyles;
      case 'robot-dark.json':
        return robotDark as JsonThemeStyles;
      case 'sunrise-default.json':
        return sunriseDefault as JsonThemeStyles;
      case 'sunrise-light.json':
        return sunriseLight as JsonThemeStyles;
      case 'sunrise-dark.json':
        return sunriseDark as JsonThemeStyles;
      case 'ocean-default.json':
        return oceanDefault as JsonThemeStyles;
      case 'ocean-light.json':
        return oceanLight as JsonThemeStyles;
      case 'ocean-dark.json':
        return oceanDark as JsonThemeStyles;
      case 'aurora-default.json':
        return auroraDefault as JsonThemeStyles;
      case 'aurora-light.json':
        return auroraLight as JsonThemeStyles;
      case 'aurora-dark.json':
        return auroraDark as JsonThemeStyles;
      default:
        console.warn(`Unknown style file: ${filename}`);
        return {};
    }
  }

  /**
   * Merge default styles with variant-specific overrides
   */
  private mergeStyles(
    defaultStyles: JsonThemeStyles,
    variantStyles: JsonThemeStyles,
  ): Map<TopicType, TopicStyleType> {
    const result = new Map<TopicType, TopicStyleType>();

    // Process each topic type
    const topicTypes: TopicType[] = ['CentralTopic', 'MainTopic', 'SubTopic', 'IsolatedTopic'];

    topicTypes.forEach((topicType) => {
      const defaultStyle = defaultStyles[topicType];
      const variantStyle = variantStyles[topicType];

      if (!defaultStyle) {
        throw new Error(`Default styles not found for topic type: ${topicType}`);
      }

      // Merge default with variant overrides
      const defaultConverted = this.convertJsonToTopicStyle(defaultStyle);
      const variantConverted = variantStyle ? this.convertJsonToTopicStyle(variantStyle) : {};

      const mergedStyle: TopicStyleType = {
        ...defaultConverted,
        ...variantConverted,
      } as TopicStyleType;

      result.set(topicType, mergedStyle);
    });

    return result;
  }

  /**
   * Merge Map styles with variant-specific overrides
   */
  private mergeStylesFromMap(
    baseStyles: Map<TopicType, TopicStyleType>,
    variantStyles: JsonThemeStyles,
  ): Map<TopicType, TopicStyleType> {
    const result = new Map<TopicType, TopicStyleType>();

    // Process each topic type
    const topicTypes: TopicType[] = ['CentralTopic', 'MainTopic', 'SubTopic', 'IsolatedTopic'];

    topicTypes.forEach((topicType) => {
      const baseStyle = baseStyles.get(topicType);
      const variantStyle = variantStyles[topicType];

      if (!baseStyle) {
        throw new Error(`Base styles not found for topic type: ${topicType}`);
      }

      // Merge base with variant overrides
      const variantConverted = variantStyle ? this.convertJsonToTopicStyle(variantStyle) : {};

      const mergedStyle: TopicStyleType = {
        ...baseStyle,
        ...variantConverted,
      } as TopicStyleType;

      result.set(topicType, mergedStyle);
    });

    return result;
  }

  /**
   * Merge canvas styles from default, light, and variant
   */
  private mergeCanvasStyles(
    defaultStyles: JsonThemeStyles,
    lightStyles: JsonThemeStyles,
    variantStyles: JsonThemeStyles,
  ): CanvasStyleType {
    const defaultCanvas = defaultStyles.Canvas || {};
    const lightCanvas = lightStyles.Canvas || {};
    const variantCanvas = variantStyles.Canvas || {};

    // Merge: default -> light -> variant
    let opacity = 1;
    if (variantCanvas.opacity !== undefined) {
      opacity = variantCanvas.opacity;
    } else if (lightCanvas.opacity !== undefined) {
      opacity = lightCanvas.opacity;
    } else if (defaultCanvas.opacity !== undefined) {
      opacity = defaultCanvas.opacity;
    }

    let showGrid = true;
    if (variantCanvas.showGrid !== undefined) {
      showGrid = variantCanvas.showGrid;
    } else if (lightCanvas.showGrid !== undefined) {
      showGrid = lightCanvas.showGrid;
    } else if (defaultCanvas.showGrid !== undefined) {
      showGrid = defaultCanvas.showGrid;
    }

    let gridPattern: BackgroundPatternType | undefined;
    if (variantCanvas.gridPattern) {
      gridPattern = variantCanvas.gridPattern;
    } else if (lightCanvas.gridPattern) {
      gridPattern = lightCanvas.gridPattern;
    } else if (defaultCanvas.gridPattern) {
      gridPattern = defaultCanvas.gridPattern;
    }

    const merged: CanvasStyleType = {
      backgroundColor:
        variantCanvas.backgroundColor ||
        lightCanvas.backgroundColor ||
        defaultCanvas.backgroundColor ||
        '#f2f2f2',
      gridColor: variantCanvas.gridColor || lightCanvas.gridColor || defaultCanvas.gridColor,
      opacity,
      showGrid,
      gridPattern,
    };

    return merged;
  }

  /**
   * Convert JSON style object to TopicStyleType
   */
  private convertJsonToTopicStyle(jsonStyle: JsonTopicStyleType): Partial<TopicStyleType> {
    const result: Partial<TopicStyleType> = {};

    if (jsonStyle.borderColor !== undefined) result.borderColor = jsonStyle.borderColor;
    if (jsonStyle.borderStyle !== undefined) result.borderStyle = jsonStyle.borderStyle;
    if (jsonStyle.backgroundColor !== undefined) result.backgroundColor = jsonStyle.backgroundColor;
    if (jsonStyle.connectionColor !== undefined) result.connectionColor = jsonStyle.connectionColor;
    if (jsonStyle.connectionStyle !== undefined) {
      result.connectionStyle = this.convertStringToLineType(jsonStyle.connectionStyle);
    }
    if (jsonStyle.fontFamily !== undefined) result.fontFamily = jsonStyle.fontFamily;
    if (jsonStyle.fontSize !== undefined) result.fontSize = jsonStyle.fontSize;
    if (jsonStyle.fontStyle !== undefined) result.fontStyle = jsonStyle.fontStyle as FontStyleType;
    if (jsonStyle.fontWeight !== undefined) {
      result.fontWeight = jsonStyle.fontWeight as FontWeightType;
    }
    if (jsonStyle.fontColor !== undefined) result.fontColor = jsonStyle.fontColor;
    if (jsonStyle.msgKey !== undefined) result.msgKey = jsonStyle.msgKey;
    if (jsonStyle.shapeType !== undefined) result.shapeType = jsonStyle.shapeType as TopicShapeType;
    if (jsonStyle.outerBackgroundColor !== undefined) {
      result.outerBackgroundColor = jsonStyle.outerBackgroundColor;
    }
    if (jsonStyle.outerBorderColor !== undefined) {
      result.outerBorderColor = jsonStyle.outerBorderColor;
    }

    return result;
  }

  /**
   * Convert string connection style to LineType enum
   */
  private convertStringToLineType(connectionStyle: string): LineType {
    switch (connectionStyle) {
      case 'THIN_CURVED':
        return LineType.THIN_CURVED;
      case 'POLYLINE_MIDDLE':
        return LineType.POLYLINE_MIDDLE;
      case 'POLYLINE_CURVED':
        return LineType.POLYLINE_CURVED;
      case 'THICK_CURVED':
        return LineType.THICK_CURVED;
      case 'ARC':
        return LineType.ARC;
      default:
        throw new Error(`Unknown connection style: ${connectionStyle}`);
    }
  }
}
