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
import type { FontStyleType } from '../FontStyleType';
import type { FontWeightType } from '../FontWeightType';
import type { TopicShapeType } from '../model/INodeModel';
import type { TopicType, ThemeVariant } from './Theme';
import type { BackgroundPatternType } from '../model/CanvasStyleType';
import { isMsgKey, type MsgKey } from '../lang/en';
import {
  isBackgroundPatternType,
  isFontStyleType,
  isFontWeightType,
  isTopicShapeType,
} from '../persistence/TopicAttributeTypes';

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
import retroDefault from './styles/retro-default.json';
import retroLight from './styles/retro-light.json';
import retroDark from './styles/retro-dark.json';

/** The colours a theme picks from by topic order: never empty, which loading checks. */
export type Palette = readonly [string, ...string[]];

export type TopicStyleType = {
  borderColor: string | Palette;
  backgroundColor: string | Palette;
  connectionColor: string | Palette;
  connectionStyle: LineType;
  fontFamily: string;
  fontSize: number;
  fontStyle: FontStyleType;
  fontWeight: FontWeightType;
  fontColor: string;
  msgKey: MsgKey;
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
  gridPattern?: string;
};

type JsonThemeStyles = {
  [key in TopicType]?: JsonTopicStyleType;
} & {
  Canvas?: JsonCanvasStyleType;
};

/** The style files of the bundled themes, by file name. */
const STYLE_FILES: Record<string, JsonThemeStyles> = {
  'prism-default.json': prismDefault,
  'prism-light.json': prismLight,
  'prism-dark.json': prismDark,
  'classic-default.json': classicDefault,
  'classic-light.json': classicLight,
  'classic-dark.json': classicDark,
  'robot-default.json': robotDefault,
  'robot-light.json': robotLight,
  'robot-dark.json': robotDark,
  'sunrise-default.json': sunriseDefault,
  'sunrise-light.json': sunriseLight,
  'sunrise-dark.json': sunriseDark,
  'ocean-default.json': oceanDefault,
  'ocean-light.json': oceanLight,
  'ocean-dark.json': oceanDark,
  'aurora-default.json': auroraDefault,
  'aurora-light.json': auroraLight,
  'aurora-dark.json': auroraDark,
  'retro-default.json': retroDefault,
  'retro-light.json': retroLight,
  'retro-dark.json': retroDark,
};

