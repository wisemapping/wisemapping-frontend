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
import { FREEPLANE_ICON_EMOJIS, FREEPLANE_SVG_ICONS } from '../import/FreeplaneImporter';

// The same emoji can be written with or without the emoji variation selector (U+FE0F).
const withoutVariationSelector = (emoji: string): string => emoji.replace(/️/g, '');

// The builtin of each WiseMapping icon of a table, the first one listed when several share it.
const inverse = (
  table: Readonly<Record<string, string>>,
  key: (icon: string) => string,
): ReadonlyMap<string, string> => {
  const result = new Map<string, string>();
  Object.entries(table).forEach(([builtin, icon]) => {
    if (!result.has(key(icon))) {
      result.set(key(icon), builtin);
    }
  });
  return result;
};

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

  // The inverse of the Freeplane importer tables. Several builtins (the revision icons) share an
  // emoji: the first one listed is the one exported.
  private static readonly EMOJI_BUILTINS = inverse(FREEPLANE_ICON_EMOJIS, withoutVariationSelector);

  // task_0 ... task_100 as the Freeplane progress icons, 0% ... 100%.
  private static readonly SVG_BUILTINS = inverse(FREEPLANE_SVG_ICONS, (id) => id);

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
   * The icons the Freeplane importer maps from the Freeplane builtins that FreeMind does not have
   * are written back as those builtins; the FreeMind builtins, which Freeplane also has, come first.
   * Other emoji are written as Freeplane emoji icons (emoji-<code points>), which Freeplane names
   * without the emoji variation selector.
   */
  protected override iconBuiltin(feature: FeatureModel): string | null {
    if (feature.isOfType('icon')) {
      const progress = FreeplaneExporter.SVG_BUILTINS.get(feature.getIconType());
      if (progress) {
        return progress;
      }
    }
    const builtin = super.iconBuiltin(feature);
    if (builtin || !feature.isOfType('eicon')) {
      return builtin;
    }
    const freeplaneBuiltin = FreeplaneExporter.EMOJI_BUILTINS.get(
      withoutVariationSelector(feature.getIconType()),
    );
    if (freeplaneBuiltin) {
      return freeplaneBuiltin;
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
