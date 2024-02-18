/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import xmlFormatter from 'xml-formatter';
import { Mindmap } from '../..';
import INodeModel, { TopicShapeType } from '../model/INodeModel';
import RelationshipModel from '../model/RelationshipModel';
import SvgIconModel from '../model/SvgIconModel';
import FeatureModel from '../model/FeatureModel';
import LinkModel from '../model/LinkModel';
import NoteModel from '../model/NoteModel';
import PositionNodeType from '../PositionType';
import Exporter from './Exporter';
import FreemindConstant from './freemind/FreemindConstant';
import VersionNumber from './freemind/importer/VersionNumber';
import ObjectFactory from './freemind/ObjectFactory';
import FreemindMap from './freemind/Map';
import FreeminNode from './freemind/Node';
import Arrowlink from './freemind/Arrowlink';
import Richcontent from './freemind/Richcontent';
import Icon from './freemind/Icon';
import Edge from './freemind/Edge';
import Font from './freemind/Font';

class FreemindExporter extends Exporter {
  private mindmap: Mindmap;

  private nodeMap!: Map<number, FreeminNode>;

  private version: VersionNumber = FreemindConstant.SUPPORTED_FREEMIND_VERSION;

  private objectFactory!: ObjectFactory;

  private static wisweToFreeFontSize: Map<number, number> = new Map<number, number>();

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
    const xmlDoc = parser.parseFromString(xmlStr, mimeType);

    // FIXME: Fix error "unclosed tag: p" when exporting bug3 and enc
    // Is there any parsing error ?.
    /*
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      const xmmStr = new XMLSerializer().serializeToString(xmlDoc);
      console.log(xmmStr);
      throw new Error(`Unexpected error parsing: ${xmlStr}. Error: ${xmmStr}`);
    }
    */