const TOPIC_TYPES: TopicType[] = ['CentralTopic', 'MainTopic', 'SubTopic', 'IsolatedTopic'];

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
    const topicStyles = this.mergeStyles(themeName, defaultStyles, [lightStyles, variantStyles]);

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
    const styles = STYLE_FILES[filename];
    if (!styles) {
      console.warn(`Unknown style file: ${filename}`);
      return {};
    }
    return styles;
  }

  /**
   * Merge the default styles of each topic type with the overrides, in order
   */
  private mergeStyles(
    themeName: string,
    defaultStyles: JsonThemeStyles,
    overrides: JsonThemeStyles[],
  ): Map<TopicType, TopicStyleType> {
    const result = new Map<TopicType, TopicStyleType>();

    TOPIC_TYPES.forEach((topicType) => {
      const defaultStyle = defaultStyles[topicType];
      if (!defaultStyle) {
        throw new Error(`Default styles not found for topic type: ${topicType}`);
      }

      const mergedStyle = overrides.reduce<Partial<TopicStyleType>>((merged, styles) => {
        const override = styles[topicType];
        return override ? { ...merged, ...this.convertJsonToTopicStyle(override) } : merged;
      }, this.convertJsonToTopicStyle(defaultStyle));

      result.set(topicType, ThemeStyle.complete(mergedStyle, themeName, topicType));
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

    const gridPatternName =
      variantCanvas.gridPattern || lightCanvas.gridPattern || defaultCanvas.gridPattern;
    const gridPattern = gridPatternName
      ? ThemeStyle.checked(gridPatternName, isBackgroundPatternType, 'grid pattern')
      : undefined;

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

    if (jsonStyle.borderColor !== undefined) {
      result.borderColor = ThemeStyle.colors(jsonStyle.borderColor, 'border colour');
    }
    if (jsonStyle.backgroundColor !== undefined) {
      result.backgroundColor = ThemeStyle.colors(jsonStyle.backgroundColor, 'background colour');
    }
    if (jsonStyle.connectionColor !== undefined) {
      result.connectionColor = ThemeStyle.colors(jsonStyle.connectionColor, 'connection colour');
    }
    if (jsonStyle.connectionStyle !== undefined) {
      result.connectionStyle = this.convertStringToLineType(jsonStyle.connectionStyle);
    }
    if (jsonStyle.fontFamily !== undefined) result.fontFamily = jsonStyle.fontFamily;
    if (jsonStyle.fontSize !== undefined) result.fontSize = jsonStyle.fontSize;
    if (jsonStyle.fontStyle !== undefined) {
      result.fontStyle = ThemeStyle.checked(jsonStyle.fontStyle, isFontStyleType, 'font style');
    }
    if (jsonStyle.fontWeight !== undefined) {
      result.fontWeight = ThemeStyle.checked(jsonStyle.fontWeight, isFontWeightType, 'font weight');
    }
    if (jsonStyle.fontColor !== undefined) result.fontColor = jsonStyle.fontColor;
    if (jsonStyle.msgKey !== undefined) {
      result.msgKey = ThemeStyle.checked(jsonStyle.msgKey, isMsgKey, 'message key');
    }
    if (jsonStyle.shapeType !== undefined) {
      result.shapeType = ThemeStyle.checked(jsonStyle.shapeType, isTopicShapeType, 'shape type');
    }
    if (jsonStyle.outerBackgroundColor !== undefined) {
      result.outerBackgroundColor = jsonStyle.outerBackgroundColor;
    }
    if (jsonStyle.outerBorderColor !== undefined) {
      result.outerBorderColor = jsonStyle.outerBorderColor;
    }

    return result;
  }

  /**
   * The merged style of a topic type, which must set every key: a theme whose JSON files leave
   * one out fails to load, naming the theme, the topic type and the key.
   */
  private static complete(
    style: Partial<TopicStyleType>,
    themeName: string,
    topicType: TopicType,
  ): TopicStyleType {
    const get = <K extends keyof TopicStyleType>(key: K): TopicStyleType[K] => {
      const value = style[key];
      if (value === undefined) {
        throw new Error(`Theme '${themeName}' sets no ${key} for ${topicType}`);
      }
      return value;
    };
    return {
      borderColor: get('borderColor'),
      backgroundColor: get('backgroundColor'),
      connectionColor: get('connectionColor'),
      connectionStyle: get('connectionStyle'),
      fontFamily: get('fontFamily'),
      fontSize: get('fontSize'),
      fontStyle: get('fontStyle'),
      fontWeight: get('fontWeight'),
      fontColor: get('fontColor'),
      msgKey: get('msgKey'),
      shapeType: get('shapeType'),
      outerBackgroundColor: get('outerBackgroundColor'),
      outerBorderColor: get('outerBorderColor'),
    };
  }

  /** A colour of a theme's JSON, or its palette, which must not be empty. */
  private static colors(value: string | string[], name: string): string | Palette {
    if (typeof value === 'string') {
      return value;
    }
    const [first, ...rest] = value;
    if (first === undefined) {
      throw new Error(`Empty ${name} palette`);
    }
    return [first, ...rest];
  }

  /** A value of a theme's JSON, checked against its type: like an unknown connection style, it throws. */
  private static checked<T extends string>(
    value: string,
    isValid: (v: string) => v is T,
    name: string,
  ): T {
    if (!isValid(value)) {
      throw new Error(`Unknown ${name}: ${value}`);
    }
    return value;
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
      case 'POLYLINE_STRAIGHT':
        return LineType.POLYLINE_STRAIGHT;
      case 'THICK_CURVED':
        return LineType.THICK_CURVED;
      case 'THICK_CURVED_ORGANIC':
        return LineType.THICK_CURVED_ORGANIC;
      case 'ARC':
        return LineType.ARC;
      case 'HEARTBEAT':
        return LineType.HEARTBEAT;
      case 'NEURON':
        return LineType.NEURON;
      default:
        throw new Error(`Unknown connection style: ${connectionStyle}`);
    }
  }
}
