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

/**
 * XMind Importer for WiseMapping
 *
 * This importer provides comprehensive support for importing XMind mind maps into WiseMapping format.
 * It handles both XMind XML format (legacy) and XMind JSON format (modern) files.
 *
 * ## Supported XMind Features:
 *
 * ### 📝 Content Mapping:
 * - **Topics**: All topic hierarchies are preserved with proper parent-child relationships
 * - **Notes**: XMind notes are converted to WiseMapping notes with rich HTML support
 * - **Labels**: XMind labels (categorization tags) are preserved as `🏷️ label-name`
 * - **Markers**: XMind markers (visual indicators) are preserved as `🔖 marker-name`
 * - **Icons**: XMind markers are mapped to WiseMapping emoji icons, or to SVG icons (task progress, flags)
 *
 * ### 🎨 Styling Support:
 * - **Background Colors**: XMind `svg:fill` colors are mapped to WiseMapping `bgColor`
 * - **Border Colors**: XMind border colors are mapped to WiseMapping `brColor`
 * - **Topic Shapes**: All topics use `shape="line"` for consistent appearance
 * - **Positioning**: Intelligent circular positioning for child topics
 *
 * ### 📊 Data Integrity:
 * - **Deterministic IDs**: Incremental ID generation ensures consistent import results
 * - **No Data Loss**: All XMind metadata is preserved and converted appropriately
 * - **Single Note Constraint**: Multiple XMind elements (notes, labels, markers) are intelligently
 *   combined into a single WiseMapping note to respect architectural constraints
 *
 * ### 🔄 Format Support:
 * - **XMind XML**: Legacy XMind format with `<notes><plain>` and `<markers>` elements
 * - **XMind JSON**: Modern XMind format with `labels` arrays and style properties
 * - **ZIP Archives**: Both formats are extracted from XMind ZIP file structure
 *
 * ## Note Content Strategy:
 *
 * When a topic has multiple XMind elements, they're combined into one WiseMapping note:
 * ```
 * [XMind Note Content]
 * 🔖 marker1, 🔖 marker2
 * 🏷️ label1, 🏷️ label2
 * ```
 *
 * This ensures maximum data preservation while respecting WiseMapping's single-note-per-topic limitation.
 *
 * ## Example Usage:
 * ```typescript
 * const importer = new XMindImporter(xmindFileContent);
 * const wisemappingXML = await importer.import('My Mind Map', 'Description');
 * ```
 */
import type { LayoutType } from '../layout/LayoutType';
import Importer from './Importer';
import ImportError from './ImportError';
import SecureXmlParser from '../security/SecureXmlParser';
import Mindmap from '../model/Mindmap';
import type NodeModel from '../model/NodeModel';
import NoteModel from '../model/NoteModel';
import FeatureModelFactory from '../model/FeatureModelFactory';
import { decodeUtf8, tryDecodeUtf8 } from './support/Utf8Decoder';
import toWiseMappingXml from './support/MindmapXml';
import TopicIdSequence from './support/TopicIdSequence';
import readZipEntries from './support/ZipEntries';
import { ownEntry, PRIORITY_EMOJIS } from './support/IconEmoji';
import { alternatingSidePosition } from './support/MainTopicPosition';
import type PositionType from '../PositionType';

// XMind data structures
interface XMindTopic {
  id: string;
  title: string;
  children?: {
    attached?: XMindTopic[];
    // Floating topics, only on the root topic.
    detached?: XMindTopic[];
  };
  position?: { x: number; y: number };
  notes?: { plain?: { content?: string } };
  markers?: { markerId?: string }[];
  structureClass?: string;
  style?: {
    id: string;
    properties?: {
      'svg:fill'?: string;
      'border-line-width'?: string;
      'border-line-pattern'?: string;
    };
  };
  labels?: string[];
  href?: string;
}

interface XMindExtension {
  provider: string;
  content?: Record<string, unknown>;
}

interface XMindRelationship {
  id: string;
  end1Id: string;
  end2Id: string;
  title?: string;
}

interface XMindSheet {
  id: string;
  revisionId?: string;
  class: string;
  rootTopic: XMindTopic;
  title?: string;
  topicOverlapping?: string;
  compactLayoutModeLevel?: string;
  extensions?: XMindExtension[];
  relationships?: XMindRelationship[];
}

