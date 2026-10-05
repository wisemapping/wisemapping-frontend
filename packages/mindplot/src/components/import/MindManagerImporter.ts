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
import INodeModel, { TopicShapeType } from '../model/INodeModel';
import ContentType from '../ContentType';
import HtmlSanitizer from '../security/HtmlSanitizer';
import { decodeUtf8 } from './support/Utf8Decoder';
import toWiseMappingXml from './support/MindmapXml';

interface MindManagerTopic {
  // Topics without an ID or OId can not be referenced, so they are not mapped.
  id?: string;
  text: string;
  notes?: string;
  // The XHTML of the note, sanitized. Preferred to the plain text notes.
  notesHtml?: string;
  hyperlink?: string;
  icons: string[];
  fillColor?: string;
  lineColor?: string;
  shape?: TopicShapeType;
  // TopicViewGroup/Collapsed: the subtopics are hidden.
  collapsed?: boolean;
  // In millimeters. For a floating topic, its position from the central topic. For a subtopic, a
  // layout hint: CX is the distance from the parent, its sign the side; CY is not a position.
  offset?: { x: number; y: number };
  children?: MindManagerTopic[];
  floating?: MindManagerTopic[];
}

// The prefix of the MindManager stock icon types (urn:mindjet:SmileyHappy) and task priorities.
const MINDJET_URN = 'urn:mindjet:';

// Offsets are in millimeters; WiseMapping positions are in pixels (96 dpi).
const PIXELS_PER_MILLIMETER = 96 / 25.4;

type MindManagerRawInput = string | ArrayBuffer | Uint8Array;

// The style defaults of a topic: those of the central topic and its subtopics, of the floating
// topics of the map or of the callouts of a topic (StyleGroup/RootTopicDefaultsGroup, ...).
type TopicKind = 'Root' | 'Label' | 'Callout';

// MindManager icon ids and the WiseMapping EmojiIcons they map to.
const MINDMANAGER_ICONS: Readonly<Record<string, string>> = {
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

  // Stock icons of the MindManager document schema (IconType="urn:mindjet:...")
  SmileyHappy: '😃',
  SmileyNeutral: '😐',
  SmileySad: '😢',
  SmileyAngry: '😠',
  SmileyScreaming: '😱',
  Clock: '🕐',
  Calendar: '📅',
  Letter: '✉️',
  Email: '📧',
  Mailbox: '📫',
  Megaphone: '📣',
  House: '🏠',
  Rolodex: '📇',
  Dollar: '💲',
  Euro: '💶',
  FlagRed: '🔴',
  FlagBlue: '🔵',
  FlagGreen: '🟢',
  FlagBlack: '⚫',
  FlagOrange: '🟠',
  FlagYellow: '🟡',
  FlagPurple: '🟣',
  TrafficLightsRed: '🚦',
  PadlockLocked: '🔒',
  PadlockUnlocked: '🔓',
  ArrowUp: '⬆️',
  ArrowDown: '⬇️',
  ArrowLeft: '⬅️',
  ArrowRight: '➡️',
  TwoEndArrow: '↔️',
  Phone: '📞',
  Cellphone: '📱',
  Camera: '📷',
  Fax: '📠',
  Stop: '🛑',
  ExclamationMark: '❗',
  QuestionMark: '❓',
  ThumbsUp: '👍',
  ThumbsDown: '👎',
  OnHold: '⏸️',
  Hourglass: '⏳',
  Emergency: '🚨',
  NoEntry: '⛔',
  Bomb: '💣',
  Key: '🔑',
  Glasses: '👓',
  JudgeHammer: '🔨',
  Rocket: '🚀',
  Scales: '⚖️',
  Redo: '🔁',
  Lightbulb: '💡',
  CoffeeCup: '☕',
  TwoFeet: '👣',
  Meeting: '👥',
  Check: '✅',
  Note: '📝',
  Book: '📖',
  MagnifyingGlass: '🔍',
  BrokenConnection: '⛓️',
  Information: 'ℹ️',
  Folder: '📁',
  // Task priorities (TaskPriority="urn:mindjet:Prio1")
  Prio1: '🔴',
  Prio2: '🟡',
  Prio3: '🟢',
  Prio4: '🔵',
  Prio5: '🟣',
  Prio6: '6️⃣',
  Prio7: '7️⃣',
  Prio8: '8️⃣',
  Prio9: '9️⃣',
};

