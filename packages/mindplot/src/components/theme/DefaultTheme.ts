/* eslint-disable func-call-spacing */
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
import NodeModel from '../model/NodeModel';
import ColorUtil from './ColorUtil';
import Topic from '../Topic';
import Theme, { TopicType, ThemeVariant } from './Theme';
import { $msg } from '../Messages';
import { ThemeStyle } from './ThemeStyle';
import type { TopicStyleType } from './ThemeStyle';
import type { BackgroundPatternType } from '../model/CanvasStyleType';
import ThemeResolutionCache from './ThemeResolutionCache';

// Re-export TopicStyleType for backward compatibility
export type { TopicStyleType } from './ThemeStyle';

type StyleType = string | string[] | number | undefined | LineType;

// eslint-disable-next-line no-spaced-func
const keyToModel = new Map<keyof TopicStyleType, (model: NodeModel) => StyleType>([
  ['borderColor', (m: NodeModel) => m.getBorderColor()],
  ['backgroundColor', (m: NodeModel) => m.getBackgroundColor()],
  ['shapeType', (m: NodeModel) => m.getShapeType()],
  ['connectionStyle', (m: NodeModel) => m.getConnectionStyle()],
  ['connectionColor', (m: NodeModel) => m.getConnectionColor()],
  ['fontFamily', (m: NodeModel) => m.getFontFamily()],
  ['fontColor', (m: NodeModel) => m.getFontColor()],
  ['fontWeight', (m: NodeModel) => m.getFontWeight()],
  ['fontSize', (m: NodeModel) => m.getFontSize()],
  ['fontStyle', (m: NodeModel) => m.getFontStyle()],
]);

// Some style values are numeric enums whose first member is 0 (LineType.THIN_CURVED),
// so "not set" must be checked explicitly rather than by truthiness.
const isUnset = (value: StyleType): boolean =>
  value === undefined || value === null || value === '';

// The least WCAG contrast a theme text colour keeps with what is behind it: 3:1, the AA level for
// large text and user interface components. Below it, the text is drawn black or white instead.
const MIN_TEXT_CONTRAST = 3;

class DefaultTheme implements Theme {
  private _themeStyle: ThemeStyle;

  protected _variant: ThemeVariant;

  constructor(themeStyle: ThemeStyle, variant: ThemeVariant) {
    this._themeStyle = themeStyle;
    this._variant = variant;
  }

  // Individual canvas style properties for Designer integration
  getCanvasBackgroundColor(): string {
    const canvasStyle = this._themeStyle.getCanvasStyle();
    return canvasStyle.backgroundColor;
  }

  getCanvasGridColor(): string | undefined {
    const canvasStyle = this._themeStyle.getCanvasStyle();
    return canvasStyle.gridColor;
  }

  getCanvasOpacity(): number {
    const canvasStyle = this._themeStyle.getCanvasStyle();
    return canvasStyle.opacity ?? 1;
  }

  getCanvasShowGrid(): boolean {
    const canvasStyle = this._themeStyle.getCanvasStyle();
    return canvasStyle.showGrid !== false; // Default to true if not specified
  }

  getCanvasGridPattern(): BackgroundPatternType {
    const canvasStyle = this._themeStyle.getCanvasStyle();
    return canvasStyle.gridPattern || 'grid';
  }

  protected resolve(key: keyof TopicStyleType, topic: Topic, resolveDefault = true): StyleType {
    // Search parent value. It only reads the models, so during a redraw pass it is
    // found once per topic and key, and a descendant stops at its parent's value ...
    const recurviveModelStrategy = (value: keyof TopicStyleType, t: Topic): StyleType =>
      ThemeResolutionCache.memo(t, `model:${key}`, () => {
        const model = t.getModel();
        let result: StyleType = keyToModel.get(key)!(model);

        const parent = t.getParent();
        if (isUnset(result) && parent) {
          result = recurviveModelStrategy(value, parent);
        }
        return result;
      });

    // Can be found in the model or parent  ?
    let result = recurviveModelStrategy(key, topic);
    if (isUnset(result) && resolveDefault) {
      result = this.getStyles(topic)[key];
    }
    return result;
  }

  protected getStyles(topic: Topic): TopicStyleType {
    let topicType: TopicType;

    if (topic.isCentralTopic()) {
      topicType = 'CentralTopic';
    } else {
      const targetTopic = topic.getOutgoingConnectedTopic();
      if (targetTopic) {
        if (targetTopic.isCentralTopic()) {
          topicType = 'MainTopic';
        } else {
          topicType = 'SubTopic';
        }
      } else {
        topicType = 'IsolatedTopic';
      }
    }

    return this._themeStyle.getStyles(topicType);
  }

  getShapeType(topic: Topic): TopicShapeType {
    const result = this.resolve('shapeType', topic) as TopicShapeType;
    return result;
  }

  getConnectionType(topic: Topic): LineType {
    return this.resolve('connectionStyle', topic) as LineType;
  }

  getFontFamily(topic: Topic): string {
    return this.resolve('fontFamily', topic) as string;
  }

  getFontSize(topic: Topic): number {
    return this.resolve('fontSize', topic) as number;
  }

  getFontStyle(topic: Topic): FontStyleType {
    return this.resolve('fontStyle', topic) as FontStyleType;
  }