    return xmlDoc;
  }

  extension(): string {
    return 'mm';
  }

  export(): Promise<string> {
    this.objectFactory = new ObjectFactory();
    this.nodeMap = new Map();

    const freemainMap: FreemindMap = this.objectFactory.createMap();
    freemainMap.setVesion(this.getVersionNumber());

    const main: FreeminNode = this.objectFactory.createNode();
    freemainMap.setNode(main);

    const centralTopic: INodeModel = this.mindmap.getCentralTopic();

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
      const srcNode: FreeminNode | undefined = this.nodeMap.get(relationship.getFromNode());
      const destNode: FreeminNode | undefined = this.nodeMap.get(relationship.getToNode());

      if (srcNode && destNode) {
        const arrowlink: Arrowlink = this.objectFactory.crateArrowlink();

        const idRel = destNode.getId();
        if (idRel) {
          arrowlink.setDestination(idRel);
        }

        if (relationship.getEndArrow() && relationship.getEndArrow()) {
          arrowlink.setEndarrow('Default');
        }

        if (relationship.getStartArrow() && relationship.getStartArrow()) {
          arrowlink.setStartarrow('Default');
        }

        srcNode.setArrowlinkOrCloudOrEdge(arrowlink);
      }
    });

    const freeToXml = freemainMap.toXml();
    const xmlToString = new XMLSerializer().serializeToString(freeToXml);
    const formatXml = xmlFormatter(xmlToString, {
      indentation: '    ',
      collapseContent: true,
      lineSeparator: '\n',
    });

    return Promise.resolve(formatXml);
  }

  private setTopicPropertiesToNode({
    freemindNode,
    mindmapTopic,
    isRoot,
  }: {
    freemindNode: FreeminNode;
    mindmapTopic: INodeModel;
    isRoot: boolean;
  }): void {
    freemindNode.setId(`ID_${mindmapTopic.getId()}`);

    const text = mindmapTopic.getText();

    if (text) {
      if (!text.includes('\n')) {
        freemindNode.setText(text);
      } else {
        const richcontent: Richcontent = this.buildRichcontent(text, 'NODE');
        freemindNode.setArrowlinkOrCloudOrEdge(richcontent);
      }
    }

    const wiseShape: TopicShapeType = mindmapTopic.getShapeType();
    if (wiseShape && wiseShape !== 'line') {
      const color = mindmapTopic.getBackgroundColor();
      if (color) {
        freemindNode.setBackgorundColor(this.rgbToHex(color));
      }
    }

    if (wiseShape) {
      const isRootRoundedRectangle = isRoot && wiseShape !== 'rounded rectangle';
      const notIsRootLine = !isRoot && wiseShape !== 'line';

      if (isRootRoundedRectangle || notIsRootLine) {
        let style: string = wiseShape;
        if (style === 'rounded rectangle' || style === 'elipse') {
          style = 'bubble';
        }
        freemindNode.setStyle(style);
      }
    } else if (!isRoot) freemindNode.setStyle('fork');

    this.addFeautreNode(freemindNode, mindmapTopic);
    this.addFontNode(freemindNode, mindmapTopic);
    this.addEdgeNode(freemindNode, mindmapTopic);
  }

  private addNodeFromTopic(mainTopic: INodeModel, destNode: FreeminNode): void {
    const curretnTopics: Array<INodeModel> = mainTopic.getChildren();

    curretnTopics.forEach((currentTopic: INodeModel) => {
      const newNode: FreeminNode = this.objectFactory.createNode();
      this.nodeMap.set(currentTopic.getId(), newNode);

      this.setTopicPropertiesToNode({
        freemindNode: newNode,
        mindmapTopic: currentTopic,
        isRoot: false,
      });

      destNode.setArrowlinkOrCloudOrEdge(newNode);

      this.addNodeFromTopic(currentTopic, newNode);

      const position: PositionNodeType = currentTopic.getPosition();
      if (position) {
        const xPos: number = position.x;
        newNode.setPosition(xPos < 0 ? 'left' : 'right');
      } else newNode.setPosition('left');
    });
  }

  private buildRichcontent(text: string, type: string): Richcontent {
    const richconent: Richcontent = this.objectFactory.createRichcontent();

    richconent.setType(type);

    const textSplit = text.split('\n');

    let html = '<html><head></head><body>';

    textSplit.forEach((line: string) => {
      html += `<p>${line.trim()}</p>`;
    });

    html += '</body></html>';

    const richconentDocument: Document = FreemindExporter.parserXMLString(html, 'application/xml');
    const xmlResult = new XMLSerializer().serializeToString(richconentDocument);
    richconent.setHtml(xmlResult);

    return richconent;
  }

  private addFeautreNode(freemindNode: FreeminNode, mindmapTopic: INodeModel): void {
    const branches: Array<FeatureModel> = mindmapTopic.getFeatures();

    branches.forEach((feature: FeatureModel) => {
      const type = feature.getType();

      if (type === 'link') {
        const link = feature as LinkModel;
        freemindNode.setLink(link.getUrl());
      }

      if (type === 'note') {
        const note = feature as NoteModel;
        const richcontent: Richcontent = this.buildRichcontent(note.getText(), 'NOTE');
        freemindNode.setArrowlinkOrCloudOrEdge(richcontent);
      }

      if (type === 'icon') {
        const icon = feature as SvgIconModel;
        const freemindIcon: Icon = new Icon();
        freemindIcon.setBuiltin(icon.getIconType());
        freemindNode.setArrowlinkOrCloudOrEdge(freemindIcon);
      }
    });
  }

  private addEdgeNode(freemainMap: FreeminNode, mindmapTopic: INodeModel): void {
    if (mindmapTopic.getBorderColor()) {
      const edgeNode: Edge = this.objectFactory.createEdge();
      const color = mindmapTopic.getBorderColor();
      if (color) {
        edgeNode.setColor(this.rgbToHex(color));
      }
      freemainMap.setArrowlinkOrCloudOrEdge(edgeNode);
    }
  }

  private addFontNode(freemindNode: FreeminNode, mindmapTopic: INodeModel): void {
    const fontFamily: string | undefined = mindmapTopic.getFontFamily();
    const fontSize: number | undefined = mindmapTopic.getFontSize();
    const fontColor: string | undefined = mindmapTopic.getFontColor();
    const fontWeigth: string | number | boolean | undefined = mindmapTopic.getFontWeight();
    const fontStyle: string | undefined = mindmapTopic.getFontStyle();

    if (fontFamily || fontSize || fontColor || fontWeigth || fontStyle) {
      const font: Font = this.objectFactory.createFont();
      let fontNodeNeeded = false;

      if (fontFamily) {
        font.setName(fontFamily);
      }

      if (fontSize) {
        const freeSize = FreemindExporter.wisweToFreeFontSize.get(fontSize);

        if (freeSize) {
          font.setSize(freeSize.toString());
          fontNodeNeeded = true;
        }
      }

      if (fontColor) {
        freemindNode.setColor(fontColor);
      }

      if (fontWeigth) {
        if (typeof fontWeigth === 'boolean') {
          font.setBold(String(fontWeigth));
        } else {
          font.setBold(String(true));
        }
        fontNodeNeeded = true;
      }

      if (fontStyle === 'italic') {
        font.setItalic(String(true));
      }

      if (fontNodeNeeded) {
        if (!font.getSize()) {
          const size = FreemindExporter.wisweToFreeFontSize.get(8);
          if (size) {
            font.setSize(size.toString());
          }
        }
        freemindNode.setArrowlinkOrCloudOrEdge(font);
      }
    }
  }

  private rgbToHex(color: string): string {
    let result: string = color;
    if (result) {
      const isRgb = /^rgb\([0-9]{1,3}, [0-9]{1,3}, [0-9]{1,3}\)$/;

      if (isRgb.test(result)) {
        const rgb: string[] = color.substring(4, color.length - 1).split(',');
        const r: string = rgb[0].trim();
        const g: string = rgb[1].trim();
        const b: string = rgb[2].trim();

        result = `#${r.length === 1 ? `0${r}` : r}${g.length === 1 ? `0${g}` : g}${
          b.length === 1 ? `0${b}` : b
        }`;
      }
    }
    return result;
  }

  private getVersion(): VersionNumber {
    return this.version;
  }

  private getVersionNumber(): string {
    return this.getVersion().getVersion();
  }
}

export default FreemindExporter;
