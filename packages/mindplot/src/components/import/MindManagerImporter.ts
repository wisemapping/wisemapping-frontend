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

import { unzipSync } from 'fflate';
import Importer from './Importer';
import ImportError from './ImportError';
import SecureXmlParser from '../security/SecureXmlParser';
import Mindmap from '../model/Mindmap';
import NodeModel from '../model/NodeModel';
import NoteModel from '../model/NoteModel';
import FeatureModelFactory from '../model/FeatureModelFactory';
import { StrokeStyle } from '../model/RelationshipModel';
import { decodeUtf8 } from './support/Utf8Decoder';
import toWiseMappingXml from './support/MindmapXml';

interface MindManagerTopic {
  id: string;
  text: string;
  notes?: string;
  hyperlink?: string;
  icon?: string;
  color?: string;
  children?: MindManagerTopic[];
}

type MindManagerRawInput = string | ArrayBuffer | Uint8Array;

class MindManagerImporter extends Importer {
  private mindManagerInput: MindManagerRawInput;

  private idCounter: number = 1;

  private topicIdMap: Map<string, number>;

  constructor(map: MindManagerRawInput) {
    super();
    this.mindManagerInput = map;
    this.topicIdMap = new Map();
  }

  private generateId(): number {
    return this.idCounter++;
  }

  private calculatePosition(order: number): { x: number; y: number } {
    // Even orders go to the right, odd orders go to the left
    const side = order % 2 === 0 ? 1 : -1;
    const sideIndex = Math.floor(order / 2);

    const x = side * (200 + sideIndex * 100);
    const y = sideIndex * 75;

    return { x, y };
  }

  private buildNoteContent(notes?: string): string {
    if (!notes) return '';
    return notes.trim();
  }

  private mapMindManagerIconToEmojiIcon(iconId: string): string {
    // MindManager icon mapping to WiseMapping EmojiIcons
    const iconMappings: { [key: string]: string } = {
      // Priority icons
      'priority-1': '🔴',
      'priority-2': '🟡',
      'priority-3': '🟢',
      'priority-4': '🔵',
      'priority-5': '🟣',

      // Task icons
      'task-start': '🟡',
      'task-done': '✅',
      'task-pause': '⏸️',
      'task-cancel': '❌',

      // Star icons
      star: '⭐',
      'star-empty': '☆',
      'star-half': '⭐',

      // Arrow icons
      'arrow-up': '⬆️',
      'arrow-down': '⬇️',
      'arrow-left': '⬅️',
      'arrow-right': '➡️',

      // Number icons
      1: '1️⃣',
      2: '2️⃣',
      3: '3️⃣',
      4: '4️⃣',
      5: '5️⃣',
      6: '6️⃣',
      7: '7️⃣',
      8: '8️⃣',
      9: '9️⃣',
      10: '🔟',

      // Letter icons
      A: '🅰️',
      B: '🅱️',
      C: '🅲',
      D: '🅳',
      E: '🅴',
      F: '🅵',
      G: '🅶',
      H: '🅷',
      I: '🅸',
      J: '🅹',
      K: '🅺',
      L: '🅻',
      M: '🅼',
      N: '🅽',
      O: '🅾️',
      P: '🅿️',
      Q: '🆀',
      R: '🆁',
      S: '🆂',
      T: '🆃',
      U: '🆄',
      V: '🆅',
      W: '🆆',
      X: '🆇',
      Y: '🆈',
      Z: '🆉',

      // Emotion icons
      smile: '😊',
      happy: '😃',
      sad: '😢',
      angry: '😠',
      thinking: '🤔',
      surprised: '😲',

      // Technology icons
      computer: '💻',
      phone: '📱',
      email: '📧',
      internet: '🌐',

      // Default fallback
    };

    return iconMappings[iconId] || iconMappings[iconId.toLowerCase()] || '💡';
  }

  private buildMindmap(rootTopic: MindManagerTopic, nameMap: string, doc: Document): Mindmap {
    const mindmap = new Mindmap(nameMap);
    mindmap.setTheme('prism');
    mindmap.setLayout('mindmap');

    const centralTopic = mindmap.createNode('CentralTopic', this.generateId());
    this.topicIdMap.set(rootTopic.id, centralTopic.getId());
    centralTopic.setText(rootTopic.text);
    mindmap.addBranch(centralTopic);

    // Generate child topics recursively
    rootTopic.children?.forEach((topic, index) => {
      centralTopic.append(this.convertTopic(mindmap, topic, index));
    });

    this.addRelationships(mindmap, doc);

    return mindmap;
  }