type XMindRawInput = string | ArrayBuffer | Uint8Array;

type DetectedInput = { kind: 'xml'; xml: string } | { kind: 'json'; sheet: XMindSheet };

const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';

// Cap on the uncompressed size of the archive entries that are inflated. A content.json of a map
// with thousands of topics is a few MB; anything bigger is rejected rather than inflated.
const MAX_XMIND_CONTENT_BYTES = 50 * 1024 * 1024;

// The only archive entries the importer reads. Thumbnails, attachments and other resources are
// never inflated.
const isXMindContentEntry = (name: string): boolean =>
  name.endsWith('content.json') || name.endsWith('content.xml');

const sameEmoji = (ids: string[], emoji: string): Record<string, string> =>
  Object.fromEntries(ids.map((id) => [id, emoji]));

// The colors of the flag, star, half star and people markers.
const MARKER_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'dark-green',
  'blue',
  'dark-blue',
  'purple',
  'gray',
  'dark-gray',
];

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const WEEK_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * The XMind marker ids (the markers of xmind-sdk-js, src/common/constants/marker.ts, which XMind 8
 * and XMind Zen write) and their emoji icons. A marker is imported as the WiseMapping SVG icon of
 * XMIND_MARKER_SVG_ICONS when it has one: the emoji is then only written in the note of the topic.
 */
export const XMIND_MARKER_EMOJIS: Readonly<Record<string, string>> = {
  // Priorities: the five colors MindManager's are imported as, then the number.
  ...PRIORITY_EMOJIS,
  'priority-6': '6️⃣',
  'priority-7': '7️⃣',
  'priority-8': '8️⃣',
  'priority-9': '9️⃣',

  'smiley-laugh': '😆',
  'smiley-smile': '🙂',
  'smiley-cry': '😢',
  'smiley-surprise': '😮',
  'smiley-boring': '😑',
  'smiley-angry': '😠',
  'smiley-embarrass': '😳',

  // Task progress, from not started to done, and paused.
  'task-start': '▶️',
  ...sameEmoji(
    ['task-oct', 'task-quarter', 'task-3oct', 'task-half', 'task-5oct', 'task-3quar', 'task-7oct'],
    '⏳',
  ),
  'task-done': '✅',
  'task-pause': '⏸️',

  // There are no colored flag, star or people emoji.
  ...sameEmoji(
    MARKER_COLORS.filter((color) => !color.endsWith('gray')).map((color) => `flag-${color}`),
    '🚩',
  ),
  'flag-gray': '🏳️',
  'flag-dark-gray': '🏴',
  ...sameEmoji(
    MARKER_COLORS.map((color) => `star-${color}`),
    '⭐',
  ),
  ...sameEmoji(
    ['green', 'red', 'yellow', 'purple', 'blue', 'gray'].map((color) => `half-star-${color}`),
    '⭐',
  ),
  ...sameEmoji(
    MARKER_COLORS.map((color) => `people-${color}`),
    '👤',
  ),

  'arrow-left': '⬅️',
  'arrow-right': '➡️',
  'arrow-up': '⬆️',
  'arrow-down': '⬇️',
  'arrow-left-right': '↔️',
  'arrow-up-down': '↕️',
  'arrow-refresh': '🔄',
  'arrow-up-right': '↗️',
  'arrow-down-right': '↘️',
  'arrow-down-left': '↙️',
  'arrow-up-left': '↖️',

  // Symbols: XMind Zen writes the c_symbol_ and c_simbol- ones.
  c_symbol_heart: '❤️',
  c_symbol_dislike: '👎',
  c_symbol_like: '👍',
  c_symbol_music: '🎵',
  c_symbol_lock: '🔒',
  c_symbol_hourglass: '⏳',
  c_symbol_broken_heart: '💔',
  c_symbol_quote: '💬',
  c_symbol_contact: '📇',
  c_symbol_telephone: '📞',
  c_symbol_pen: '🖊️',
  c_symbol_money: '💰',
  c_symbol_bar_chart: '📊',
  c_symbol_pie_chart: '📊',
  c_symbol_line_graph: '📈',
  c_symbol_shopping_cart: '🛒',
  c_symbol_medals: '🏅',
  c_symbol_trophy: '🏆',
  c_symbol_exercise: '🏋️',
  c_symbol_flight: '✈️',
  c_symbol_thermometer: '🌡️',
  ...sameEmoji(['symbol-question', 'c_simbol-question'], '❓'),
  ...sameEmoji(['symbol-exclam', 'c_simbol-exclam'], '❗'),
  ...sameEmoji(['symbol-info', 'c_simbol-info'], 'ℹ️'),
  ...sameEmoji(['symbol-wrong', 'c_simbol-wrong'], '❌'),
  ...sameEmoji(['symbol-right', 'c_simbol-right'], '✅'),
  ...sameEmoji(['symbol-pause', 'c_simbol-pause'], '⏸️'),
  ...sameEmoji(['symbol-plus', 'c_simbol-plus'], '➕'),
  ...sameEmoji(['symbol-minus', 'c_simbol-minus'], '➖'),
  'symbol-attention': '⚠️',
  'symbol-no-entry': '⛔',
  'symbol-divide': '➗',
  'symbol-equality': '🟰',
  'symbol-code': '💻',
  'symbol-image': '🖼️',
  'symbol-pin': '📌',

  // There are no emoji of a month or a day of the week.
  ...sameEmoji(
    MONTHS.map((month) => `month-${month}`),
    '📅',
  ),
  ...sameEmoji(
    WEEK_DAYS.map((day) => `week-${day}`),
    '📅',
  ),

  'other-calendar': '📅',
  'other-email': '📧',
  'other-phone': '📞',
  'other-phone2': '📱',
  'other-fax': '📠',
  'other-people': '👤',
  'other-people2': '👥',
  'other-clock': '🕐',
  'other-coffee-cup': '☕',
  'other-question': '❓',
  'other-exclam': '❗',
  'other-lightbulb': '💡',
  'other-businesscard': '📇',
  'other-social': '🌐',
  'other-chat': '💬',
  'other-note': '📝',
  'other-lock': '🔒',
  'other-unlock': '🔓',
  'other-yes': '✔️',
  'other-no': '✖️',
  'other-bomb': '💣',
};

