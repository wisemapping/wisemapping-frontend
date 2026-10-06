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
import xmlFormatter from 'xml-formatter';
import type Mindmap from '../model/Mindmap';
import type { TopicShapeType } from '../model/INodeModel';
import type INodeModel from '../model/INodeModel';
import type RelationshipModel from '../model/RelationshipModel';
import type FeatureModel from '../model/FeatureModel';
import ContentType from '../ContentType';
import type PositionNodeType from '../PositionType';
import Exporter from './Exporter';
import FreemindConstant from './freemind/FreemindConstant';
import type VersionNumber from './freemind/VersionNumber';
import type {
  FreemindArrowlink,
  FreemindFont,
  FreemindMap,
  FreemindNode,
  FreemindRichcontent,
} from './freemind/FreemindModel';
import { createFreemindNode } from './freemind/FreemindModel';
import { freemindMapToXml } from './freemind/FreemindXml';
import FreemindIconConverter from '../import/FreemindIconConverter';

class FreemindExporter extends Exporter {
  protected mindmap: Mindmap;

  private nodeMap!: Map<number, FreemindNode>;

  private version: VersionNumber = FreemindConstant.SUPPORTED_FREEMIND_VERSION;

  protected static wisweToFreeFontSize: Map<number, number> = new Map<number, number>();

  constructor(mindmap: Mindmap) {
    super(FreemindConstant.SUPPORTED_FREEMIND_VERSION.getVersion(), 'application/xml');
    this.mindmap = mindmap;
  }

  static {
    this.wisweToFreeFontSize.set(6, 10);
    this.wisweToFreeFontSize.set(8, 12);
    this.wisweToFreeFontSize.set(10, 18);
    this.wisweToFreeFontSize.set(15, 24);
  }

  private static parserXMLString(xmlStr: string, mimeType: DOMParserSupportedType): Document {
    const parser = new DOMParser();
    return parser.parseFromString(xmlStr, mimeType);
  }