  private convertTopic(mindmap: Mindmap, topic: MindManagerTopic, order: number): NodeModel {
    const node = mindmap.createNode('MainTopic', this.generateId());
    this.topicIdMap.set(topic.id, node.getId());
    const position = this.calculatePosition(order);
    node.setText(topic.text);
    node.setPosition(position.x, position.y);
    node.setOrder(order);
    node.setShapeType('line');

    // Add color if present
    if (topic.color) {
      node.setBackgroundColor(topic.color);
      node.setBorderColor(topic.color);
    }

    // Add icon if present
    if (topic.icon) {
      const emojiIcon = this.mapMindManagerIconToEmojiIcon(topic.icon);
      node.addFeature(FeatureModelFactory.createModel('eicon', { id: emojiIcon }));
    }

    // Add notes if present
    const noteContent = this.buildNoteContent(topic.notes);
    if (noteContent) {
      node.addFeature(new NoteModel({ text: noteContent }));
    }

    // Add hyperlink if present
    if (topic.hyperlink) {
      node.addFeature(FeatureModelFactory.createModel('link', { url: topic.hyperlink }));
    }

    // Generate child topics recursively
    topic.children?.forEach((child, index) => {
      node.append(this.convertTopic(mindmap, child, index));
    });

    return node;
  }

  /**
   * MindManager saves .mmap files as ZIP archives whose map is Document.xml. Plain XML is
   * accepted too.
   */
  private static readDocument(input: MindManagerRawInput): string {
    let bytes: Uint8Array;
    if (typeof input === 'string') {
      if (!input.startsWith('PK')) {
        return input;
      }
      // A binary string, as read by FileReader.readAsBinaryString.
      bytes = Uint8Array.from(input, (char) => char.charCodeAt(0) % 0x100);
    } else {
      bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
      const isZip = bytes.length > 1 && bytes[0] === 0x50 && bytes[1] === 0x4b; // "PK"
      if (!isZip) {
        return decodeUtf8(bytes);
      }
    }

    const isDocument = (name: string): boolean => name.toLowerCase() === 'document.xml';
    const files = unzipSync(bytes, { filter: (file) => isDocument(file.name) });
    const entry = Object.keys(files).find(isDocument);
    if (!entry) {
      throw new Error('The MindManager archive does not contain Document.xml');
    }
    return decodeUtf8(files[entry]);
  }

  private parseMindManagerXML(doc: Document): MindManagerTopic {
    // Find Map element by tag name (ignoring namespace)
    const mapElement = this.findElementByTagName(doc, 'Map');
    if (!mapElement) {
      throw new Error('Invalid MindManager XML: missing Map element');
    }

    // Find root Topic element. MindManager documents keep it in OneTopic.
    const oneTopic = this.findChildByTagName(mapElement, 'OneTopic');
    const rootTopic =
      (oneTopic && this.findChildByTagName(oneTopic, 'Topic')) ||
      this.findElementByTagName(mapElement, 'Topic');
    if (!rootTopic) {
      throw new Error('Invalid MindManager XML: missing root Topic');
    }

    return this.parseTopic(rootTopic);
  }