/**
 * The XMind markers imported as a WiseMapping SVG icon: the task progress, as the task icons
 * MindManager's TaskPercentage is imported as, at the quarter at or below it, so that only a done
 * task looks done; the colored flags, as FreeMind's are; and the pie chart, which has no emoji.
 */
export const XMIND_MARKER_SVG_ICONS: Readonly<Record<string, string>> = {
  'task-start': 'task_0',
  'task-oct': 'task_0',
  'task-quarter': 'task_25',
  'task-3oct': 'task_25',
  'task-half': 'task_50',
  'task-5oct': 'task_50',
  'task-3quar': 'task_75',
  'task-7oct': 'task_75',
  'task-done': 'task_100',
  'flag-orange': 'flag_orange',
  'flag-yellow': 'flag_yellow',
  'flag-green': 'flag_green',
  'flag-dark-green': 'flag_green',
  'flag-blue': 'flag_blue',
  'flag-dark-blue': 'flag_blue',
  'flag-purple': 'flag_purple',
  c_symbol_pie_chart: 'chart_pie',
};

class XMindImporter extends Importer {
  private xmindInput: XMindRawInput;

  private readonly ids = new TopicIdSequence();

  private topicIdMap: Map<string, number>;

  private currentLayout: LayoutType = 'mindmap';

  constructor(map: XMindRawInput) {
    super();
    this.xmindInput = map;
    this.topicIdMap = new Map();
  }

  async import(nameMap: string, description?: string): Promise<string> {
    try {
      console.log(`Importing XMind map: ${nameMap}, description: ${description}`);

      const detected = await this.detectInput();

      this.resetState();

      const mindmap =
        detected.kind === 'xml'
          ? this.importXMLFormat(detected.xml, nameMap)
          : this.importJSONFormat(detected.sheet, nameMap);

      return toWiseMappingXml(mindmap);
    } catch (error) {
      console.error('Error importing XMind map:', error);
      throw ImportError.from(error, 'XMind');
    }
  }

  private resetState(): void {
    this.ids.reset();
    this.topicIdMap.clear();
    this.currentLayout = 'mindmap';
  }

