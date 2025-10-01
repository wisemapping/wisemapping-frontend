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
import { ThemeStyle, TopicStyleType } from './ThemeStyle';

// Re-export TopicStyleType for backward compatibility
export { TopicStyleType } from './ThemeStyle';

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
    return canvasStyle.opacity || 1;
  }

  getCanvasShowGrid(): boolean {
    const canvasStyle = this._themeStyle.getCanvasStyle();
    return canvasStyle.showGrid !== false; // Default to true if not specified
  }

  protected resolve(key: keyof TopicStyleType, topic: Topic, resolveDefault = true): StyleType {
    // Search parent value ...
    const recurviveModelStrategy = (value: keyof TopicStyleType, t: Topic): StyleType => {
      const model = t.getModel();
      let result: StyleType = keyToModel.get(key)!(model);

      const parent = t.getParent();
      if (!result && parent) {
        result = recurviveModelStrategy(value, parent);
      }
      return result;
    };

    // Can be found in the model or parent  ?
    let result = recurviveModelStrategy(key, topic);
    if (!result && resolveDefault) {
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
    return topic.getOrBuildTextShape().getFontHeight() * 0.5;
  }

  getText(topic: Topic): string {
    const { msgKey } = this.getStyles(topic);
    return $msg(msgKey);
  }

  getEmojiSpacing(topic: Topic): number {
    // Default spacing: central topics get more spacing than main topics
    const fontHeight = topic.getOrBuildTextShape().getFontHeight();
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
    return result!;
  }
}
export default DefaultTheme;
