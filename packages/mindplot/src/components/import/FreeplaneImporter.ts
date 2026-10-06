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
import Importer from './Importer';
import ImportError from './ImportError';
import SecureXmlParser from '../security/SecureXmlParser';
import Mindmap from '../model/Mindmap';
import type NodeModel from '../model/NodeModel';
import NoteModel from '../model/NoteModel';
import FeatureModelFactory from '../model/FeatureModelFactory';
import { StrokeStyle } from '../model/RelationshipModel';
import ContentType from '../ContentType';
import HtmlSanitizer from '../security/HtmlSanitizer';
import toWiseMappingXml from './support/MindmapXml';
import { legacyIconEmoji } from './support/LegacyIconMap';
import { htmlToPlainText } from './support/HtmlText';
import { applyFreemindFont } from './support/FreemindFont';
import TopicIdSequence from './support/TopicIdSequence';
import { ownEntry } from './support/IconEmoji';
import { alternatingSidePosition } from './support/MainTopicPosition';
import type { WiseIcon } from './FreemindIconConverter';
import FreemindIconConverter from './FreemindIconConverter';
import type { TopicShapeType } from '../model/INodeModel';

/**
 * The Freeplane builtin icons (freeplane/src/viewer/resources/images/icons) that FreeMind does not
 * have, and their emoji. The FreeMind ones, which Freeplane keeps, are mapped by
 * FreemindIconConverter first.
 */
export const FREEPLANE_ICON_EMOJIS: Readonly<Record<string, string>> = {
  bee: '🐝',
  neutral: '😐',
};

class FreeplaneImporter extends Importer {
  private freeplaneInput: string;

  private readonly ids = new TopicIdSequence();

  private topicIdMap: Map<string, number>;

  constructor(map: string) {
    super();
    this.freeplaneInput = map;
    this.topicIdMap = new Map();
  }

  import(nameMap: string, _description?: string): Promise<string> {
    try {
      // Use secure XML parser to prevent XXE attacks
      const freeplaneDoc = SecureXmlParser.parseSecureXml(this.freeplaneInput);
      if (!freeplaneDoc) {
        throw new Error('Failed to parse Freeplane XML - content may be unsafe');
      }

      // Find the root node
      const rootNode = freeplaneDoc.querySelector('node');
      if (!rootNode) {
        throw new Error('No root node found in Freeplane XML');
      }

      // Reset counters and ID map
      this.ids.reset();
      this.topicIdMap.clear();

      const mindmap = this.buildMindmap(rootNode, nameMap);
      return Promise.resolve(toWiseMappingXml(mindmap));
    } catch (error) {
      console.error('Error importing Freeplane map:', error);
      return Promise.reject(ImportError.from(error, 'Freeplane'));
    }
  }

  private buildMindmap(rootNode: Element, mapName: string): Mindmap {
    const mindmap = new Mindmap(mapName);
    mindmap.setTheme('prism');
    mindmap.setLayout('mindmap');

    const centralTopic = mindmap.createNode('CentralTopic', this.ids.next());
    this.mapNodeId(rootNode, centralTopic);
    centralTopic.setText(FreeplaneImporter.nodeText(rootNode) || 'Central Topic');
    const centralShape = FreeplaneImporter.styleToShape(rootNode.getAttribute('STYLE'));
    if (centralShape) {
      centralTopic.setShapeType(centralShape);
    }
    this.addStyle(centralTopic, rootNode);
    this.addFeatures(centralTopic, rootNode);
    mindmap.addBranch(centralTopic);

    // Process child nodes
    const childNodes = rootNode.querySelectorAll(':scope > node');
    childNodes.forEach((childNode, index) => {
      centralTopic.append(this.convertNode(mindmap, childNode, index));
    });

    this.addRelationships(mindmap, rootNode);

    return mindmap;
  }

  private convertNode(mindmap: Mindmap, freeplaneNode: Element, order: number): NodeModel {
    const topic = mindmap.createNode('MainTopic', this.ids.next());
    this.mapNodeId(freeplaneNode, topic);

    const position = alternatingSidePosition(order);
    topic.setText(FreeplaneImporter.nodeText(freeplaneNode) || 'Untitled');
    topic.setPosition(position.x, position.y);
    topic.setOrder(order);
    // A background is only drawn by a shape, so a node with one and no shape is a rectangle.
    const shape =
      FreeplaneImporter.styleToShape(freeplaneNode.getAttribute('STYLE')) ||
      (freeplaneNode.getAttribute('BACKGROUND_COLOR') ? 'rectangle' : 'line');
    topic.setShapeType(shape);
    this.addStyle(topic, freeplaneNode);
    if (freeplaneNode.getAttribute('FOLDED') === 'true') {
      topic.setChildrenShrunken(true);
    }
    this.addFeatures(topic, freeplaneNode);

    // Process child nodes recursively
    const childNodes = freeplaneNode.querySelectorAll(':scope > node');
    childNodes.forEach((childNode, childIndex) => {
      topic.append(this.convertNode(mindmap, childNode, childIndex));
    });

    return topic;
  }