  private importXMLFormat(xmlContent: string, nameMap: string): Mindmap {
    // Use secure XML parser to prevent XXE attacks, as the other importers do
    const doc = SecureXmlParser.parseSecureXml(xmlContent);
    if (!doc) {
      throw new Error('Failed to parse XMind XML - content may be unsafe or not well-formed');
    }

    // Find the root topic (within sheet element) - handle namespaces
    let sheet = doc.querySelector('sheet');
    if (!sheet) {
      // Try to find sheet by tag name (works with namespaces)
      const sheets = doc.getElementsByTagName('sheet');
      sheet = sheets.item(0);
    }

    let rootTopic = sheet?.querySelector('topic');
    if (!rootTopic) {
      // Try to find topic by tag name (works with namespaces)
      const topics = sheet
        ? sheet.getElementsByTagName('topic')
        : doc.getElementsByTagName('topic');
      rootTopic = topics.length > 0 ? topics[0] : null;
    }

    if (!rootTopic) {
      throw new Error('No root topic found in XMind file');
    }

    this.currentLayout = this.detectLayoutFromXML(rootTopic);

    return this.buildMindmapFromXML(rootTopic, nameMap);
  }

  private importJSONFormat(sheet: XMindSheet, nameMap: string): Mindmap {
    this.currentLayout = this.detectLayoutFromJson(sheet);

    return this.buildMindmapFromJson(sheet, nameMap);
  }

  private detectLayoutFromXML(rootTopic: Element): LayoutType {
    const structureClass = rootTopic.getAttribute('structure-class');
    return this.mapStructureClassToLayout(structureClass) ?? 'mindmap';
  }

  private detectLayoutFromJson(sheet: XMindSheet): LayoutType {
    const rootStructure = sheet.rootTopic?.structureClass;
    const layoutFromStructure = this.mapStructureClassToLayout(rootStructure);
    if (layoutFromStructure) {
      return layoutFromStructure;
    }

    if (sheet.extensions) {
      const layoutFromExtensions = sheet.extensions.reduce<LayoutType | null>(
        (found, extension) => {
          if (found) {
            return found;
          }
          const content = extension.content as { centralTopic?: string } | undefined;
          return this.mapStructureClassToLayout(content?.centralTopic);
        },
        null,
      );

      if (layoutFromExtensions) {
        return layoutFromExtensions;
      }
    }

    return 'mindmap';
  }

  private mapStructureClassToLayout(structureClass?: string | null): LayoutType | null {
    if (!structureClass) {
      return null;
    }

    const normalized = structureClass.toLowerCase();

    const treeIndicators = ['org-chart', 'tree', 'timeline', 'logic', 'fishbone', 'matrix'];
    if (treeIndicators.some((indicator) => normalized.includes(indicator))) {
      return 'tree';
    }

    const mindmapIndicators = ['map', 'mindmap'];
    if (mindmapIndicators.some((indicator) => normalized.includes(indicator))) {
      return 'mindmap';
    }

    return null;
  }

  private async detectInput(): Promise<DetectedInput> {
    if (typeof this.xmindInput === 'string') {
      const trimmed = this.xmindInput.trim();

      if (this.looksLikeXml(trimmed)) {
        return { kind: 'xml', xml: this.xmindInput };
      }

      if (this.looksLikeJson(trimmed)) {
        const sheet = this.parseJsonSheet(this.xmindInput);
        return { kind: 'json', sheet };
      }

      if (this.looksLikeZipHeader(trimmed)) {
        const binary = this.binaryStringToUint8Array(this.xmindInput);
        return this.detectFromZip(binary);
      }

      try {
        const binary = this.binaryStringToUint8Array(this.xmindInput);
        return this.detectFromZip(binary);
      } catch (error) {
        throw new Error(
          `Unsupported XMind input: unable to detect format (${(error as Error).message})`,
        );
      }
    }

    const normalized = this.normalizeToUint8Array(this.xmindInput);
    const decoded = this.tryDecodeToString(normalized);

    if (decoded) {
      const trimmed = decoded.trim();
      if (this.looksLikeXml(trimmed)) {
        return { kind: 'xml', xml: decoded };
      }

      if (this.looksLikeJson(trimmed)) {
        const sheet = this.parseJsonSheet(decoded);
        return { kind: 'json', sheet };
      }

      if (this.looksLikeZipHeader(trimmed)) {
        return this.detectFromZip(normalized);
      }
    }

    return this.detectFromZip(normalized);
  }