  /** Copies an HTML node to an XML document, without the XHTML namespace. */
  private static htmlToXml(doc: Document, node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return doc.createTextNode(node.textContent || '');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }
    const source = node as Element;
    const element = doc.createElement(source.tagName.toLowerCase());
    Array.from(source.attributes).forEach((attr) => {
      try {
        element.setAttribute(attr.name, attr.value);
      } catch {
        // Not a valid XML attribute name: dropped.
      }
    });
    Array.from(source.childNodes).forEach((child) => {
      const copy = FreemindExporter.htmlToXml(doc, child);
      if (copy) {
        element.appendChild(copy);
      }
    });
    return element;
  }

  private static hasParserError(xmlDoc: Document): boolean {
    return xmlDoc.getElementsByTagName('parsererror').length > 0;
  }

  override extension(): string {
    return 'mm';
  }

  export(): Promise<string> {
    this.nodeMap = new Map();

    const main: FreemindNode = createFreemindNode();
    const freemainMap: FreemindMap = { version: this.getVersionNumber(), node: main };

    const centralTopic = this.mindmap.getCentralTopic();

    if (centralTopic) {
      this.nodeMap.set(centralTopic.getId(), main);
      this.setTopicPropertiesToNode({
        freemindNode: main,
        mindmapTopic: centralTopic,
        isRoot: true,
      });
      this.addNodeFromTopic(centralTopic, main);
    }

    const relationships: Array<RelationshipModel> = this.mindmap.getRelationships();
    relationships.forEach((relationship: RelationshipModel) => {
      const srcNode: FreemindNode | undefined = this.nodeMap.get(relationship.getFromNode());
      const destNode: FreemindNode | undefined = this.nodeMap.get(relationship.getToNode());

      if (srcNode && destNode) {
        srcNode.children.push(this.buildArrowlink(relationship, destNode));
      }
    });

    const freeToXml = freemindMapToXml(freemainMap);
    const xmlToString = new XMLSerializer().serializeToString(freeToXml);
    const formatXml = xmlFormatter(xmlToString, {
      indentation: '    ',
      collapseContent: true,
      lineSeparator: '\n',
    });

    return Promise.resolve(formatXml);
  }

  protected buildArrowlink(
    relationship: RelationshipModel,
    destNode: FreemindNode,
  ): FreemindArrowlink {
    return {
      kind: 'arrowlink',
      DESTINATION: destNode.ID,
      ENDARROW: relationship.getEndArrow() ? 'Default' : undefined,
      STARTARROW: relationship.getStartArrow() ? 'Default' : undefined,
    };
  }

  protected setTopicPropertiesToNode({
    freemindNode,
    mindmapTopic,
    isRoot,
  }: {
    freemindNode: FreemindNode;
    mindmapTopic: INodeModel;
    isRoot: boolean;
  }): void {
    freemindNode.ID = `ID_${mindmapTopic.getId()}`;

    this.addTextNode(freemindNode, mindmapTopic);

    const wiseShape: TopicShapeType | undefined = mindmapTopic.getShapeType();
    if (wiseShape && wiseShape !== 'line' && wiseShape !== undefined) {
      const color = mindmapTopic.getBackgroundColor();
      if (color) {
        freemindNode.BACKGROUND_COLOR = this.rgbToHex(color);
      }
    }

    const style = this.shapeToStyle(wiseShape, isRoot);
    if (style) {
      freemindNode.STYLE = style;
    }

    this.addFeautreNode(freemindNode, mindmapTopic);
    this.addFontNode(freemindNode, mindmapTopic);
    this.addEdgeNode(freemindNode, mindmapTopic);
  }

  protected addTextNode(freemindNode: FreemindNode, mindmapTopic: INodeModel): void {
    const text = mindmapTopic.getText();

    if (text) {
      if (mindmapTopic.getContentType() === ContentType.HTML) {
        // For rich text, always use richcontent to preserve HTML
        freemindNode.children.push(this.buildRichcontent(text, 'NODE', true));
      } else if (!text.includes('\n')) {
        freemindNode.TEXT = text;
      } else {
        freemindNode.children.push(this.buildRichcontent(text, 'NODE'));
      }
    }
  }

  // The STYLE of the node. The central topic is a rounded rectangle by default, the rest a line.
  protected shapeToStyle(shape: TopicShapeType | undefined, isRoot: boolean): string | undefined {
    if (!shape) {
      return isRoot ? undefined : 'fork';
    }
    if ((isRoot && shape !== 'rounded rectangle') || (!isRoot && shape !== 'line')) {
      return shape === 'rounded rectangle' || shape === 'elipse' ? 'bubble' : shape;
    }
    return undefined;
  }

  private addNodeFromTopic(mainTopic: INodeModel, destNode: FreemindNode): void {
    const curretnTopics: Array<INodeModel> = mainTopic.getChildren();

    curretnTopics.forEach((currentTopic: INodeModel) => {
      const newNode: FreemindNode = createFreemindNode();
      this.nodeMap.set(currentTopic.getId(), newNode);

      this.setTopicPropertiesToNode({
        freemindNode: newNode,
        mindmapTopic: currentTopic,
        isRoot: false,
      });

      destNode.children.push(newNode);

      this.addNodeFromTopic(currentTopic, newNode);

      const position: PositionNodeType | undefined = currentTopic.getPosition();
      if (position) {
        const xPos: number = position.x;
        newNode.POSITION = xPos < 0 ? 'left' : 'right';
      } else newNode.POSITION = 'right';
    });
  }

  protected buildRichcontent(text: string, type: string, isHtml = false): FreemindRichcontent {
    const richconentDocument: Document = FreemindExporter.parserXMLString(
      '<html><head></head><body></body></html>',
      'application/xml',
    );
    // The document parsed above always has a body.
    const body = richconentDocument.getElementsByTagName('body')[0]!;

    // Rich text is kept as markup. Plain text is added as text, so it is escaped.
    const markup = isHtml
      ? FreemindExporter.parserXMLString(`<body>${text}</body>`, 'application/xml')
      : undefined;
    if (markup && !FreemindExporter.hasParserError(markup)) {
      Array.from(markup.documentElement.childNodes).forEach((node) => {
        body.appendChild(richconentDocument.importNode(node, true));
      });
    } else if (isHtml) {
      // HTML that is not well formed XML, such as <br> or &nbsp;, is read as HTML and written as
      // XML, so its structure (nested lists, links...) is kept.
      const html = new DOMParser().parseFromString(text, 'text/html').body;
      Array.from(html.childNodes).forEach((node) => {
        const copy = FreemindExporter.htmlToXml(richconentDocument, node);
        if (copy) {
          body.appendChild(copy);
        }
      });
    } else {
      text.split('\n').forEach((line: string) => {
        const paragraph = richconentDocument.createElement('p');
        paragraph.textContent = line.trim();
        body.appendChild(paragraph);
      });
    }

    const html = new XMLSerializer().serializeToString(richconentDocument);
    return { kind: 'richcontent', TYPE: type, html };
  }

  private addFeautreNode(freemindNode: FreemindNode, mindmapTopic: INodeModel): void {
    const branches: Array<FeatureModel> = mindmapTopic.getFeatures();

    branches.forEach((feature: FeatureModel) => {
      if (feature.isOfType('link')) {
        freemindNode.LINK = feature.getUrl();
      }

      if (feature.isOfType('note')) {
        const note = feature;
        freemindNode.children.push(
          this.buildRichcontent(note.getText(), 'NOTE', note.getContentType() === ContentType.HTML),
        );
      }

      if (feature.isOfType('icon') || feature.isOfType('eicon')) {
        const builtin = this.iconBuiltin(feature);
        if (builtin) {
          freemindNode.children.push({ kind: 'icon', BUILTIN: builtin });
        }
      }
    });
  }

  /**
   * The builtin icon of an icon feature, null to skip it. Emoji icons are exported as the equivalent
   * FreeMind builtin icon, if there is one.
   */
  protected iconBuiltin(feature: FeatureModel): string | null {
    if (feature.isOfType('icon')) {
      return FreemindIconConverter.svgToFreemindIcon(feature.getIconType());
    }
    if (feature.isOfType('eicon')) {
      return FreemindIconConverter.toFreemindIcon(feature.getIconType());
    }
    return null;
  }

  // A FreeMind edge is the line that connects the node to its parent, the WiseMapping connection.
  // FreeMind has no border color, so it is not exported.
  private addEdgeNode(freemindNode: FreemindNode, mindmapTopic: INodeModel): void {
    const color = mindmapTopic.getConnectionColor();
    if (color) {
      freemindNode.children.push({ kind: 'edge', COLOR: this.rgbToHex(color) });
    }
  }

  protected addFontNode(freemindNode: FreemindNode, mindmapTopic: INodeModel): void {
    const fontFamily: string | undefined = mindmapTopic.getFontFamily();
    const fontSize: number | undefined = mindmapTopic.getFontSize();
    const fontColor: string | undefined = mindmapTopic.getFontColor();
    const fontWeigth: string | number | boolean | undefined = mindmapTopic.getFontWeight();
    const fontStyle: string | undefined = mindmapTopic.getFontStyle();

    if (fontFamily || fontSize || fontColor || fontWeigth || fontStyle) {
      const font: FreemindFont = { kind: 'font' };
      let fontNodeNeeded = false;

      if (fontFamily) {
        font.NAME = fontFamily;
        fontNodeNeeded = true;
      }

      if (fontSize) {
        const freeSize = FreemindExporter.wisweToFreeFontSize.get(fontSize);

        if (freeSize) {
          font.SIZE = freeSize.toString();
          fontNodeNeeded = true;
        }
      }

      if (fontColor) {
        freemindNode.COLOR = fontColor;
      }

      // 'normal' (or any weight under 600) is not bold. Legacy maps may hold a boolean.
      const weight = String(fontWeigth);
      const isBold = weight === 'bold' || weight === 'true' || Number(weight) >= 600;
      if (isBold) {
        font.BOLD = String(true);
        fontNodeNeeded = true;
      }

      if (fontStyle === 'italic') {
        font.ITALIC = String(true);
        fontNodeNeeded = true;
      }

      if (fontNodeNeeded) {
        if (!font.SIZE) {
          const size = FreemindExporter.wisweToFreeFontSize.get(8);
          if (size) {
            font.SIZE = size.toString();
          }
        }
        freemindNode.children.push(font);
      }
    }
  }

  protected rgbToHex(color: string): string {
    let result: string = color;
    if (result) {
      const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(result.trim());

      if (rgb) {
        const hex = rgb
          .slice(1)
          .map((channel) => Math.min(255, parseInt(channel, 10)).toString(16).padStart(2, '0'));
        result = `#${hex.join('')}`;
      }
    }
    return result;
  }

  private getVersion(): VersionNumber {
    return this.version;
  }

  protected getVersionNumber(): string {
    return this.getVersion().getVersion();
  }
}

export default FreemindExporter;
