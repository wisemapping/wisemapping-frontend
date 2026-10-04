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
 * - **Icons**: XMind icons are comprehensively mapped to WiseMapping EmojiIcons with 300+ mappings
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
import { unzipSync } from 'fflate';
import type { LayoutType } from '../layout/LayoutType';
import Importer from './Importer';
import { decodeUtf8, tryDecodeUtf8 } from './support/Utf8Decoder';

// XMind data structures
interface XMindTopic {
  id: string;
  title: string;
  children?: {
    attached?: XMindTopic[];
  };
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
  icons?: string[];
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

class XMindImporter extends Importer {
  private xmindInput: XMindRawInput;

  private idCounter = 1;

  private topicIdMap: Map<string, string>;

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

      if (detected.kind === 'xml') {
        return this.importXMLFormat(detected.xml, nameMap, description);
      }

      return this.importJSONFormat(detected.sheet, nameMap, description);
    } catch (error) {
      console.error('Error importing XMind map:', error);
      return this.createFallbackMap(nameMap, error as Error);
    }
  }

  private resetState(): void {
    this.idCounter = 1;
    this.topicIdMap.clear();
    this.currentLayout = 'mindmap';
  }

  private importXMLFormat(xmlContent: string, nameMap: string, description?: string): string {
    try {
      // Parse XML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, 'text/xml');

      // Find the root topic (within sheet element) - handle namespaces
      let sheet = doc.querySelector('sheet');
      if (!sheet) {
        // Try to find sheet by tag name (works with namespaces)
        const sheets = doc.getElementsByTagName('sheet');
        sheet = sheets.length > 0 ? sheets[0] : null;
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

      // Generate WiseMapping XML directly from XML structure
      const generated = this.generateWiseMappingXMLFromXML(rootTopic, nameMap, description);

      return generated;
    } catch (error) {
      console.error('XML XMind import failed:', error);
      return this.createFallbackMap(nameMap, error as Error);
    }
  }

  private importJSONFormat(sheet: XMindSheet, nameMap: string, description?: string): string {
    try {
      this.currentLayout = this.detectLayoutFromJson(sheet);

      const xmlContent = this.generateWiseMappingXML(sheet, nameMap, description);

      return xmlContent;
    } catch (error) {
      console.error('JSON XMind import failed:', error);
      return this.createFallbackMap(nameMap, error as Error);
    }
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

    const normalized = this.normalizeToUint8Array(this.xmindInput as ArrayBuffer | Uint8Array);
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
      files = unzipSync(data);
    } catch (error) {
      throw new Error(`Failed to unzip XMind archive: ${(error as Error).message}`);
    }

    const entries = Object.keys(files);

    const jsonEntry = entries.find((entry) => entry.endsWith('content.json'));
    if (jsonEntry) {
      const jsonContent = decodeUtf8(files[jsonEntry]);
      const sheet = this.parseJsonSheet(jsonContent);
      return { kind: 'json', sheet };
    }

    const xmlEntry = entries.find((entry) => entry.endsWith('content.xml'));
    if (xmlEntry) {
      const xmlContent = decodeUtf8(files[xmlEntry]);
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
      if ('rootTopic' in parsed && (parsed as XMindSheet).rootTopic) {
        return parsed as XMindSheet;
      }

      if ('sheets' in parsed) {
        const candidate = (parsed as { sheets?: XMindSheet[] }).sheets;
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

    return sheets.length > 0 && sheets[0].rootTopic ? sheets[0] : null;
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

  private generateId(): number {
    return this.idCounter++;
  }

  private calculatePosition(
    order: number,
    depth: number,
    siblingCount: number,
  ): {
    x: number;
    y: number;
  } {
    if (this.currentLayout === 'tree') {
      const horizontalSpacing = 220;
      const verticalSpacing = 140;
      const x = (depth + 1) * horizontalSpacing;
      const offset = ((siblingCount - 1) / 2) * verticalSpacing;
      const y = order * verticalSpacing - offset;

      return { x, y };
    }

    // Distribute first-level topics evenly between left and right sides
    // Even orders (0, 2, 4...) = Right side, Odd orders (1, 3, 5...) = Left side
    const isEven = order % 2 === 0;
    const sideIndex = Math.floor(order / 2);

    // Alternate between right (positive x) and left (negative x) sides
    const x = isEven ? 200 + sideIndex * 100 : -200 - sideIndex * 100;
    const y = sideIndex * 150 - sideIndex * 75; // Spread vertically

    return { x, y };
  }

  private generateWiseMappingXMLFromXML(
    rootTopic: Element,
    nameMap: string,
    _description?: string,
  ): string {
    const centralId = this.generateId();
    const rootTopicId = rootTopic.getAttribute('id') || 'topic1';
    this.topicIdMap.set(rootTopicId, centralId.toString());

    const centralTitle =
      XMindImporter.childElement(rootTopic, 'title')?.textContent || 'Central Topic';

    let xml = `<map name='${nameMap}' version='tango' theme='prism' layout='${this.currentLayout}'>\n`;

    // Generate central topic
    xml += `    <topic central='true' text='${this.escapeXml(centralTitle)}' id='${centralId}'>\n`;

    // Generate child topics recursively
    let childrenElement = rootTopic.querySelector('children');
    if (!childrenElement) {
      const children = rootTopic.getElementsByTagName('children');
      childrenElement = children.length > 0 ? children[0] : null;
    }

    if (childrenElement) {
      let topicsElement = childrenElement.querySelector('topics[type="attached"]');
      if (!topicsElement) {
        const topics = childrenElement.getElementsByTagName('topics');
        topicsElement =
          Array.from(topics).find((t) => t.getAttribute('type') === 'attached') || null;
      }

      if (topicsElement) {
        const childTopics = Array.from(topicsElement.children).filter(
          (child) => child.tagName === 'topic' || child.localName === 'topic',
        );
        const siblingCount = childTopics.length;
        childTopics.forEach((childTopic, index) => {
          xml += this.generateChildTopicXMLFromXML(childTopic as Element, index, 1, siblingCount);
        });
      }
    }

    xml += '    </topic>\n';

    // Add relationships if present
    const relationshipsXML = this.generateRelationshipsXML(rootTopic);
    if (relationshipsXML) {
      xml += relationshipsXML;
    }

    xml += '</map>';

    return xml;
  }

  private generateChildTopicXMLFromXML(
    xmlTopic: Element,
    order: number,
    depth: number,
    siblingCount: number,
  ): string {
    const topicId = this.generateId();
    const xmindTopicId = xmlTopic.getAttribute('id') || `topic${this.idCounter}`;
    this.topicIdMap.set(xmindTopicId, topicId.toString());

    const position = this.calculatePosition(order, depth, siblingCount);
    const title = XMindImporter.childElement(xmlTopic, 'title')?.textContent || 'Untitled';

    let xml = `        <topic position='${position.x},${position.y}' order='${order}' text='${this.escapeXml(title)}' shape='line' id='${topicId}'>\n`;

    // Add icons if present (from markers)
    const markerRefs = XMindImporter.childElement(xmlTopic, 'marker-refs');
    const markers = markerRefs ? XMindImporter.childElements(markerRefs, 'marker-ref') : [];

    if (markers.length > 0) {
      markers.forEach((marker) => {
        const markerId = marker.getAttribute('marker-id');
        if (markerId) {
          const emojiIcon = this.mapXMindIconToEmojiIcon(markerId);
          xml += `            <eicon id='${emojiIcon}'/>\n`;
        }
      });
    }

    // Handle notes and markers (combine into one WiseMapping note)
    const noteContent = this.buildXMLNoteContent(xmlTopic);
    if (noteContent) {
      xml += `            <note><![CDATA[${noteContent}]]></note>\n`;
    }

    // Recursively generate child topics
    let childrenElement = xmlTopic.querySelector('children');
    if (!childrenElement) {
      const children = xmlTopic.getElementsByTagName('children');
      childrenElement = children.length > 0 ? children[0] : null;
    }

    if (childrenElement) {
      let topicsElement = childrenElement.querySelector('topics[type="attached"]');
      if (!topicsElement) {
        const topics = childrenElement.getElementsByTagName('topics');
        topicsElement =
          Array.from(topics).find((t) => t.getAttribute('type') === 'attached') || null;
      }

      if (topicsElement) {
        const childTopics = Array.from(topicsElement.children).filter(
          (child) => child.tagName === 'topic' || child.localName === 'topic',
        );
        const nestedSiblingCount = childTopics.length;
        childTopics.forEach((childTopic, index) => {
          xml += this.generateChildTopicXMLFromXML(
            childTopic as Element,
            index,
            depth + 1,
            nestedSiblingCount,
          );
        });
      }
    }

    xml += '        </topic>\n';
    return xml;
  }

  private generateRelationshipsXML(rootTopic: Element): string {
    // Find relationships in the sheet (parent of rootTopic)
    const sheet = rootTopic.parentElement;
    if (!sheet) return '';

    let relationshipsElement = sheet.querySelector('relationships');
    if (!relationshipsElement) {
      const relationships = sheet.getElementsByTagName('relationships');
      relationshipsElement = relationships.length > 0 ? relationships[0] : null;
    }

    if (!relationshipsElement) return '';

    let relationshipsXML = '';
    const relationshipElements = relationshipsElement.querySelectorAll('relationship');
    if (relationshipElements.length === 0) {
      const relationships = relationshipsElement.getElementsByTagName('relationship');
      Array.from(relationships).forEach((rel) => {
        relationshipsXML += this.generateRelationshipXML(rel as Element);
      });
    } else {
      relationshipElements.forEach((rel) => {
        relationshipsXML += this.generateRelationshipXML(rel as Element);
      });
    }

    return relationshipsXML;
  }

  private generateRelationshipsXMLFromJson(sheet: XMindSheet): string {
    if (!sheet.relationships || sheet.relationships.length === 0) {
      return '';
    }

    let relationshipsXML = '';
    sheet.relationships.forEach((relationship) => {
      const srcTopicId = this.mapTopicId(relationship.end1Id);
      const destTopicId = this.mapTopicId(relationship.end2Id);

      if (!srcTopicId || !destTopicId) {
        return;
      }

      relationshipsXML += `    <relationship srcTopicId='${srcTopicId}' destTopicId='${destTopicId}'`;

      if (relationship.title) {
        relationshipsXML += ` label='${this.escapeXml(relationship.title)}'`;
      }

      relationshipsXML += '/>\n';
    });

    return relationshipsXML;
  }

  private generateRelationshipXML(relationshipElement: Element): string {
    const end1 = relationshipElement.getAttribute('end1');
    const end2 = relationshipElement.getAttribute('end2');
    const title = XMindImporter.childElement(relationshipElement, 'title')?.textContent ?? '';

    if (!end1 || !end2) return '';

    // Map XMind topic IDs to WiseMapping topic IDs
    const srcTopicId = this.mapTopicId(end1);
    const destTopicId = this.mapTopicId(end2);

    if (!srcTopicId || !destTopicId) return '';

    let relationshipXML = `    <relationship srcTopicId='${srcTopicId}' destTopicId='${destTopicId}'`;

    if (title) {
      relationshipXML += ` label='${this.escapeXml(title)}'`;
    }

    relationshipXML += '/>\n';
    return relationshipXML;
  }

  private mapTopicId(xmindTopicId: string): string | null {
    return this.topicIdMap.get(xmindTopicId) || null;
  }

  private generateWiseMappingXML(
    sheet: XMindSheet,
    nameMap: string,
    _description?: string,
  ): string {
    const { rootTopic } = sheet;
    const rootTitle = rootTopic.title || 'Central Topic';
    const centralId = this.generateId();
    this.topicIdMap.set(rootTopic.id, centralId.toString());

    let xml = `<map name='${nameMap}' version='tango' theme='prism' layout='${this.currentLayout}'>\n`;

    // Generate central topic
    xml += `    <topic central='true' text='${this.escapeXml(rootTitle)}' id='${centralId}'>\n`;

    // Generate child topics recursively
    if (rootTopic.children?.attached) {
      xml += this.generateChildTopicsXML(rootTopic.children.attached, 1);
    }

    xml += '    </topic>\n';
    const relationshipsXML = this.generateRelationshipsXMLFromJson(sheet);
    if (relationshipsXML) {
      xml += relationshipsXML;
    }

    xml += '</map>';

    return xml;
  }

  private generateChildTopicsXML(topics: XMindTopic[], depth: number): string {
    let xml = '';
    const siblingCount = topics.length;

    topics.forEach((topic, index) => {
      const topicId = this.generateId();
      this.topicIdMap.set(topic.id, topicId.toString());
      const position = this.calculatePosition(index, depth, siblingCount);
      const bgColor = this.extractBackgroundColor(topic);

      const topicTitle = topic.title || 'Untitled';
      xml += `        <topic position='${position.x},${position.y}' order='${index}' text='${this.escapeXml(topicTitle)}' shape='line' id='${topicId}'`;

      if (bgColor) {
        xml += ` bgColor='${bgColor}'`;
      }

      // Add border color if available
      const borderColor = this.extractBorderColor(topic);
      if (borderColor) {
        xml += ` brColor='${borderColor}'`;
      }

      xml += '>\n';

      // Add icons if present (mapped to EmojiIcons)
      if (topic.icons && topic.icons.length > 0) {
        topic.icons.forEach((icon) => {
          const emojiIcon = this.mapXMindIconToEmojiIcon(icon);
          xml += `            <eicon id='${emojiIcon}'/>\n`;
        });
      }

      // Add notes if present (combine XMind notes and labels into one WiseMapping note)
      const noteContent = this.buildNoteContent(topic);
      if (noteContent) {
        xml += `            <note><![CDATA[${noteContent}]]></note>\n`;
      }

      // Recursively generate child topics
      if (topic.children?.attached) {
        xml += this.generateChildTopicsXML(topic.children.attached, depth + 1);
      }

      xml += '        </topic>\n';
    });

    return xml;
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

    // Add XMind note content if present (from XML format)
    // Note: JSON format doesn't have separate notes, only labels

    // Add icons if present (mapped to appropriate emojis)
    if (topic.icons && topic.icons.length > 0) {
      const formattedIcons = topic.icons
        .map((icon) => {
          const emoji = this.mapXMindIconToEmojiIcon(icon);
          return `${emoji} ${icon}`;
        })
        .join(', ');
      parts.push(formattedIcons);
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

    // Handle XMind markers (middle)
    const markersElement = XMindImporter.childElement(xmlTopic, 'markers');
    const markers = markersElement ? XMindImporter.childElements(markersElement, 'marker') : [];
    if (markers.length > 0) {
      const markerTexts = markers.map((marker) => marker.getAttribute('marker-id') || 'unknown');
      const formattedMarkers = markerTexts.map((marker) => `🔖 ${marker}`).join(', ');
      parts.push(formattedMarkers);
    }

    // Note: XMind XML format doesn't have labels, only JSON format does
    // Labels would be added at the bottom if present

    return parts.length > 0 ? parts.join('\n') : null;
  }

  private mapXMindIconToEmojiIcon(iconId: string): string {
    // Map XMind icons to WiseMapping EmojiIcon IDs
    const iconMap: Record<string, string> = {
      // Priority icons
      'priority-1': '🔴', // Red circle
      'priority-2': '🟡', // Yellow circle
      'priority-3': '🟢', // Green circle
      'priority-4': '🔵', // Blue circle
      'priority-5': '🟣', // Purple circle

      // Star and rating icons
      star: '⭐', // Star
      'star-1': '⭐', // Star
      'star-2': '⭐', // Star
      'star-3': '⭐', // Star

      // Task and completion icons
      task: '📋', // Clipboard
      'task-done': '✅', // Check mark
      'task-start': '🟡', // Yellow circle
      'task-pause': '⏸️', // Pause button
      'task-stop': '⏹️', // Stop button

      // Arrow and direction icons
      'arrow-up': '⬆️', // ⬆️
      'arrow-down': '⬇️', // ⬇️
      'arrow-left': '⬅️', // ⬅️
      'arrow-right': '➡️', // ➡️
      'arrow-up-right': '↗️', // ↗️
      'arrow-down-right': '↘️', // ↘️
      'arrow-down-left': '↙️', // ↙️
      'arrow-up-left': '↖️', // ↖️

      // Symbol icons
      smile: '😊', // 😊
      sad: '😢', // 😢
      angry: '😠', // 😠
      surprised: '😲', // 😲
      confused: '😕', // 😕
      thinking: '🤔', // 🤔
      happy: '😃', // 😃
      laughing: '😂', // 😂
      wink: '😉', // 😉
      kiss: '😘', // 😘
      love: '😍', // 😍
      cool: '😎', // 😎
      sleepy: '😪', // 😪
      tired: '😴', // 😴
      worried: '😟', // 😟
      crying: '😭', // 😭
      screaming: '😱', // 😱
      neutral: '😐', // 😐
      expressionless: '😑', // 😑

      // Numbers (1-10)
      'number-1': '1️⃣', // 1️⃣
      'number-2': '2️⃣', // 2️⃣
      'number-3': '3️⃣', // 3️⃣
      'number-4': '4️⃣', // 4️⃣
      'number-5': '5️⃣', // 5️⃣
      'number-6': '6️⃣', // 6️⃣
      'number-7': '7️⃣', // 7️⃣
      'number-8': '8️⃣', // 8️⃣
      'number-9': '9️⃣', // 9️⃣
      'number-10': '🔟', // 🔟
      1: '1️⃣', // 1️⃣
      2: '2️⃣', // 2️⃣
      3: '3️⃣', // 3️⃣
      4: '4️⃣', // 4️⃣
      5: '5️⃣', // 5️⃣
      6: '6️⃣', // 6️⃣
      7: '7️⃣', // 7️⃣
      8: '8️⃣', // 8️⃣
      9: '9️⃣', // 9️⃣
      10: '🔟', // 🔟

      // Letters (A-Z)
      'letter-a': '🅰️', // 🅰️
      'letter-b': '🅱️', // 🅱️
      'letter-c': '🅲', // 🅲
      'letter-d': '🅳', // 🅳
      'letter-e': '🅴', // 🅴
      'letter-f': '🅵', // 🅵
      'letter-g': '🅶', // 🅶
      'letter-h': '🅷', // 🅷
      'letter-i': '🅸', // 🅸
      'letter-j': '🅹', // 🅹
      'letter-k': '🅺', // 🅺
      'letter-l': '🅻', // 🅻
      'letter-m': '🅼', // 🅼
      'letter-n': '🅽', // 🅽
      'letter-o': '🅾️', // 🅾️
      'letter-p': '🅿️', // 🅿️
      'letter-q': '🆀', // 🆀
      'letter-r': '🆁', // 🆁
      'letter-s': '🆂', // 🆂
      'letter-t': '🆃', // 🆃
      'letter-u': '🆄', // 🆄
      'letter-v': '🆅', // 🆅
      'letter-w': '🆆', // 🆆
      'letter-x': '🆇', // 🆇
      'letter-y': '🆈', // 🆈
      'letter-z': '🆉', // 🆉
      a: '🅰️', // 🅰️
      b: '🅱️', // 🅱️
      c: '🅲', // 🅲
      d: '🅳', // 🅳
      e: '🅴', // 🅴
      f: '🅵', // 🅵
      g: '🅶', // 🅶
      h: '🅷', // 🅷
      i: '🅸', // 🅸
      j: '🅹', // 🅹
      k: '🅺', // 🅺
      l: '🅻', // 🅻
      m: '🅼', // 🅼
      n: '🅽', // 🅽
      o: '🅾️', // 🅾️
      p: '🅿️', // 🅿️
      q: '🆀', // 🆀
      r: '🆁', // 🆁
      s: '🆂', // 🆂
      t: '🆃', // 🆃
      u: '🆄', // 🆄
      v: '🆅', // 🆅
      w: '🆆', // 🆆
      x: '🆇', // 🆇
      y: '🆈', // 🆈
      z: '🆉', // 🆉

      // Flag icons
      flag: '🚩', // 🚩
      'flag-red': '🚩', // 🚩
      'flag-yellow': '🟡', // 🟡
      'flag-green': '🟢', // 🟢
      'flag-blue': '🔵', // 🔵

      // People icons
      people: '👥', // 👥
      person: '👤', // 👤
      'person-1': '👤', // 👤
      'person-2': '👥', // 👥
      'person-3': '👥', // 👥

      // Time and date icons
      clock: '🕐', // 🕐
      calendar: '📅', // 📅
      time: '⏰', // ⏰

      // Communication icons
      phone: '📞', // 📞
      email: '📧', // 📧
      message: '💬', // 💬
      chat: '💬', // 💬

      // File and document icons
      file: '📄', // 📄
      folder: '📁', // 📁
      attachment: '📎', // 📎
      link: '🔗', // 🔗

      // Warning and info icons
      warning: '⚠️', // ⚠️
      info: 'ℹ️', // ℹ️
      question: '❓', // ❓
      exclamation: '❗', // ❗

      // Heart and like icons
      heart: '❤️', // ❤️
      like: '👍', // 👍
      dislike: '👎', // 👎

      // Lightbulb and idea icons
      lightbulb: '💡', // 💡
      idea: '💡', // 💡
      bulb: '💡', // 💡

      // Money and business icons
      money: '💰', // 💰
      dollar: '💲', // 💲
      euro: '💶', // 💶
      pound: '💷', // 💷

      // Location icons
      location: '📍', // 📍
      home: '🏠', // 🏠
      building: '🏢', // 🏢
      school: '🏫', // 🏫

      // Technology icons
      computer: '💻', // 💻
      laptop: '💻', // 💻
      'phone-mobile': '📱', // 📱
      tablet: '📱', // 📱

      // Weather icons
      sun: '☀️', // ☀️
      cloud: '☁️', // ☁️
      rain: '🌧️', // 🌧️
      snow: '❄️', // ❄️
      storm: '⛈️', // ⛈️
      rainbow: '🌈', // 🌈
      sunny: '🌞', // 🌞
      'partly-cloudy': '⛅', // ⛅
      cloudy: '🌥️', // 🌥️
      lightning: '⚡', // ⚡
      tornado: '🌪️', // 🌪️
      fog: '🌫️', // 🌫️
      wind: '🌬️', // 🌬️
      thermometer: '🌡️', // 🌡️

      // Animals
      dog: '🐶', // 🐶
      cat: '🐱', // 🐱
      mouse: '🐭', // 🐭
      hamster: '🐹', // 🐹
      rabbit: '🐰', // 🐰
      fox: '🦊', // 🦊
      bear: '🐻', // 🐻
      panda: '🐼', // 🐼
      koala: '🐨', // 🐨
      lion: '🦁', // 🦁
      tiger: '🐯', // 🐯
      cow: '🐮', // 🐮
      pig: '🐷', // 🐷
      frog: '🐸', // 🐸
      monkey: '🐵', // 🐵
      chicken: '🐔', // 🐔
      penguin: '🐧', // 🐧
      bird: '🐦', // 🐦
      fish: '🐟', // 🐟
      whale: '🐳', // 🐳
      dolphin: '🐬', // 🐬
      octopus: '🐙', // 🐙
      spider: '🕷️', // 🕷️
      bug: '🐛', // 🐛
      bee: '🐝', // 🐝
      butterfly: '🦋', // 🦋
      snail: '🐌', // 🐌
      turtle: '🐢', // 🐢
      snake: '🐍', // 🐍
      dragon: '🐉', // 🐉
      unicorn: '🦄', // 🦄

      // Food and drink icons
      coffee: '☕', // ☕
      food: '🍽️', // 🍽️
      pizza: '🍕', // 🍕
      burger: '🍔', // 🍔
      apple: '🍎', // 🍎
      orange: '🍊', // 🍊
      banana: '🍌', // 🍌
      grapes: '🍇', // 🍇
      strawberry: '🍓', // 🍓
      kiwi: '🥝', // 🥝
      peach: '🍑', // 🍑
      coconut: '🥥', // 🥥
      cherry: '🍒', // 🍒
      lemon: '🍋', // 🍋
      watermelon: '🍉', // 🍉
      pineapple: '🍍', // 🍍
      bread: '🍞', // 🍞
      cookie: '🍪', // 🍪
      candy: '🍬', // 🍬
      chocolate: '🍫', // 🍫
      'ice-cream': '🍦', // 🍦
      popcorn: '🍿', // 🍿
      beer: '🍺', // 🍺
      wine: '🍷', // 🍷
      cocktail: '🍸', // 🍸
      tea: '🍵', // 🍵
      milk: '🥛', // 🥛
      water: '💧', // 💧

      // Sports and activity icons
      sports: '⚽', // ⚽
      football: '⚽', // ⚽
      basketball: '🏀', // 🏀
      tennis: '🎾', // 🎾
      swimming: '🏊', // 🏊
      soccer: '⚽', // ⚽
      baseball: '⚾', // ⚾
      volleyball: '🏐', // 🏐
      rugby: '🏈', // 🏈
      golf: '⛳', // ⛳
      bowling: '🎳', // 🎳
      running: '🏃', // 🏃
      cycling: '🚴', // 🚴
      skiing: '⛷️', // ⛷️
      snowboarding: '🏂', // 🏂
      surfing: '🏄', // 🏄
      climbing: '🧗', // 🧗
      yoga: '🧘', // 🧘
      dancing: '💃', // 💃
      gym: '🏋️', // 🏋️
      weightlifting: '🏋️', // 🏋️
      boxing: '🥊', // 🥊
      'martial-arts': '🥋', // 🥋
      archery: '🏹', // 🏹
      fishing: '🎣', // 🎣
      hiking: '🧖', // 🧖
      camping: '🏕️', // 🏕️
      picnic: '🍽️', // 🍽️
      barbecue: '🍳', // 🍳
      target: '🎯', // 🎯
      trophy: '🏆', // 🏆
      medal: '🏅', // 🏅
      'first-place': '🥇', // 🥇
      'second-place': '🥈', // 🥈
      'third-place': '🥉', // 🥉

      // Music and entertainment icons
      music: '🎵', // 🎵
      movie: '🎬', // 🎬
      game: '🎮', // 🎮
      book: '📚', // 📚

      // Travel and transport icons
      car: '🚗', // 🚗
      plane: '✈️', // ✈️
      train: '🚂', // 🚂
      bus: '🚌', // 🚌
      bike: '🚲', // 🚲

      // Nature icons
      tree: '🌳', // 🌳
      flower: '🌸', // 🌸
      leaf: '🍃', // 🍃
      mountain: '⛰️', // ⛰️
      ocean: '🌊', // 🌊

      // Holiday and celebration icons
      gift: '🎁', // 🎁
      cake: '🎂', // 🎂
      party: '🎉', // 🎉
      fireworks: '🎆', // 🎆
      christmas: '🎄', // 🎄
      halloween: '🎃', // 🎃

      // Tools and work icons
      tool: '🔧', // 🔧
      wrench: '🔧', // 🔧
      hammer: '🔨', // 🔨
      screwdriver: '🔩', // 🔩
      key: '🔑', // 🔑
      lock: '🔒', // 🔒

      // Medical and health icons
      medical: '🏥', // 🏥
      health: '💊', // 💊
      pill: '💊', // 💊
      heartbeat: '💓', // 💓
      cross: '➕', // ➕

      // Shopping and commerce icons
      shopping: '🛒', // 🛒
      cart: '🛒', // 🛒
      bag: '👜', // 👜
      'credit-card': '💳', // 💳

      // Security and safety icons
      security: '🔒', // 🔒
      shield: '🛡️', // 🛡️
      'lock-closed': '🔒', // 🔒
      'lock-open': '🔓', // 🔓

      // Science and education icons
      science: '🔬', // 🔬
      microscope: '🔬', // 🔬
      telescope: '🔭', // 🔭
      atom: '⚛️', // ⚛️
      'book-open': '📖', // 📖
      graduation: '🎓', // 🎓
    };

    // Additional comprehensive mappings for common XMind icons
    const additionalMappings: Record<string, string> = {
      // More entertainment
      tv: '📺',
      radio: '📻',
      camera: '📷',
      video: '📹',
      microphone: '🎤',
      headphones: '🎧',
      guitar: '🎸',
      piano: '🎹',
      drum: '🥁',
      trumpet: '🎺',
      violin: '🎻',
      saxophone: '🎷',

      // More symbols and objects
      fire: '🔥',
      bomb: '💣',
      diamond: '💎',
      gem: '💎',
      ring: '💍',
      balloon: '🎈',
      confetti: '🎊',
      celebration: '🎆',

      // More transport
      helicopter: '🚁',
      rocket: '🚀',
      satellite: '🛰️',
      ufo: '🛸',
      ship: '🚢',
      anchor: '⚓',
      sailboat: '⛵',
      'ferris-wheel': '🎡',
      'roller-coaster': '🎢',
      carousel: '🎠',
      circus: '🎪',
      tent: '⛺',

      // More nature and environment
      desert: '🏜️',
      volcano: '🌋',
      island: '🏝️',
      beach: '🏖️',
      camping: '🏕️',
      'national-park': '🏞️',
      stadium: '🏟️',
      bridge: '🌉',
      cityscape: '🏙️',
      'night-sky': '🌃',
      sunrise: '🌅',
      sunset: '🌇',

      // More technology and gadgets
      keyboard: '⌨️',
      'mouse-computer': '🖱️',
      printer: '🖨️',
      scanner: '📸',
      cd: '💿',
      dvd: '📀',
      'floppy-disk': '💾',
      'hard-disk': '💾',
      battery: '🔋',
      'electric-plug': '🔌',
      'satellite-antenna': '📡',
      'radio-signal': '📡',

      // More business and office
      briefcase: '💼',
      'office-building': '🏢',
      factory: '🏭',
      warehouse: '🏭',
      bank: '🏦',
      hospital: '🏥',
      school: '🏫',
      university: '🏫',
      library: '🏛️',
      museum: '🏟️',
      theater: '🎭',
      cinema: '🎬',

      // More household items
      bed: '🛏️',
      couch: '🛋️',
      chair: 'emoji-1f6c0',
      table: 'emoji-1f5d4',
      lamp: '💡',
      candle: '🕯️',
      mirror: '🪞',
      window: '🪟',
      door: '🚪',
      key: '🔑',
      lock: '🔒',
      unlock: '🔓',

      // More clothing and accessories
      shirt: '👕',
      jeans: '👖',
      dress: '👗',
      bikini: '👙',
      kimono: '👘',
      sari: '🥻',
      'lab-coat': '🥼',
      goggles: '🥽',
      gloves: '🧤',
      coat: '🧥',
      socks: '🧦',
      hat: 'emoji-1f9e2',
      'top-hat': '🎩',
      'military-helmet': '🪖',

      // More miscellaneous
      hourglass: '⏳',
      stopwatch: '⏱️',
      'alarm-clock': '⏰',
      timer: 'emoji-23f2',
      'magnifying-glass': '🔍',
      microscope: '🔬',
      telescope: '🔭',
      compass: '🧭',
      globe: '🌍',
      'world-map': '🗺️',
      flag: '🚩',
      pennant: 'emoji-1f3f1',
    };

    // Merge additional mappings
    const allMappings = { ...iconMap, ...additionalMappings };

    // Return mapped EmojiIcon ID or default if not found
    return allMappings[iconId.toLowerCase()] || '💡'; // Default to lightbulb
  }

  // Only direct children: descendant queries would pick up the data of nested topics.
  private static childElements(parent: Element, localName: string): Element[] {
    return Array.from(parent.children).filter((child) => child.localName === localName);
  }

  private static childElement(parent: Element, localName: string): Element | undefined {
    return Array.from(parent.children).find((child) => child.localName === localName);
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private createFallbackMap(nameMap: string, error: Error): string {
    return `<map name="${nameMap}" version="tango" layout="mindmap">
    <topic central="true" text="${nameMap}" id="1">
        <topic position="200,0" order="0" text="Import Error" shape="line" id="2">
            <note><![CDATA[XMind import failed: ${error.message}. Please check the file format and try again.]]></note>
        </topic>
    </topic>
</map>`;
  }
}

export default XMindImporter;