  // Nodes without an ID can not be the end of an arrowlink, so they are not mapped. A made up key
  // could be the ID of another node.
  private mapNodeId(freeplaneNode: Element, topic: NodeModel): void {
    const freeplaneNodeId = freeplaneNode.getAttribute('ID');
    if (freeplaneNodeId) {
      this.topicIdMap.set(freeplaneNodeId, topic.getId());
    }
  }

  /**
   * The text of a node: its TEXT, or the text of its rich content. Topic text is plain (the model
   * does not persist a content type for it), so rich text is kept as its lines of text.
   */
  private static nodeText(freeplaneNode: Element): string {
    const text = freeplaneNode.getAttribute('TEXT');
    if (text) {
      return text;
    }
    const richcontent = freeplaneNode.querySelector(':scope > richcontent[TYPE="NODE"]');
    if (!richcontent) {
      return '';
    }
    const html = richcontent.cloneNode(true) as Element;
    FreeplaneImporter.cdataToText(html);
    return htmlToPlainText(html.innerHTML);
  }

  // The node STYLE, as written by Freeplane (and the Freeplane exporter).
  private static styleToShape(style: string | null): TopicShapeType | undefined {
    switch (style) {
      case 'bubble':
        return 'rounded rectangle';
      case 'oval':
        return 'elipse';
      case 'rectangle':
        return 'rectangle';
      case 'fork':
        return 'line';
      default:
        return undefined;
    }
  }

  // Colors and font of a node. COLOR is the text color, the edge color the connection color.
  private addStyle(topic: NodeModel, freeplaneNode: Element): void {
    const backgroundColor = freeplaneNode.getAttribute('BACKGROUND_COLOR');
    if (backgroundColor) {
      topic.setBackgroundColor(backgroundColor);
    }
    const color = freeplaneNode.getAttribute('COLOR');
    if (color) {
      topic.setFontColor(color);
    }
    const edgeColor = freeplaneNode.querySelector(':scope > edge')?.getAttribute('COLOR');
    if (edgeColor) {
      topic.setConnectionColor(edgeColor);
    }

    const font = freeplaneNode.querySelector(':scope > font');
    if (font) {
      applyFreemindFont(topic, {
        name: font.getAttribute('NAME'),
        size: font.getAttribute('SIZE'),
        bold: font.getAttribute('BOLD'),
        italic: font.getAttribute('ITALIC'),
      });
    }
  }

  // The icons, notes and links of a node, the central one included.
  private addFeatures(topic: NodeModel, freeplaneNode: Element): void {
    const icons = freeplaneNode.querySelectorAll(':scope > icon');
    icons.forEach((icon) => {
      const builtin = icon.getAttribute('BUILTIN');
      if (builtin) {
        const wiseIcon = this.toWiseIcon(builtin);
        topic.addFeature(FeatureModelFactory.createModel(wiseIcon.type, { id: wiseIcon.id }));
      }
    });

    // Freeplane notes are HTML, as in FreeMind.
    const noteContent = this.buildNoteContent(freeplaneNode);
    if (noteContent) {
      const note = new NoteModel({ text: noteContent });
      note.setContentType(ContentType.HTML);
      topic.addFeature(note);
    }

    const link = freeplaneNode.getAttribute('LINK');
    if (link) {
      topic.addFeature(FeatureModelFactory.createModel('link', { url: link }));
    }
  }

  private buildNoteContent(freeplaneNode: Element): string | null {
    const parts: string[] = [];

    // Handle Freeplane notes
    const noteElements = freeplaneNode.querySelectorAll(':scope > richcontent[TYPE="NOTE"]');
    noteElements.forEach((noteElement) => {
      // Sanitized like FreeMind notes: it drops the <html> and <body> wrappers and any script.
      const note = noteElement.cloneNode(true) as Element;
      FreeplaneImporter.cdataToText(note);
      const htmlContent = HtmlSanitizer.sanitize(note.innerHTML).trim();
      if (htmlContent) {
        parts.push(htmlContent);
      }
    });

    return parts.length > 0 ? parts.join('\n') : null;
  }