// The same icons by lower case id: the ids are matched ignoring case. Only own entries, as a
// Map: a plain object would map 'constructor' to the Object function.
const MINDMANAGER_ICONS_BY_LOWER_CASE: ReadonlyMap<string, string> = new Map(
  Object.entries(MINDMANAGER_ICONS).map(([id, emoji]) => [id.toLowerCase(), emoji]),
);

class MindManagerImporter extends Importer {
  private mindManagerInput: MindManagerRawInput;

  private idCounter: number = 1;

  private topicIdMap: Map<string, number>;

  private styleGroup: Element | null = null;

  // 1 or -1 when every main topic grows on the right or on the left of the central topic.
  private mainTopicsSide: number | undefined;

  constructor(map: MindManagerRawInput) {
    super();
    this.mindManagerInput = map;
    this.topicIdMap = new Map();
  }

  private generateId(): number {
    return this.idCounter++;
  }

  // The initial position of the topic at the given index among the siblings on its side. The
  // layout places the topics by their order.
  private calculatePosition(sideIndex: number, side: number): { x: number; y: number } {
    const x = side * (200 + sideIndex * 100);
    const y = sideIndex * 75;

    return { x, y };
  }

  private buildNoteContent(notes?: string): string {
    if (!notes) return '';
    return notes.trim();
  }

  // The emoji of a MindManager icon id, its own or the one of its id in another case. Undefined
  // for an unknown icon.
  private static mapMindManagerIconToEmojiIcon(iconId: string): string | undefined {
    return Object.prototype.hasOwnProperty.call(MINDMANAGER_ICONS, iconId)
      ? MINDMANAGER_ICONS[iconId]
      : MINDMANAGER_ICONS_BY_LOWER_CASE.get(iconId.toLowerCase());
  }

  private buildMindmap(rootTopic: MindManagerTopic, nameMap: string, doc: Document): Mindmap {
    const mindmap = new Mindmap(nameMap);
    mindmap.setTheme('prism');
    mindmap.setLayout('mindmap');

    const centralTopic = mindmap.createNode('CentralTopic', this.generateId());
    this.mapTopicId(rootTopic, centralTopic);
    centralTopic.setText(rootTopic.text);
    this.addFeatures(centralTopic, rootTopic);
    mindmap.addBranch(centralTopic);

    // The main topics go on the side of the growth direction of the central topic or, if it grows
    // on both sides, on the side of their offset or, without one, on the side with fewer topics.
    let right = 0;
    let left = 0;
    const atLeft = (rootTopic.children ?? []).map((topic) => {
      let result: boolean;
      if (this.mainTopicsSide) {
        result = this.mainTopicsSide < 0;
      } else {
        result = topic.offset ? topic.offset.x < 0 : left < right;
      }
      if (result) {
        left++;
      } else {
        right++;
      }
      return result;
    });

    // Even orders are on the right, odd ones on the left, from top to bottom. On both sides,
    // MindManager lays them out clockwise: the right ones in document order from the top, the left
    // ones from the bottom.
    const clockwise = !this.mainTopicsSide;
    let rightIndex = 0;
    let leftIndex = 0;
    rootTopic.children?.forEach((topic, index) => {
      let sideIndex: number;
      if (!atLeft[index]) {
        sideIndex = rightIndex++;
      } else {
        sideIndex = clockwise ? left - 1 - leftIndex : leftIndex;
        leftIndex++;
      }
      const order = atLeft[index] ? 2 * sideIndex + 1 : 2 * sideIndex;
      centralTopic.append(
        this.convertTopic(mindmap, topic, order, sideIndex, atLeft[index] ? -1 : 1),
      );
    });

    // Floating topics are isolated topics, placed at their offset from the central topic.
    rootTopic.floating?.forEach((topic, index) => {
      const node = this.convertTopic(mindmap, topic, index, index, 1);
      const offset = topic.offset ?? { x: 0, y: (index + 1) * 100 };
      node.setPosition(
        Math.round(offset.x * PIXELS_PER_MILLIMETER),
        Math.round(offset.y * PIXELS_PER_MILLIMETER),
      );
      mindmap.addBranch(node);
    });

    this.addRelationships(mindmap, doc);

    return mindmap;
  }