  getFontWeight(topic: Topic): FontWeightType {
    return this.resolve('fontWeight', topic) as FontWeightType;
  }

  getInnerPadding(topic: Topic): number {
    return topic.getTextFontHeight() * 0.8;
  }

  getText(topic: Topic): string {
    const { msgKey } = this.getStyles(topic);
    return $msg(msgKey);
  }

  getEmojiSpacing(topic: Topic): number {
    // Default spacing: central topics get more spacing than main topics
    const fontHeight = topic.getTextFontHeight();
    return topic.isCentralTopic() ? fontHeight * 1.0 : fontHeight * 0.7;
  }

  // Variant-aware methods - default implementation falls back to non-variant methods
  getFontColor(topic: Topic): string {
    // Default implementation ignores variant, subclasses can override
    return this.resolve('fontColor', topic) as string;
  }

  getBackgroundColor(topic: Topic): string {
    // Default implementation ignores variant, subclasses can override
    const model = topic.getModel();
    let result = model.getBackgroundColor();
    if (!result && !topic.isCentralTopic()) {
      // Be sure that not overwride default background color ...
      const borderColor = model.getBorderColor();
      if (borderColor) {
        result = ColorUtil.lightenColor(borderColor, 40);
      }
    }

    if (!result) {
      let colors: string[] = [];
      colors = colors.concat(this.resolve('backgroundColor', topic) as string[] | string);

      // if the element is an array, use topic order to decide color ..
      let order = topic.getOrder();
      order = order || 0;

      const index = order % colors.length;
      result = colors[index];
    }
    return result;
  }

  getBorderColor(topic: Topic): string {
    // Default implementation ignores variant, subclasses can override
    const model = topic.getModel();
    let result = model.getBorderColor();

    // If the the style is a line, the color is alward the connection one.
    if (topic.getShapeType() === 'line') {
      result = this.getConnectionColor(topic);
    }

    if (!result) {
      const parent = topic.getParent();
      if (parent) {
        result = parent.getBorderColor(this._variant);
      }
    }

    // If border color has not been defined, use the connection color for the border ...
    if (!result) {
      result = this.getConnectionColor(topic);
    }
    return result;
  }

  /**
   * The colour behind the topic text: the canvas when the shape draws no fill (line, none),
   * otherwise the fill as seen over the canvas (a transparent fill shows the canvas).
   */
  protected getTextBackdropColor(topic: Topic): string {
    const canvasStyle = topic.getModel().getMindmap().getCanvasStyle();
    const canvasColor = canvasStyle?.backgroundColor || this.getCanvasBackgroundColor();
    const shapeType = this.getShapeType(topic);
    if (shapeType === 'line' || shapeType === 'none') {
      return canvasColor;
    }
    const fillColor = this.getBackgroundColor(topic);
    return ColorUtil.over(fillColor, canvasColor) ?? fillColor;
  }

  /**
   * A theme text colour that can be read on what is behind the text: the colour itself, or black
   * or white (whichever contrasts more) when its contrast is below MIN_TEXT_CONTRAST.
   */
  protected readableTextColor(topic: Topic, color: string): string {
    const backdrop = this.getTextBackdropColor(topic);
    const contrast = ColorUtil.contrastRatio(color, backdrop);
    if (contrast === undefined || contrast >= MIN_TEXT_CONTRAST) {
      return color;
    }
    const black = ColorUtil.contrastRatio('#000000', backdrop)!;
    const white = ColorUtil.contrastRatio('#FFFFFF', backdrop)!;
    return black >= white ? '#000000' : '#FFFFFF';
  }

  getOuterBackgroundColor(topic: Topic, onFocus: boolean): string {
    // Default implementation ignores variant, subclasses can override
    let result: string;
    if (topic.getShapeType() === 'line') {
      const color = this.getStyles(topic).outerBackgroundColor;
      result = onFocus ? color : ColorUtil.lightenColor(color, 30);
    } else {
      const innerBgColor = this.getBackgroundColor(topic);
      result = ColorUtil.lightenColor(innerBgColor, 70);
    }
    return result;
  }

  getOuterBorderColor(topic: Topic): string {
    // Default implementation ignores variant, subclasses can override
    let result: string;
    if (topic.getShapeType() === 'line') {
      result = this.getStyles(topic).outerBorderColor;
    } else {
      const innerBorderColor = this.getBorderColor(topic);
      result = ColorUtil.lightenColor(innerBorderColor, 70);
    }
    return result;
  }

  getConnectionColor(topic: Topic): string {
    // Default implementation ignores variant, subclasses can override
    const model = topic.getModel();
    let result: string | undefined = model.getConnectionColor();

    // Style is infered looking recursivelly on the parent nodes.
    if (!result) {
      const parent = topic.getParent();
      if (parent && parent.isCentralTopic()) {
        // This means that this is central main node, in this case, I will overwrite with the main color if it was defined.
        result = topic.getModel().getConnectionColor() || parent.getModel().getConnectionColor();
      } else {
        result = parent?.getConnectionColor(this._variant);
      }
    }

    if (!result) {
      let colors: string[] = [];
      colors = colors.concat(this.resolve('connectionColor', topic) as string[] | string);

      // if the element is an array, use topic order to decide color ..
      let order = topic.getOrder();
      order = order || 0;

      const index = order % colors.length;
      result = colors[index];
    }
    return result;
  }
}
export default DefaultTheme;