  private looksLikeXml(input: string): boolean {
    return input.startsWith('<?xml') || input.startsWith('<xmap-content');
  }

  private looksLikeJson(input: string): boolean {
    return input.startsWith('{') || input.startsWith('[');
  }

  private looksLikeZipHeader(input: string): boolean {
    return input.startsWith('PK');
  }

  private binaryStringToUint8Array(input: string): Uint8Array {
    const buffer = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i += 1) {
      buffer[i] = input.charCodeAt(i) % 0x100;
    }
    return buffer;
  }

  private normalizeToUint8Array(input: ArrayBuffer | Uint8Array): Uint8Array {
    if (input instanceof Uint8Array) {
      return input;
    }
    return new Uint8Array(input);
  }

  private tryDecodeToString(input: ArrayBuffer | Uint8Array): string | null {
    return tryDecodeUtf8(input);
  }

  private detectFromZip(data: Uint8Array | null): DetectedInput {
    if (!data || data.length === 0) {
      throw new Error('Empty XMind ZIP payload');
    }

    let files: Record<string, Uint8Array>;
    try {
      // Only the content entries are inflated, within the cap, and none past its declared size.
      files = readZipEntries(data, {
        accept: isXMindContentEntry,
        maxBytes: MAX_XMIND_CONTENT_BYTES,
        tooLarge: () =>
          new ImportError(
            `The XMind file is too large: its content exceeds ${MAX_XMIND_CONTENT_BYTES / (1024 * 1024)} MB uncompressed.`,
          ),
      });
    } catch (error) {
      if (error instanceof ImportError) {
        throw error;
      }
      throw new Error(`Failed to unzip XMind archive: ${(error as Error).message}`);
    }

    const entries = Object.entries(files);

    const jsonEntry = entries.find(([name]) => name.endsWith('content.json'));
    if (jsonEntry) {
      const jsonContent = decodeUtf8(jsonEntry[1]);
      const sheet = this.parseJsonSheet(jsonContent);
      return { kind: 'json', sheet };
    }

    const xmlEntry = entries.find(([name]) => name.endsWith('content.xml'));
    if (xmlEntry) {
      const xmlContent = decodeUtf8(xmlEntry[1]);
      return { kind: 'xml', xml: xmlContent };
    }

    throw new Error('XMind ZIP missing content.json or content.xml');
  }

  private parseJsonSheet(jsonContent: string): XMindSheet {
    const parsed = JSON.parse(jsonContent) as XMindSheet | XMindSheet[] | { sheets?: XMindSheet[] };

    if (Array.isArray(parsed)) {
      const sheet = this.pickSheet(parsed);
      if (sheet) {
        return sheet;
      }
    } else if (parsed && typeof parsed === 'object') {
      if ('rootTopic' in parsed && parsed.rootTopic) {
        return parsed;
      }

      if ('sheets' in parsed) {
        const candidate = parsed.sheets;
        if (candidate && Array.isArray(candidate)) {
          const sheet = this.pickSheet(candidate);
          if (sheet) {
            return sheet;
          }
        }
      }
    }

    throw new Error('Invalid XMind JSON content: root topic not found');
  }

  private pickSheet(sheets: XMindSheet[]): XMindSheet | null {
    const sheetWithRoot = sheets.find((sheet) => sheet.class === 'sheet' && !!sheet.rootTopic);
    if (sheetWithRoot) {
      return sheetWithRoot;
    }

    const [first] = sheets;
    return first?.rootTopic ? first : null;
  }

  private convertXMindColor(xmindColor: string): string {
    // XMind uses RGBA format like #8EDE99FF
    // WiseMapping might expect different format
    if (xmindColor.startsWith('#')) {
      // Remove alpha channel if present (last 2 characters)
      if (xmindColor.length === 9) {
        return xmindColor.substring(0, 7); // Remove alpha
      }
      return xmindColor;
    }
    return xmindColor;
  }

  // A tree topic goes right of its parent, its siblings centered on it. A mind map main topic
  // alternates sides.
  private calculatePosition(order: number, depth: number, siblingCount: number): PositionType {
    if (this.currentLayout === 'tree') {
      const horizontalSpacing = 220;
      const verticalSpacing = 140;
      const x = (depth + 1) * horizontalSpacing;
      const offset = ((siblingCount - 1) / 2) * verticalSpacing;
      const y = order * verticalSpacing - offset;

      return { x, y };
    }
    return alternatingSidePosition(order);
  }

  private createMindmap(nameMap: string): Mindmap {
    const mindmap = new Mindmap(nameMap);
    mindmap.setTheme('prism');
    mindmap.setLayout(this.currentLayout);
    return mindmap;
  }

  private createTopic(mindmap: Mindmap, xmindTopicId: string, title: string): NodeModel {
    const topic = mindmap.createNode('MainTopic', this.ids.next());
    this.topicIdMap.set(xmindTopicId, topic.getId());
    topic.setText(title);
    topic.setShapeType('line');
    return topic;
  }

  private addIcon(topic: NodeModel, xmindIconId: string): void {
    const svgIcon = ownEntry(XMIND_MARKER_SVG_ICONS, xmindIconId.toLowerCase());
    if (svgIcon) {
      topic.addFeature(FeatureModelFactory.createModel('icon', { id: svgIcon }));
      return;
    }
    const emojiIcon = this.mapXMindIconToEmojiIcon(xmindIconId);
    topic.addFeature(FeatureModelFactory.createModel('eicon', { id: emojiIcon }));
  }

  /**
   * Topic hyperlinks become links. Links to a topic of the file (xmind:#id) and to files attached
   * to it (xap:attachments/...) are skipped: they can not be opened from WiseMapping.
   */
  private static addLink(topic: NodeModel, href: string | null | undefined): void {
    const url = href?.trim();
    if (url && !/^(xmind|xap):/i.test(url)) {
      topic.addFeature(FeatureModelFactory.createModel('link', { url }));
    }
  }

  private addRelationship(mindmap: Mindmap, end1: string, end2: string): void {
    // Map XMind topic IDs to WiseMapping topic IDs
    const srcTopicId = this.topicIdMap.get(end1);
    const destTopicId = this.topicIdMap.get(end2);
    if (!srcTopicId || !destTopicId) {
      return;
    }
    mindmap.addRelationship(mindmap.createRelationship(srcTopicId, destTopicId));
  }

  private buildMindmapFromXML(rootTopic: Element, nameMap: string): Mindmap {
    const mindmap = this.createMindmap(nameMap);

    const centralTopic = mindmap.createNode('CentralTopic', this.ids.next());
    const rootTopicId = rootTopic.getAttribute('id') || 'topic1';
    this.topicIdMap.set(rootTopicId, centralTopic.getId());
    centralTopic.setText(
      XMindImporter.childElement(rootTopic, 'title')?.textContent || 'Central Topic',
    );
    this.addXMLTopicFeatures(centralTopic, rootTopic);
    mindmap.addBranch(centralTopic);

    // Generate child topics recursively
    this.appendXMLChildTopics(mindmap, centralTopic, rootTopic, 1);

    // Detached topics are floating topics
    XMindImporter.xmlChildTopics(rootTopic, 'detached').forEach((xmlTopic) => {
      const topic = this.convertXMLTopic(mindmap, xmlTopic, 1);
      const position = XMindImporter.childElement(xmlTopic, 'position');
      topic.setPosition(
        Number(position?.getAttribute('svg:x')) || 0,
        Number(position?.getAttribute('svg:y')) || 0,
      );
      mindmap.addBranch(topic);
    });

    // Add relationships if present
    this.addRelationshipsFromXML(mindmap, rootTopic);

    return mindmap;
  }

  // The topics of <children><topics type="..."> of the given topic.
  private static xmlChildTopics(xmlTopic: Element, type: 'attached' | 'detached'): Element[] {
    const childrenElement = XMindImporter.childElement(xmlTopic, 'children');
    if (!childrenElement) {
      return [];
    }
    const topicsElement = XMindImporter.childElements(childrenElement, 'topics').find(
      (topics) => topics.getAttribute('type') === type,
    );
    return topicsElement ? XMindImporter.childElements(topicsElement, 'topic') : [];
  }

  private appendXMLChildTopics(
    mindmap: Mindmap,
    parent: NodeModel,
    xmlTopic: Element,
    depth: number,
  ): void {
    const childTopics = XMindImporter.xmlChildTopics(xmlTopic, 'attached');
    const siblingCount = childTopics.length;
    childTopics.forEach((childTopic, index) => {
      const topic = this.convertXMLTopic(mindmap, childTopic, depth);
      const position = this.calculatePosition(index, depth, siblingCount);
      topic.setPosition(position.x, position.y);
      topic.setOrder(index);
      parent.append(topic);
    });
  }

  private convertXMLTopic(mindmap: Mindmap, xmlTopic: Element, depth: number): NodeModel {
    const xmindTopicId = xmlTopic.getAttribute('id') || `topic${this.ids.peek() + 1}`;
    const title = XMindImporter.childElement(xmlTopic, 'title')?.textContent || 'Untitled';
    const topic = this.createTopic(mindmap, xmindTopicId, title);
    this.addXMLTopicFeatures(topic, xmlTopic);

    // Recursively generate child topics
    this.appendXMLChildTopics(mindmap, topic, xmlTopic, depth + 1);

    return topic;
  }

  // The icons, note and link of a topic, the central one included.
  private addXMLTopicFeatures(topic: NodeModel, xmlTopic: Element): void {
    // Add icons if present (from markers)
    const markerRefs = XMindImporter.childElement(xmlTopic, 'marker-refs');
    const markers = markerRefs ? XMindImporter.childElements(markerRefs, 'marker-ref') : [];
    markers.forEach((marker) => {
      const markerId = marker.getAttribute('marker-id');
      if (markerId) {
        this.addIcon(topic, markerId);
      }
    });

    // Handle notes and markers (combine into one WiseMapping note)
    const noteContent = this.buildXMLNoteContent(xmlTopic);
    if (noteContent) {
      topic.addFeature(new NoteModel({ text: noteContent }));
    }

    XMindImporter.addLink(
      topic,
      xmlTopic.getAttributeNS(XLINK_NAMESPACE, 'href') || xmlTopic.getAttribute('xlink:href'),
    );
  }

  private addRelationshipsFromXML(mindmap: Mindmap, rootTopic: Element): void {
    // Find relationships in the sheet (parent of rootTopic)
    const sheet = rootTopic.parentElement;
    if (!sheet) return;

    let relationshipsElement = sheet.querySelector('relationships');
    if (!relationshipsElement) {
      const relationships = sheet.getElementsByTagName('relationships');
      relationshipsElement = relationships.item(0);
    }

    if (!relationshipsElement) return;

    XMindImporter.childElements(relationshipsElement, 'relationship').forEach((relationship) => {
      const end1 = relationship.getAttribute('end1');
      const end2 = relationship.getAttribute('end2');
      if (end1 && end2) {
        this.addRelationship(mindmap, end1, end2);
      }
    });
  }

  private buildMindmapFromJson(sheet: XMindSheet, nameMap: string): Mindmap {
    const { rootTopic } = sheet;
    const mindmap = this.createMindmap(nameMap);

    const centralTopic = mindmap.createNode('CentralTopic', this.ids.next());
    this.topicIdMap.set(rootTopic.id, centralTopic.getId());
    centralTopic.setText(rootTopic.title || 'Central Topic');
    this.addJsonTopicFeatures(centralTopic, rootTopic);
    mindmap.addBranch(centralTopic);

    // Generate child topics recursively
    this.appendJsonChildTopics(mindmap, centralTopic, rootTopic.children?.attached ?? [], 1);

    // Detached topics are floating topics
    rootTopic.children?.detached?.forEach((jsonTopic) => {
      const topic = this.convertJsonTopic(mindmap, jsonTopic, 1);
      topic.setPosition(jsonTopic.position?.x ?? 0, jsonTopic.position?.y ?? 0);
      mindmap.addBranch(topic);
    });

    sheet.relationships?.forEach((relationship) => {
      this.addRelationship(mindmap, relationship.end1Id, relationship.end2Id);
    });

    return mindmap;
  }

  private appendJsonChildTopics(
    mindmap: Mindmap,
    parent: NodeModel,
    jsonTopics: XMindTopic[],
    depth: number,
  ): void {
    const siblingCount = jsonTopics.length;
    jsonTopics.forEach((jsonTopic, index) => {
      const topic = this.convertJsonTopic(mindmap, jsonTopic, depth);
      const position = this.calculatePosition(index, depth, siblingCount);
      topic.setPosition(position.x, position.y);
      topic.setOrder(index);
      parent.append(topic);
    });
  }

  private convertJsonTopic(mindmap: Mindmap, jsonTopic: XMindTopic, depth: number): NodeModel {
    const topic = this.createTopic(mindmap, jsonTopic.id, jsonTopic.title || 'Untitled');
    this.addJsonTopicFeatures(topic, jsonTopic);

    // Recursively generate child topics
    this.appendJsonChildTopics(mindmap, topic, jsonTopic.children?.attached ?? [], depth + 1);

    return topic;
  }

  // The colors, icons, note and link of a topic, the central one included.
  private addJsonTopicFeatures(topic: NodeModel, jsonTopic: XMindTopic): void {
    const bgColor = this.extractBackgroundColor(jsonTopic);
    if (bgColor) {
      topic.setBackgroundColor(bgColor);
    }

    // Add border color if available
    const borderColor = this.extractBorderColor(jsonTopic);
    if (borderColor) {
      topic.setBorderColor(borderColor);
    }

    // The markers are the icons of a topic.
    jsonTopic.markers?.forEach((marker) => {
      if (marker.markerId) {
        this.addIcon(topic, marker.markerId);
      }
    });

    // Add notes if present (combine XMind notes and labels into one WiseMapping note)
    const noteContent = this.buildNoteContent(jsonTopic);
    if (noteContent) {
      topic.addFeature(new NoteModel({ text: noteContent }));
    }

    XMindImporter.addLink(topic, jsonTopic.href);
  }

  private extractBackgroundColor(topic: XMindTopic): string | null {
    if (topic.style?.properties?.['svg:fill']) {
      return this.convertXMindColor(topic.style.properties['svg:fill']);
    }
    return null;
  }

  private extractBorderColor(topic: XMindTopic): string | null {
    // For now, use the same color as background for border
    // In the future, we could extract from border-line-color if available
    return this.extractBackgroundColor(topic);
  }

  private buildNoteContent(topic: XMindTopic): string | null {
    const parts: string[] = [];

    // Add XMind note content if present
    const noteText = topic.notes?.plain?.content;
    if (noteText && noteText.trim()) {
      parts.push(noteText);
    }

    // Add labels if present (at the bottom)
    if (topic.labels && topic.labels.length > 0) {
      const formattedLabels = topic.labels.map((label) => `🏷️ ${label}`).join(', ');
      parts.push(formattedLabels);
    }

    return parts.length > 0 ? parts.join('\n') : null;
  }

  private buildXMLNoteContent(xmlTopic: Element): string | null {
    const parts: string[] = [];

    // Handle XMind notes (main content at the top)
    const notesElement = XMindImporter.childElement(xmlTopic, 'notes');
    const notes = notesElement ? XMindImporter.childElement(notesElement, 'plain') : undefined;
    if (notes) {
      const noteText = notes.textContent || '';
      if (noteText.trim()) {
        parts.push(noteText);
      }
    }

    // Labels (<labels><label>text</label></labels>) at the bottom, as in the JSON format
    const labelsElement = XMindImporter.childElement(xmlTopic, 'labels');
    const labelElements = labelsElement ? XMindImporter.childElements(labelsElement, 'label') : [];
    const labels = labelElements
      .map((label) => label.textContent?.trim() ?? '')
      .filter((label) => label.length > 0);
    if (labels.length > 0) {
      parts.push(labels.map((label) => `🏷️ ${label}`).join(', '));
    }

    return parts.length > 0 ? parts.join('\n') : null;
  }

  private mapXMindIconToEmojiIcon(iconId: string): string {
    return ownEntry(XMIND_MARKER_EMOJIS, iconId.toLowerCase()) || '💡'; // Default to lightbulb
  }

  // Only direct children: descendant queries would pick up the data of nested topics.
  private static childElements(parent: Element, localName: string): Element[] {
    return Array.from(parent.children).filter((child) => child.localName === localName);
  }

  private static childElement(parent: Element, localName: string): Element | undefined {
    return Array.from(parent.children).find((child) => child.localName === localName);
  }
}

export default XMindImporter;