  private convertTopic(
    mindmap: Mindmap,
    topic: MindManagerTopic,
    order: number,
    sideIndex: number,
    side: number,
  ): NodeModel {
    const node = mindmap.createNode('MainTopic', this.generateId());
    this.mapTopicId(topic, node);
    const position = this.calculatePosition(sideIndex, side);
    node.setText(topic.text);
    node.setPosition(position.x, position.y);
    node.setOrder(order);
    // Without a StyleGroup, topics are lines.
    node.setShapeType(topic.shape ?? 'line');
    this.addFeatures(node, topic);

    // The floating topics of a topic are callouts attached to it: they are imported as its
    // children. Their Offset is their position from the topic: the callouts above it (negative
    // CY) go before its subtopics, the others after them.
    const callouts = topic.floating ?? [];
    const isAbove = (callout: MindManagerTopic): boolean => (callout.offset?.y ?? 0) < 0;
    const children = [
      ...callouts.filter(isAbove),
      ...(topic.children ?? []),
      ...callouts.filter((callout) => !isAbove(callout)),
    ];

    // Generate child topics recursively. They are on the side of their parent.
    children.forEach((child, index) => {
      node.append(this.convertTopic(mindmap, child, index, index, side));
    });

    if (topic.collapsed && node.getChildren().length > 0) {
      node.setChildrenShrunken(true);
    }

    return node;
  }

  private mapTopicId(topic: MindManagerTopic, node: NodeModel): void {
    if (topic.id) {
      this.topicIdMap.set(topic.id, node.getId());
    }
  }

  // The colors, icons, notes and link of a topic, the central one included.
  private addFeatures(node: NodeModel, topic: MindManagerTopic): void {
    if (topic.fillColor) {
      node.setBackgroundColor(topic.fillColor);
    }
    const borderColor = topic.lineColor || topic.fillColor;
    if (borderColor) {
      node.setBorderColor(borderColor);
    }

    topic.icons.forEach((icon) => {
      const emojiIcon = MindManagerImporter.mapMindManagerIconToEmojiIcon(icon);
      if (emojiIcon) {
        node.addFeature(FeatureModelFactory.createModel('eicon', { id: emojiIcon }));
      } else {
        console.warn(`MindManager icon '${icon}' has no emoji: it is not imported.`);
      }
    });

    if (topic.notesHtml) {
      const note = new NoteModel({ text: topic.notesHtml });
      note.setContentType(ContentType.HTML);
      node.addFeature(note);
    } else {
      const noteContent = this.buildNoteContent(topic.notes);
      if (noteContent) {
        node.addFeature(new NoteModel({ text: noteContent }));
      }
    }

    if (topic.hyperlink) {
      node.addFeature(FeatureModelFactory.createModel('link', { url: topic.hyperlink }));
    }
  }

  /**
   * MindManager colors are 4 bytes in hex, alpha first (ff96b3df). A transparent color is no
   * color. Colors written as #rrggbb are kept.
   */
  private static toColor(color: string | null | undefined): string | undefined {
    const value = color?.trim();
    if (!value) {
      return undefined;
    }
    const argb = /^([0-9a-f]{2})([0-9a-f]{6})$/i.exec(value);
    if (argb) {
      return argb[1] === '00' ? undefined : `#${argb[2].toLowerCase()}`;
    }
    return value;
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

    this.styleGroup = this.findChildByTagName(mapElement, 'StyleGroup');
    this.mainTopicsSide = this.growthSide(rootTopic);
    return this.parseTopic(rootTopic, 'Root', 0);
  }

  /**
   * The style defaults of a topic in the StyleGroup: the ${kind}TopicDefaultsGroup for a topic
   * at depth 0 (the central topic, a floating topic or a callout), and the
   * ${kind}SubTopicDefaultsGroup of the Level (depth - 1) for its subtopics. The deepest level
   * that is defined applies below it.
   */
  private defaultsGroup(kind: TopicKind, depth: number): Element | null {
    if (!this.styleGroup) {
      return null;
    }
    if (depth === 0) {
      return this.findChildByTagName(this.styleGroup, `${kind}TopicDefaultsGroup`);
    }
    const levels = this.findChildrenByTagName(this.styleGroup, `${kind}SubTopicDefaultsGroup`)
      .map((group) => ({ group, level: Number(group.getAttribute('Level')) }))
      .filter(({ level }) => Number.isInteger(level) && level <= depth - 1)
      .sort((a, b) => b.level - a.level);
    return levels.length > 0 ? levels[0].group : null;
  }

