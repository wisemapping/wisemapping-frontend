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
import INodeModel, { TopicShapeType } from '../model/INodeModel';
import RelationshipModel, { StrokeStyle } from '../model/RelationshipModel';
import FeatureModel from '../model/FeatureModel';
import EmojiIconModel from '../model/EmojiIconModel';
import ContentType from '../ContentType';
import FreemindExporter from './FreemindExporter';
import FreeminNode from './freemind/Node';
import Arrowlink from './freemind/Arrowlink';
import FreeplaneArrowlink from './freeplane/FreeplaneArrowlink';

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
  extension(): string {
    return 'mm';
  }

  protected getVersionNumber(): string {
    return FreeplaneExporter.VERSION;
  }

  protected setTopicPropertiesToNode(args: {
    freemindNode: FreeminNode;
    mindmapTopic: INodeModel;
    isRoot: boolean;
  }): void {
    super.setTopicPropertiesToNode(args);
    const { freemindNode, mindmapTopic } = args;
    if (mindmapTopic.areChildrenShrunken() && mindmapTopic.getChildren().length > 0) {
      freemindNode.setFolded('true');
    }
  }

  // Rich text is kept as html, with its plain text as TEXT. Freeplane keeps line breaks in TEXT.
  protected addTextNode(freemindNode: FreeminNode, mindmapTopic: INodeModel): void {
    const text = mindmapTopic.getText();
    if (!text) {
      return;
    }
    if (mindmapTopic.getContentType() === ContentType.HTML) {
      const plainText = mindmapTopic.getPlainText().trim();
      if (plainText) {
        freemindNode.setText(plainText);
      }
      freemindNode.setArrowlinkOrCloudOrEdge(this.buildRichcontent(text, 'NODE', true));
    } else {
      freemindNode.setText(text);
    }
  }

  protected shapeToStyle(shape: TopicShapeType | undefined, isRoot: boolean): string | undefined {
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
  protected iconBuiltin(feature: FeatureModel): string | null {
    const builtin = super.iconBuiltin(feature);
    if (builtin || feature.getType() !== 'eicon') {
      return builtin;
    }
    const codePoints = Array.from((feature as EmojiIconModel).getIconType())
      .map((char) => char.codePointAt(0)!)
      .filter((codePoint) => codePoint !== 0xfe0f)
      .map((codePoint) => codePoint.toString(16).toUpperCase());
    return codePoints.length > 0 ? `emoji-${codePoints.join('-')}` : null;
  }

  protected buildArrowlink(relationship: RelationshipModel, destNode: FreeminNode): Arrowlink {
    const arrowlink = new FreeplaneArrowlink();
    const destination = destNode.getId();
    if (destination) {
      arrowlink.setDestination(destination);
    }
    // Freeplane draws an end arrow when ENDARROW is missing, so both are always written.
    arrowlink.setStartarrow(relationship.getStartArrow() ? 'Default' : 'None');
    arrowlink.setEndarrow(relationship.getEndArrow() ? 'Default' : 'None');

    const color = relationship.getStrokeColor();
    if (color) {
      arrowlink.setColor(this.rgbToHex(color));
    }
    const dash = FreeplaneExporter.DASHES[relationship.getStrokeStyle()];
    if (dash) {
      arrowlink.setDash(dash);
    }
    return arrowlink;
  }
}

export default FreeplaneExporter;
