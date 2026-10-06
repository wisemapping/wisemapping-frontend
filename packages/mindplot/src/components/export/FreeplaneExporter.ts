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
import type { TopicShapeType } from '../model/INodeModel';
import type INodeModel from '../model/INodeModel';
import type RelationshipModel from '../model/RelationshipModel';
import { StrokeStyle } from '../model/RelationshipModel';
import type FeatureModel from '../model/FeatureModel';
import ContentType from '../ContentType';
import FreemindExporter from './FreemindExporter';
import type { FreemindArrowlink, FreemindNode } from './freemind/FreemindModel';

/**
 * Freeplane maps (.mm). Freeplane reads the FreeMind format, so the FreeMind exporter writes the
 * map. Freeplane adds its version, node shapes (oval, rectangle), the dash of the connectors and
 * emoji icons.
 */
class FreeplaneExporter extends FreemindExporter {
  static readonly VERSION = 'freeplane 1.9.13';

  // Dash patterns of the Freeplane Dash enum: DASHES and CLOSE_DOTS.
  private static readonly DASHES: Partial<Record<StrokeStyle, string>> = {
    [StrokeStyle.DASHED]: '7 7',
    [StrokeStyle.DOTTED]: '3 3',
  };

  // mmx is only the id of the format: Freeplane maps are .mm files, as FreeMind ones.
  override extension(): string {
    return 'mm';
  }

  protected override getVersionNumber(): string {
    return FreeplaneExporter.VERSION;
  }

  protected override setTopicPropertiesToNode(args: {
    freemindNode: FreemindNode;
    mindmapTopic: INodeModel;
    isRoot: boolean;
  }): void {
    super.setTopicPropertiesToNode(args);
    const { freemindNode, mindmapTopic } = args;
    if (mindmapTopic.areChildrenShrunken() && mindmapTopic.getChildren().length > 0) {
      freemindNode.FOLDED = 'true';
    }
  }

  // Rich text is kept as html, with its plain text as TEXT. Freeplane keeps line breaks in TEXT.
  protected override addTextNode(freemindNode: FreemindNode, mindmapTopic: INodeModel): void {
    const text = mindmapTopic.getText();
    if (!text) {
      return;
    }
    if (mindmapTopic.getContentType() === ContentType.HTML) {
      const plainText = mindmapTopic.getPlainText().trim();
      if (plainText) {
        freemindNode.TEXT = plainText;
      }
      freemindNode.children.push(this.buildRichcontent(text, 'NODE', true));
    } else {
      freemindNode.TEXT = text;
    }
  }

  protected override shapeToStyle(
    shape: TopicShapeType | undefined,
    isRoot: boolean,
  ): string | undefined {
    switch (shape) {
      case undefined:
        return isRoot ? undefined : 'fork';
      case 'rounded rectangle':
        return 'bubble';
      case 'elipse':
        return 'oval';
      case 'rectangle':
        return 'rectangle';
      case 'line':
      case 'none':
        return 'fork';
      default:
        return undefined;
    }
  }

  /**
   * Emoji without a builtin icon are written as Freeplane emoji icons (emoji-<code points>), which
   * Freeplane names without the emoji variation selector.
   */
  protected override iconBuiltin(feature: FeatureModel): string | null {
    const builtin = super.iconBuiltin(feature);
    if (builtin || !feature.isOfType('eicon')) {
      return builtin;
    }
    const codePoints = Array.from(feature.getIconType())
      .map((char) => char.codePointAt(0)!)
      .filter((codePoint) => codePoint !== 0xfe0f)
      .map((codePoint) => codePoint.toString(16).toUpperCase());
    return codePoints.length > 0 ? `emoji-${codePoints.join('-')}` : null;
  }

  protected override buildArrowlink(
    relationship: RelationshipModel,
    destNode: FreemindNode,
  ): FreemindArrowlink {
    const color = relationship.getStrokeColor();
    return {
      kind: 'arrowlink',
      DESTINATION: destNode.ID,
      // Freeplane draws an end arrow when ENDARROW is missing, so both are always written.
      STARTARROW: relationship.getStartArrow() ? 'Default' : 'None',
      ENDARROW: relationship.getEndArrow() ? 'Default' : 'None',
      COLOR: color ? this.rgbToHex(color) : undefined,
      // Freeplane arrowlinks also have a dash pattern, its lengths separated by spaces.
      DASH: FreeplaneExporter.DASHES[relationship.getStrokeStyle()],
    };
  }
}

export default FreeplaneExporter;