  /**
   * The side where the main topics grow: the SubTopicsGrowthDirection of the SubTopicsShape of the
   * central topic, or of the DefaultSubTopicsShape of the RootTopicDefaultsGroup. 1 for Right, -1
   * for Left, undefined for both sides (LeftAndRight, AutomaticHorizontal).
   */
  private growthSide(rootTopic: Element): number | undefined {
    const attribute = 'SubTopicsGrowthDirection';
    const own = this.findChildByTagName(rootTopic, 'SubTopicsShape')?.getAttribute(attribute);
    const defaults = this.defaultsGroup('Root', 0);
    const byDefault =
      defaults &&
      this.findChildByTagName(defaults, 'DefaultSubTopicsShape')?.getAttribute(attribute);
    switch ((own || byDefault)?.replace(MINDJET_URN, '')) {
      case 'Right':
        return 1;
      case 'Left':
        return -1;
      default:
        return undefined;
    }
  }

  /**
   * MindManager does not write the text of a topic that keeps the default one of its level, for
   * example "Main Topic". The default is the PlainText of the DefaultText of the defaults group
   * of the topic.
   */
  private defaultText(kind: TopicKind, depth: number): string | undefined {
    const defaults = this.defaultsGroup(kind, depth);
    const text = defaults && this.findChildByTagName(defaults, 'DefaultText');
    return text?.getAttribute('PlainText') || undefined;
  }

  /**
   * The shape of a topic: its own SubTopicShape, or the DefaultSubTopicShape of the defaults group
   * of its level. Floating topics and callouts have a LabelFloatingTopicShape or a
   * CalloutFloatingTopicShape, by default the one of the Label or CalloutTopicDefaultsGroup (the
   * ones of the RootTopicDefaultsGroup are not those MindManager draws). Undefined for the
   * central topic, which keeps the shape of the theme, or when there is no shape that maps.
   */
  private topicShape(
    topicElement: Element,
    kind: TopicKind,
    depth: number,
  ): TopicShapeType | undefined {
    if (depth === 0 && kind === 'Root') {
      return undefined;
    }
    const name = depth === 0 ? `${kind}FloatingTopicShape` : 'SubTopicShape';
    const defaults = this.defaultsGroup(kind, depth);
    const own = this.findChildByTagName(topicElement, name)?.getAttribute(name);
    const byDefault = defaults && this.findChildByTagName(defaults, `Default${name}`);
    return (
      MindManagerImporter.toShapeType(own) ??
      MindManagerImporter.toShapeType(byDefault?.getAttribute(name))
    );
  }