  private findElementByTagName(parent: Element | Document, tagName: string): Element | null {
    // Try direct query first
    const element = parent.querySelector(tagName);
    if (element) return element;

    // If not found, search all elements by tag name
    const allElements = parent.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      if (el.localName === tagName || el.tagName === tagName) {
        return el;
      }
    }
    return null;
  }

  // Only direct children: a descendant search would pick up the data of nested topics.
  private findChildByTagName(parent: Element, tagName: string): Element | null {
    return (
      Array.from(parent.children).find(
        (child) => child.localName === tagName || child.tagName === tagName,
      ) || null
    );
  }

  private findChildrenByTagName(parent: Element, tagName: string): Element[] {
    return Array.from(parent.children).filter(
      (child) => child.localName === tagName || child.tagName === tagName,
    );
  }

  // Topics are written as <Topic ID Text> or, by MindManager, as <ap:Topic OId> with the text,
  // notes and subtopics in child elements.
  private parseTopic(topicElement: Element): MindManagerTopic {
    const id =
      topicElement.getAttribute('ID') || topicElement.getAttribute('OId') || this.generateId();
    const textElement = this.findChildByTagName(topicElement, 'Text');
    const text =
      topicElement.getAttribute('Text') || textElement?.getAttribute('PlainText') || 'Untitled';

    const topic: MindManagerTopic = {
      id: id.toString(),
      text,
    };

    // Parse notes
    const notesElement = this.findChildByTagName(topicElement, 'Notes');
    const notesGroup = this.findChildByTagName(topicElement, 'NotesGroup');
    const notesData = notesGroup && this.findChildByTagName(notesGroup, 'NotesXhtmlData');
    if (notesElement) {
      topic.notes = notesElement.textContent || '';
    } else if (notesData) {
      topic.notes = notesData.getAttribute('PreviewPlainText') || '';
    }

    // Parse hyperlink
    const hyperlinkElement = this.findChildByTagName(topicElement, 'Hyperlink');
    if (hyperlinkElement) {
      topic.hyperlink =
        hyperlinkElement.getAttribute('URL') || hyperlinkElement.getAttribute('Url') || '';
    }

    // Parse icon
    const iconElement = this.findChildByTagName(topicElement, 'Icon');
    if (iconElement) {
      topic.icon = iconElement.getAttribute('Name') || iconElement.textContent || '';
    }

    // Parse color
    const colorElement = this.findChildByTagName(topicElement, 'Color');
    if (colorElement) {
      topic.color = colorElement.getAttribute('Value') || colorElement.textContent || '';
    }

    // Parse child topics: direct Topic children, or the Topics of SubTopics
    const subTopics = this.findChildByTagName(topicElement, 'SubTopics');
    const childTopics = [
      ...this.findChildrenByTagName(topicElement, 'Topic'),
      ...(subTopics ? this.findChildrenByTagName(subTopics, 'Topic') : []),
    ];

    if (childTopics.length > 0) {
      topic.children = childTopics.map((child) => this.parseTopic(child));
    }

    return topic;
  }

  private addRelationships(mindmap: Mindmap, doc: Document): void {
    const relationshipsElement = this.findElementByTagName(doc, 'Relationships');
    if (!relationshipsElement) return;

    this.findChildrenByTagName(relationshipsElement, 'Relationship').forEach((rel) => {
      this.addRelationship(mindmap, rel);
    });
  }

  // MindManager writes the ends of a relationship as ConnectionGroups (Index 0 and 1) that
  // reference the topic OIds.
  private connectionEnd(relationshipElement: Element, index: string): string | null {
    const group = this.findChildrenByTagName(relationshipElement, 'ConnectionGroup').find(
      (candidate) => candidate.getAttribute('Index') === index,
    );
    const connection = group && this.findChildByTagName(group, 'Connection');
    const reference = connection && this.findChildByTagName(connection, 'ObjectReference');
    return reference ? reference.getAttribute('OIdRef') : null;
  }

  private addRelationship(mindmap: Mindmap, relationshipElement: Element): void {
    const fromTopicId =
      relationshipElement.getAttribute('FromTopicID') ||
      this.connectionEnd(relationshipElement, '0');
    const toTopicId =
      relationshipElement.getAttribute('ToTopicID') || this.connectionEnd(relationshipElement, '1');
    const lineStyle = relationshipElement.getAttribute('LineStyle') || '';

    if (!fromTopicId || !toTopicId) return;

    // Map MindManager IDs to WiseMapping IDs
    const srcTopicId = this.topicIdMap.get(fromTopicId);
    const destTopicId = this.topicIdMap.get(toTopicId);

    if (!srcTopicId || !destTopicId) return;

    const relationship = mindmap.createRelationship(srcTopicId, destTopicId);

    // Map line style
    if (lineStyle === 'Dashed') {
      relationship.setStrokeStyle(StrokeStyle.DASHED);
    } else if (lineStyle === 'Dotted') {
      relationship.setStrokeStyle(StrokeStyle.DOTTED);
    } else if (lineStyle === 'Solid') {
      relationship.setStrokeStyle(StrokeStyle.SOLID);
    }

    mindmap.addRelationship(relationship);
  }

  public import(nameMap: string, _description?: string): Promise<string> {
    try {
      console.log(`Importing MindManager map: ${nameMap}, description: ${_description}`);

      // Reset counters and ID map
      this.idCounter = 1;
      this.topicIdMap.clear();

      const xmlContent = MindManagerImporter.readDocument(this.mindManagerInput);
      const doc = SecureXmlParser.parseSecureXml(xmlContent);
      if (!doc) {
        throw new Error('Failed to parse MindManager XML - content may be unsafe');
      }

      const rootTopic = this.parseMindManagerXML(doc);
      const mindmap = this.buildMindmap(rootTopic, nameMap, doc);

      return Promise.resolve(toWiseMappingXml(mindmap));
    } catch (error) {
      console.error('MindManager import failed:', error);
      return Promise.reject(ImportError.from(error, 'MindManager'));
    }
  }
}

export default MindManagerImporter;