  // HTML has no CDATA sections, it would drop them: their text is kept as (escaped) text.
  private static cdataToText(node: Node): void {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.CDATA_SECTION_NODE) {
        child.replaceWith(child.ownerDocument!.createTextNode(child.textContent || ''));
      } else {
        FreeplaneImporter.cdataToText(child);
      }
    });
  }

  /**
   * The WiseMapping icon of a Freeplane icon: its emoji icons (emoji-<code points>), the FreeMind
   * builtins and the WiseMapping icon ids, which the Freeplane exporter writes, then the other
   * Freeplane names.
   */
  private toWiseIcon(builtin: string): WiseIcon {
    const emoji = FreeplaneImporter.emojiOf(builtin);
    if (emoji) {
      return { type: 'eicon', id: emoji };
    }
    return (
      FreemindIconConverter.toWiseIcon(builtin) || {
        type: 'eicon',
        id: this.mapFreeplaneIconToEmojiIcon(builtin),
      }
    );
  }

  /**
   * The emoji of a Freeplane emoji icon, named after its code points without the emoji variation
   * selector, which is added back to a single character that is text by default (❤ is ❤️).
   */
  private static emojiOf(builtin: string): string | undefined {
    const sequence = /^emoji-([0-9A-F]+(?:-[0-9A-F]+)*)$/i.exec(builtin)?.[1];
    if (!sequence) {
      return undefined;
    }
    const codePoints = sequence.split('-').map((hex) => parseInt(hex, 16));
    if (codePoints.some((codePoint) => codePoint > 0x10ffff)) {
      return undefined;
    }
    const emoji = String.fromCodePoint(...codePoints);
    return codePoints.length === 1 && !/\p{Emoji_Presentation}/u.test(emoji)
      ? `${emoji}\uFE0F`
      : emoji;
  }

  private mapFreeplaneIconToEmojiIcon(builtin: string): string {
    // The mapped emoji, the emoji of a legacy WiseMapping icon id, or a light bulb.
    return ownEntry(FREEPLANE_ICON_EMOJIS, builtin) || legacyIconEmoji(builtin) || '💡';
  }

  private addRelationships(mindmap: Mindmap, rootNode: Element): void {
    // Find all arrowlink elements in the document
    const arrowlinks = rootNode.ownerDocument?.querySelectorAll('arrowlink') || [];
    arrowlinks.forEach((arrowlink) => {
      this.addRelationship(mindmap, arrowlink);
    });
  }

  private addRelationship(mindmap: Mindmap, arrowlinkElement: Element): void {
    const destination = arrowlinkElement.getAttribute('DESTINATION');

    if (!destination) return;

    // Find the source node (parent of the arrowlink)
    const sourceNode = arrowlinkElement.parentElement;
    if (!sourceNode) return;

    const sourceId = sourceNode.getAttribute('ID');
    if (!sourceId) return;

    // Map Freeplane IDs to WiseMapping IDs
    const srcTopicId = this.topicIdMap.get(sourceId);
    const destTopicId = this.topicIdMap.get(destination);

    if (!srcTopicId || !destTopicId) return;

    const relationship = mindmap.createRelationship(srcTopicId, destTopicId);

    relationship.setStrokeStyle(
      FreeplaneImporter.strokeStyle(arrowlinkElement.getAttribute('DASH')),
    );

    mindmap.addRelationship(relationship);
  }

  /**
   * DASH is the dash pattern of the connector, its lengths separated by spaces. Freeplane writes
   * those of its Dash enum: none (SOLID), "3 3" (CLOSE_DOTS), "7 7" (DASHES), "2 7" (DISTANT_DOTS)
   * and "2 7 7 7" (DOTS_AND_DASHES). Short dashes are dots; any longer one makes the line dashed.
   */
  private static strokeStyle(dash: string | null): StrokeStyle {
    const lengths = (dash || '')
      .trim()
      .split(/\s+/)
      .map(Number)
      .filter((length) => length > 0);
    if (lengths.length === 0) {
      return StrokeStyle.SOLID;
    }
    const dashLengths = lengths.filter((_, index) => index % 2 === 0);
    return dashLengths.every((length) => length <= 3) ? StrokeStyle.DOTTED : StrokeStyle.DASHED;
  }
}

export default FreeplaneImporter;