  // The shape of a SubTopicShape, LabelFloatingTopicShape or CalloutFloatingTopicShape
  // (urn:mindjet:RoundedRectangle, ...), undefined if it is not one.
  private static toShapeType(shape: string | null | undefined): TopicShapeType | undefined {
    switch (shape?.replace(MINDJET_URN, '')) {
      case 'None':
        return 'none';
      case 'Line':
      case 'CalloutLine':
        return 'line';
      case 'RoundedRectangle':
      case 'RoundedRectangleBalloon':
      case 'Capsule':
        return 'rounded rectangle';
      case 'Circle':
      case 'Oval':
      case 'OvalBalloon':
      case 'ThoughtBubble':
        return 'elipse';
      case 'Rectangle':
      case 'RectangleBalloon':
      case 'Highlight':
      case 'Hexagon':
      case 'Octagon':
      case 'Diamond':
      case 'Data':
      case 'Database':
      case 'PredefinedProcess':
      case 'Document':
        return 'rectangle';
      default:
        return undefined;
    }
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
  private parseTopic(topicElement: Element, kind: TopicKind, depth: number): MindManagerTopic {
    const id = topicElement.getAttribute('ID') || topicElement.getAttribute('OId') || undefined;
    const textElement = this.findChildByTagName(topicElement, 'Text');
    const text =
      topicElement.getAttribute('Text') ||
      textElement?.getAttribute('PlainText') ||
      this.defaultText(kind, depth) ||
      'Untitled';

    const topic: MindManagerTopic = {
      id,
      text,
      icons: [],
      shape: this.topicShape(topicElement, kind, depth),
    };

    // Parse notes
    const notesElement = this.findChildByTagName(topicElement, 'Notes');
    const notesGroup = this.findChildByTagName(topicElement, 'NotesGroup');
    const notesData = notesGroup && this.findChildByTagName(notesGroup, 'NotesXhtmlData');
    if (notesElement) {
      topic.notes = notesElement.textContent || '';
    } else if (notesData) {
      topic.notesHtml = MindManagerImporter.notesHtml(notesData);
      topic.notes = notesData.getAttribute('PreviewPlainText') || '';
    }

    // Parse hyperlink. A link to a topic of the map (#xpointer(...ap:Topic[@OId=...])) can not be
    // opened from WiseMapping: it is skipped.
    const hyperlinkElement = this.findChildByTagName(topicElement, 'Hyperlink');
    const url = hyperlinkElement?.getAttribute('URL') || hyperlinkElement?.getAttribute('Url');
    if (url && !url.startsWith('#')) {
      topic.hyperlink = url;
    }

    // Parse icons: <Icon Name>, or the stock icons of IconsGroup/Icons and the task priority
    const iconElement = this.findChildByTagName(topicElement, 'Icon');
    const iconName = iconElement && (iconElement.getAttribute('Name') || iconElement.textContent);
    if (iconName) {
      topic.icons.push(iconName);
    }
    const iconsGroup = this.findChildByTagName(topicElement, 'IconsGroup');
    const icons = iconsGroup && this.findChildByTagName(iconsGroup, 'Icons');
    (icons ? this.findChildrenByTagName(icons, 'Icon') : []).forEach((icon) => {
      const iconType = icon.getAttribute('IconType');
      if (iconType) {
        topic.icons.push(iconType.replace(MINDJET_URN, ''));
      } else {
        // A custom icon (xsi:type="ap:CustomIcon") is an image of the file, identified by its
        // IconSignature: it has no emoji.
        console.warn(
          `MindManager custom icon '${icon.getAttribute('IconSignature') ?? ''}' of topic '${topic.text}' is not imported.`,
        );
      }
    });
    const priority = this.findChildByTagName(topicElement, 'Task')?.getAttribute('TaskPriority');
    if (priority) {
      topic.icons.push(priority.replace(MINDJET_URN, ''));
    }

    // Parse colors: <Color Value>, or the FillColor and LineColor of the document schema
    const colorElement = this.findChildByTagName(topicElement, 'Color');
    if (colorElement) {
      topic.fillColor = MindManagerImporter.toColor(
        colorElement.getAttribute('FillColor') ||
          colorElement.getAttribute('Value') ||
          colorElement.textContent,
      );
      topic.lineColor = MindManagerImporter.toColor(colorElement.getAttribute('LineColor'));
    }

    // Collapsed in the first view (ViewIndex 0), the one MindManager opens
    const views = this.findChildrenByTagName(topicElement, 'TopicViewGroup');
    const view = views.find((group) => group.getAttribute('ViewIndex') === '0') ?? views[0];
    const collapsed = view && this.findChildByTagName(view, 'Collapsed');
    if (collapsed?.getAttribute('Collapsed') === 'true') {
      topic.collapsed = true;
    }

    const offsetElement = this.findChildByTagName(topicElement, 'Offset');
    if (offsetElement) {
      topic.offset = {
        x: Number(offsetElement.getAttribute('CX')) || 0,
        y: Number(offsetElement.getAttribute('CY')) || 0,
      };
    }

    // Parse child topics: direct Topic children, or the Topics of SubTopics
    const subTopics = this.findChildByTagName(topicElement, 'SubTopics');
    const childTopics = [
      ...this.findChildrenByTagName(topicElement, 'Topic'),
      ...(subTopics ? this.findChildrenByTagName(subTopics, 'Topic') : []),
    ];

    if (childTopics.length > 0) {
      topic.children = childTopics.map((child) => this.parseTopic(child, kind, depth + 1));
    }

    // The floating topics of the central topic are the floating topics of the map; those of any
    // other topic are its callouts.
    const floatingTopics = this.findChildByTagName(topicElement, 'FloatingTopics');
    if (floatingTopics) {
      const floatingKind = kind === 'Root' && depth === 0 ? 'Label' : 'Callout';
      topic.floating = this.findChildrenByTagName(floatingTopics, 'Topic').map((child) =>
        this.parseTopic(child, floatingKind, 0),
      );
    }

    return topic;
  }

  /**
   * NotesXhtmlData holds the note as an XHTML document (<html xmlns="http://www.w3.org/1999/xhtml">).
   * It is sanitized like FreeMind notes, which drops the <html> and <body> wrappers and any script.
   * Undefined if there is no XHTML, or it can not be sanitized: the preview text is used instead.
   */
  private static notesHtml(notesData: Element): string | undefined {
    if (notesData.children.length === 0) {
      return undefined;
    }
    try {
      return HtmlSanitizer.sanitize(notesData.innerHTML).trim() || undefined;
    } catch (error) {
      console.warn('MindManager note could not be imported as HTML:', error);
      return undefined;
    }
  }

  private addRelationships(mindmap: Mindmap, doc: Document): void {
    const relationshipsElement = this.findElementByTagName(doc, 'Relationships');
    if (!relationshipsElement) return;

    // The style of the relationships that do not have their own (StyleGroup/RelationshipDefaultsGroup)
    const defaults = this.findElementByTagName(doc, 'RelationshipDefaultsGroup');
    const defaultLineStyle = defaults && this.findChildByTagName(defaults, 'DefaultLineStyle');
    const defaultStrokeStyle =
      MindManagerImporter.toStrokeStyle(defaultLineStyle?.getAttribute('LineDashStyle')) ??
      // MindManager draws relationships dashed by default.
      StrokeStyle.DASHED;

    this.findChildrenByTagName(relationshipsElement, 'Relationship').forEach((rel) => {
      this.addRelationship(mindmap, rel, defaults, defaultStrokeStyle);
    });
  }

  /**
   * The stroke style of a LineDashStyle (urn:mindjet:Solid, RoundDot, SquareDot, Dash, DashDot,
   * LongDash, LongDashDot, LongDashDotDot), undefined if it is not one.
   */
  private static toStrokeStyle(lineDashStyle: string | null | undefined): StrokeStyle | undefined {
    switch (lineDashStyle?.replace(MINDJET_URN, '')) {
      case 'Solid':
        return StrokeStyle.SOLID;
      case 'RoundDot':
      case 'SquareDot':
        return StrokeStyle.DOTTED;
      case 'Dash':
      case 'DashDot':
      case 'LongDash':
      case 'LongDashDot':
      case 'LongDashDotDot':
        return StrokeStyle.DASHED;
      default:
        return undefined;
    }
  }

  // MindManager writes the ends of a relationship as ConnectionGroups (Index 0 and 1).
  private connectionGroup(relationshipElement: Element, index: string): Element | undefined {
    return this.findChildrenByTagName(relationshipElement, 'ConnectionGroup').find(
      (candidate) => candidate.getAttribute('Index') === index,
    );
  }

  // The topic OId referenced by an end of a relationship.
  private connectionEnd(relationshipElement: Element, index: string): string | null {
    const group = this.connectionGroup(relationshipElement, index);
    const connection = group && this.findChildByTagName(group, 'Connection');
    const reference = connection && this.findChildByTagName(connection, 'ObjectReference');
    return reference ? reference.getAttribute('OIdRef') : null;
  }

  /**
   * Whether an end of a relationship (Index 0 its start, 1 its end) has an arrow: the
   * ConnectionShape (urn:mindjet:NoArrow, Arrow, OpenArrow...) of its ConnectionStyle, or of the
   * DefaultConnectionStyle of the same Index. Undefined if neither is written.
   */
  private hasArrow(
    relationshipElement: Element,
    defaults: Element | null,
    index: string,
  ): boolean | undefined {
    const group = this.connectionGroup(relationshipElement, index);
    const own = group && this.findChildByTagName(group, 'ConnectionStyle');
    const byDefault =
      defaults &&
      this.findChildrenByTagName(defaults, 'DefaultConnectionStyle').find(
        (style) => style.getAttribute('Index') === index,
      );
    const shape =
      own?.getAttribute('ConnectionShape') || byDefault?.getAttribute('ConnectionShape');
    return shape ? shape.replace(MINDJET_URN, '') !== 'NoArrow' : undefined;
  }

  private addRelationship(
    mindmap: Mindmap,
    relationshipElement: Element,
    defaults: Element | null,
    defaultStrokeStyle: StrokeStyle,
  ): void {
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

    // Map line style: the LineStyle attribute, or the LineDashStyle of the LineStyle element of
    // the document schema
    const lineStyleElement = this.findChildByTagName(relationshipElement, 'LineStyle');
    if (lineStyle === 'Dashed') {
      relationship.setStrokeStyle(StrokeStyle.DASHED);
    } else if (lineStyle === 'Dotted') {
      relationship.setStrokeStyle(StrokeStyle.DOTTED);
    } else if (lineStyle === 'Solid') {
      relationship.setStrokeStyle(StrokeStyle.SOLID);
    } else {
      relationship.setStrokeStyle(
        MindManagerImporter.toStrokeStyle(lineStyleElement?.getAttribute('LineDashStyle')) ??
          defaultStrokeStyle,
      );
    }

    // The LineColor of its Color, or of the DefaultColor of the RelationshipDefaultsGroup
    const color = this.findChildByTagName(relationshipElement, 'Color');
    const defaultColor = defaults && this.findChildByTagName(defaults, 'DefaultColor');
    const strokeColor =
      MindManagerImporter.toColor(color?.getAttribute('LineColor')) ??
      MindManagerImporter.toColor(defaultColor?.getAttribute('LineColor'));
    if (strokeColor) {
      relationship.setStrokeColor(strokeColor);
    }

    // Without a ConnectionStyle, the arrow is at the end, as in the model.
    const startArrow = this.hasArrow(relationshipElement, defaults, '0');
    if (startArrow !== undefined) {
      relationship.setStartArrow(startArrow);
    }
    const endArrow = this.hasArrow(relationshipElement, defaults, '1');
    if (endArrow !== undefined) {
      relationship.setEndArrow(endArrow);
    }

    mindmap.addRelationship(relationship);
    this.addRelationshipLabels(mindmap, relationshipElement, srcTopicId, destTopicId);
  }

  /**
   * WiseMapping relationships have no text: the labels of a relationship (its FloatingTopics) are
   * imported as floating topics in the middle of its ends, moved by their Offset (in the real
   * files, a few millimeters from the middle of the relationship).
   */
  private addRelationshipLabels(
    mindmap: Mindmap,
    relationshipElement: Element,
    srcTopicId: number,
    destTopicId: number,
  ): void {
    const floatingTopics = this.findChildByTagName(relationshipElement, 'FloatingTopics');
    if (!floatingTopics) {
      return;
    }
    const src = MindManagerImporter.approximatePosition(mindmap.findNodeById(srcTopicId));
    const dest = MindManagerImporter.approximatePosition(mindmap.findNodeById(destTopicId));
    this.findChildrenByTagName(floatingTopics, 'Topic').forEach((labelElement, index) => {
      const label = this.parseTopic(labelElement, 'Label', 0);
      // MindManager draws them as plain text, not with the shape of the floating topics.
      const shape = this.findChildByTagName(labelElement, 'LabelFloatingTopicShape');
      label.shape =
        MindManagerImporter.toShapeType(shape?.getAttribute('LabelFloatingTopicShape')) ?? 'none';
      const node = this.convertTopic(mindmap, label, index, index, 1);
      const offset = label.offset ?? { x: 0, y: 0 };
      node.setPosition(
        Math.round((src.x + dest.x) / 2 + offset.x * PIXELS_PER_MILLIMETER),
        Math.round((src.y + dest.y) / 2 + offset.y * PIXELS_PER_MILLIMETER),
      );
      mindmap.addBranch(node);
    });
  }

  // Where a topic is, roughly: the layout places the topics again, but the import positions of a
  // topic and of its ancestors add up to its side and distance from the central topic.
  private static approximatePosition(node: INodeModel | undefined): { x: number; y: number } {
    let x = 0;
    let y = 0;
    for (
      let current: INodeModel | null | undefined = node;
      current;
      current = current.getParent()
    ) {
      const position = current.getPosition();
      x += position?.x ?? 0;
      y += position?.y ?? 0;
    }
    return { x, y };
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
