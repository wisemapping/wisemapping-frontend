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
import pickByOrder from './pickByOrder';

// Re-export TopicStyleType for backward compatibility
export type { TopicStyleType } from './ThemeStyle';

/** The styles a topic's model can set, each read by its getter (the type the theme uses). */
type ModelStyleKey =
  | 'borderColor'
  | 'backgroundColor'
  | 'shapeType'
  | 'connectionStyle'
  | 'connectionColor'
  | 'fontFamily'
  | 'fontColor'
  | 'fontWeight'
  | 'fontSize'
  | 'fontStyle';

const keyToModel: {
  [K in ModelStyleKey]: (model: NodeModel) => TopicStyleType[K] | undefined;
} = {
  borderColor: (m) => m.getBorderColor(),
  backgroundColor: (m) => m.getBackgroundColor(),
  shapeType: (m) => m.getShapeType(),
  connectionStyle: (m) => m.getConnectionStyle(),
  connectionColor: (m) => m.getConnectionColor(),
  fontFamily: (m) => m.getFontFamily(),
  fontColor: (m) => m.getFontColor(),
  fontWeight: (m) => m.getFontWeight(),
  fontSize: (m) => m.getFontSize(),
  fontStyle: (m) => m.getFontStyle(),
};

// Some style values are numeric enums whose first member is 0 (LineType.THIN_CURVED),
// so "not set" must be checked explicitly rather than by truthiness.
const isUnset = (value: unknown): boolean => value === undefined || value === null || value === '';

// The least WCAG contrast a theme text colour keeps with what is behind it: 3:1, the AA level for
// large text and user interface components. Below it, the text is drawn black or white instead.
const MIN_TEXT_CONTRAST = 3;

// The opacities, strongest first, of the topic colour a halo is painted with over the canvas when
// the usual halo would hide the topic text. A hovered topic skips the first, so it stays fainter.
const HALO_TINT_ALPHAS = [0.25, 0.15, 0.08];

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

  /**
   * The style of the topic: set on its model or the closest ancestor's, else the theme default
   * for its kind of topic (unless resolveDefault is false, when it may be undefined).
   */
  protected resolve<K extends ModelStyleKey>(key: K, topic: Topic): TopicStyleType[K];

  protected resolve<K extends ModelStyleKey>(
    key: K,
    topic: Topic,
    resolveDefault: boolean,
  ): TopicStyleType[K] | undefined;

  protected resolve<K extends ModelStyleKey>(
    key: K,
    topic: Topic,
    resolveDefault = true,
  ): TopicStyleType[K] | undefined {
    // Search parent value. It only reads the models, so during a redraw pass it is
    // found once per topic and key, and a descendant stops at its parent's value ...
    const recurviveModelStrategy = (t: Topic): TopicStyleType[K] | undefined =>
      ThemeResolutionCache.memo(t, `model:${key}`, () => {
        const model = t.getModel();
        let result = keyToModel[key](model);

        const parent = t.getParent();
        if (isUnset(result) && parent) {
          result = recurviveModelStrategy(parent);
        }
        return result;
      });

    // Can be found in the model or parent  ?
    let result = recurviveModelStrategy(topic);
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
    return this.resolve('shapeType', topic);
  }

  getConnectionType(topic: Topic): LineType {
    return this.resolve('connectionStyle', topic);
  }

  getFontFamily(topic: Topic): string {
    return this.resolve('fontFamily', topic);
  }

  getFontSize(topic: Topic): number {
    return this.resolve('fontSize', topic);
  }

  getFontStyle(topic: Topic): FontStyleType {
    return this.resolve('fontStyle', topic);
  }

  getFontWeight(topic: Topic): FontWeightType {
    return this.resolve('fontWeight', topic);
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

  getFontColor(topic: Topic): string {
    // A color picked by the user (on the topic or an ancestor) is used as is ...
    const picked = this.resolve('fontColor', topic, false);
    if (picked) {
      return picked;
    }

    // The theme color, as long as it can be read on the fill or, without one, on the canvas.
    return this.readableTextColor(topic, this.getStyles(topic).fontColor);
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
      const colors = this.resolve('backgroundColor', topic);
      result = pickByOrder(colors, topic.getOrder());
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
    const canvasColor = this.getMapCanvasColor(topic);
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

  /** The canvas colour of the map: the one the map sets, or else the theme one. */
  private getMapCanvasColor(topic: Topic): string {
    const canvasStyle = topic.getModel().getMindmap().getCanvasStyle();
    return canvasStyle?.backgroundColor || this.getCanvasBackgroundColor();
  }

  getOuterBackgroundColor(topic: Topic, onFocus: boolean): string {
    // Default implementation ignores variant, subclasses can override
    let result: string;
    let tint: string;
    if (topic.getShapeType() === 'line') {
      const color = this.getStyles(topic).outerBackgroundColor;
      result = onFocus ? color : ColorUtil.lightenColor(color, 30);
      tint = color;
    } else {
      const innerBgColor = this.getBackgroundColor(topic);
      result = ColorUtil.lightenColor(innerBgColor, 70);
      tint = innerBgColor;
    }
    return this.readableHaloColor(topic, result, tint, onFocus);
  }

  /**
   * A halo (the outer shape of a selected or hovered topic) the topic text can be read on. The
   * halo is behind the text when the shape draws no fill (line, none) or a see-through one. When
   * the text does not contrast MIN_TEXT_CONTRAST with it there, the halo is instead the tint colour
   * (or, when it is transparent, the connection colour) painted over the canvas, fainter and
   * fainter until the text contrasts: the theme text colour is readable on the canvas, so at worst
   * the halo is the canvas and only its border shows.
   */
  private readableHaloColor(topic: Topic, halo: string, tint: string, onFocus: boolean): string {
    const shapeType = this.getShapeType(topic);
    const fill =
      shapeType === 'line' || shapeType === 'none' ? undefined : this.getBackgroundColor(topic);
    if (fill !== undefined && (ColorUtil.parse(fill)?.a ?? 1) >= 1) {
      // An opaque fill hides the halo behind the text.
      return halo;
    }

    const textColor = this.getFontColor(topic);
    const readableOn = (candidate: string): boolean => {
      const backdrop = fill !== undefined ? (ColorUtil.over(fill, candidate) ?? fill) : candidate;
      const contrast = ColorUtil.contrastRatio(textColor, backdrop);
      return contrast === undefined || contrast >= MIN_TEXT_CONTRAST;
    };
    if (readableOn(halo)) {
      return halo;
    }

    const canvas = this.getMapCanvasColor(topic);
    const rgb = [tint, this.getConnectionColor(topic)]
      .map((color) => ColorUtil.parse(color))
      .find((color) => color !== undefined && color.a > 0);
    if (rgb) {
      const alphas = onFocus ? HALO_TINT_ALPHAS : HALO_TINT_ALPHAS.slice(1);
      const tinted = alphas
        .map((alpha) => ColorUtil.over(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`, canvas))
        .find((candidate) => candidate !== undefined && readableOn(candidate));
      if (tinted) {
        return tinted;
      }
    }
    // A text colour picked by the user may not be readable on the canvas either: keep the halo.
    return readableOn(canvas) ? canvas : halo;
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
      const colors = this.resolve('connectionColor', topic);
      result = pickByOrder(colors, topic.getOrder());
    }
    return result;
  }
}
export default DefaultTheme;
