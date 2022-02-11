import { Mindmap } from '../..';
import INodeModel, { TopicShape } from '../model/INodeModel';
import RelationshipModel from '../model/RelationshipModel';
import IconModel from '../model/IconModel';
import FeatureModel from '../model/FeatureModel';
import LinkModel from '../model/LinkModel';
import NoteModel from '../model/NoteModel';
import Exporter from './Exporter';
import FreemindConstant from './freemind/FreemindConstant';
import VersionNumber from './freemind/importer/VersionNumber';
import ObjectFactory from './freemind/ObjectFactory';
import FreemindMap from './freemind/Map';
import FreeminNode, { Choise } from './freemind/Node';
import Arrowlink from './freemind/Arrowlink';
import Richcontent from './freemind/Richcontent';
import Icon from './freemind/Icon';
import Edge from './freemind/Edge';
import Font from './freemind/Font';

type PositionNodeType = {x: number, y: number}

class FreemindExporter implements Exporter {
  private mindmap: Mindmap;

  private nodeMap: Map<number, FreeminNode> = null;

  private version: VersionNumber = FreemindConstant.SUPPORTED_FREEMIND_VERSION;

  private objectFactory: ObjectFactory;

  private static wisweToFreeFontSize: Map<number, number> = new Map<number, number>();

  constructor(mindmap: Mindmap) {
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

    // Is there any parsing error ?.
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      const xmmStr = new XMLSerializer().serializeToString(xmlDoc);
      console.log(xmmStr);
      throw new Error(`Unexpected error parsing: ${xmlStr}. Error: ${xmmStr}`);
    }

    return xmlDoc;
  }

  extension(): string {
    return 'mm';
  }

  async export(): Promise<string> {
    this.objectFactory = new ObjectFactory();
    this.nodeMap = new Map();

    const freemainMap: FreemindMap = this.objectFactory.createMap();
    freemainMap.setVesion(this.getVersionNumber());

    const main: FreeminNode = this.objectFactory.createNode();
    freemainMap.setNode(main);

    const centralTopic: INodeModel = this.mindmap.getCentralTopic();

    if (centralTopic) {
      this.nodeMap.set(centralTopic.getId(), main);
      this.setTopicPropertiesToNode(main, centralTopic, true);
      this.addNodeFromTopic(centralTopic, main);
    }

    const relationships: Array<RelationshipModel> = this.mindmap.getRelationships();
    relationships.forEach((relationship: RelationshipModel) => {
      const srcNode: FreeminNode = this.nodeMap.get(relationship.getFromNode());
      const destNode: FreeminNode = this.nodeMap.get(relationship.getToNode());

      if (srcNode && destNode) {
        const arrowlink: Arrowlink = this.objectFactory.crateArrowlink();

        arrowlink.setDestination(destNode.getId());

        if (relationship.getEndArrow() && relationship.getEndArrow()) arrowlink.setEndarrow('Default');

        if (relationship.getStartArrow() && relationship.getStartArrow()) arrowlink.setStartarrow('Default');

        const cloudEdge: Array<Choise> = srcNode.getArrowlinkOrCloudOrEdge();

        cloudEdge.push(arrowlink);
      }
    });

    const freeToXml = freemainMap.toXml();
    const xmlToString = new XMLSerializer().serializeToString(freeToXml);

    return Promise.resolve(xmlToString);
  }

  private addNodeFromTopic(mainTopic: INodeModel, destNode: FreeminNode): void {
    const curretnTopics: Array<INodeModel> = mainTopic.getChildren();

    curretnTopics.forEach((currentTopic: INodeModel) => {
      const newNode: FreeminNode = this.objectFactory.createNode();
      this.nodeMap.set(currentTopic.getId(), newNode);

      this.setTopicPropertiesToNode(newNode, currentTopic, false);

      destNode.getArrowlinkOrCloudOrEdge().push(newNode);

      this.addNodeFromTopic(currentTopic, newNode);

      const position: PositionNodeType = currentTopic.getPosition();
      if (position) {
        const xPos: number = position.x;
        newNode.setPosition((xPos < 0 ? 'left' : 'right'));
      } else newNode.setPosition('left');
    });
  }

  private setTopicPropertiesToNode(freemindNode: FreeminNode, mindmapTopic: INodeModel, isRoot: boolean): void {
    freemindNode.setId(`ID_${mindmapTopic.getId()}`);

    const text = mindmapTopic.getText();

    if (!text.includes('\n')) {
      freemindNode.setText(text);
    } else {
      const richcontent: Richcontent = this.buildRichcontent(text, 'NODE');
      freemindNode.getArrowlinkOrCloudOrEdge().push(richcontent);
    }

    const wiseShape: string = mindmapTopic.getShapeType();
    if (wiseShape && TopicShape.LINE !== wiseShape) {
      freemindNode.setBackgorundColor(this.rgbToHex(mindmapTopic.getBackgroundColor()));
    }

    if (wiseShape && !wiseShape) {
      const isRootRoundedRectangle = isRoot && TopicShape.ROUNDED_RECT !== wiseShape;
      const notIsRootLine = !isRoot && TopicShape.LINE !== wiseShape;

      if (isRootRoundedRectangle || notIsRootLine) {
        let style: string = wiseShape;
        if (TopicShape.ROUNDED_RECT === style || TopicShape.ELLIPSE === style) {
          style = 'bubble';
        }
        freemindNode.setStyle(style);
      }
    } else if (!isRoot) freemindNode.setStyle('fork');

    this.addFeautreNode(freemindNode, mindmapTopic);
    this.addFontNode(freemindNode, mindmapTopic);
    this.addEdgeNode(freemindNode, mindmapTopic);
  }

  private buildRichcontent(text: string, type: string): Richcontent {
    const richconent: Richcontent = this.objectFactory.createRichcontent();

    richconent.setType(type);
    let html = '<html><body>';

    text.split('\n').forEach((line: string) => {
      html += `<p>${line.trim()}</p>`;
    });

    html += '</body></html>';

    const richconentDocument: Document = FreemindExporter.parserXMLString(html, 'application/xml');
    const xmlResult = new XMLSerializer().serializeToString(richconentDocument);
    richconent.setHtml(xmlResult);

    return richconent;
  }

  private addFeautreNode(freemindNode: FreeminNode, mindmapTopic: INodeModel): void {
    const branches: Array<INodeModel> = mindmapTopic.getChildren();
    const freemindIcon: Icon = new Icon();

    branches
      .filter((node: INodeModel) => node.getText !== undefined)
      .forEach((node: INodeModel) => {
        node.getFeatures().forEach((feature: FeatureModel) => {
          const type = feature.getType();

          if (type === 'link') {
            const link = feature as LinkModel;
            freemindNode.setLink(link);
          }

          if (type === 'note') {
            const note = feature as NoteModel;
            const richcontent: Richcontent = this.buildRichcontent(note.getText(), 'NOTE');
            freemindNode.getArrowlinkOrCloudOrEdge().push(richcontent);
          }

          if (type === 'icon') {
            const icon = feature as IconModel;
            freemindIcon.setBuiltin(icon.getIconType());
            freemindNode.getArrowlinkOrCloudOrEdge().push(freemindIcon);
          }
        });
      });
  }

  private addEdgeNode(freemainMap: FreeminNode, mindmapTopic: INodeModel): void {
    if (mindmapTopic.getBorderColor()) {
      const edgeNode: Edge = this.objectFactory.createEdge();
      edgeNode.setColor(this.rgbToHex(mindmapTopic.getBorderColor()));
      freemainMap.getArrowlinkOrCloudOrEdge().push(edgeNode);
    }
  }

  private addFontNode(freemindNode: FreeminNode, mindmapTopic: INodeModel): void {
    const fontStyle: string = mindmapTopic.getFontStyle();
    if (fontStyle) {
      const font: Font = this.objectFactory.createFont();
      const part: Array<string> = fontStyle.split(';', 6);
      const countParts: number = part.length;
      let fontNodeNeeded = false;

      if (!fontStyle.endsWith(FreemindConstant.EMPTY_FONT_STYLE)) {
        let idx = 0;

        if (idx < countParts && part[idx].length !== 0) {
          font.setName(part[idx]);
          fontNodeNeeded = true;
        }
        idx++;

        if (idx < countParts && part[idx].length !== 0) {
          const size: string = part[idx];
          if (size) {
            const wiseSize: number = parseInt(size, 10);
            const freeSize: number = FreemindExporter.wisweToFreeFontSize.get(wiseSize);

            if (freeSize) {
              font.setSize(freeSize.toString());
              fontNodeNeeded = true;
            }
          }
        }
        idx++;

        if (idx < countParts && part[idx].length !== 0) {
          freemindNode.setColor(this.rgbToHex(part[idx]));
        }
        idx++;

        if (idx < countParts && part[idx].length !== 0) {
          font.setBold(String(true));
          fontNodeNeeded = true;
        }
        idx++;

        if (idx < countParts && part[idx].length !== 0) {
          font.setItalic(String(true));
          fontNodeNeeded = true;
        }

        if (fontNodeNeeded) {
          if (font.getSize() === null) {
            font.setSize(FreemindExporter.wisweToFreeFontSize.get(8).toString());
          }
          freemindNode.getArrowlinkOrCloudOrEdge().push(font);
        }
      }
    }
  }

  private rgbToHex(color: string): string {
    let result: string = color;
    if (result) {
      const isRgb = new RegExp('^rgb\\([0-9]{1,3}, [0-9]{1,3}, [0-9]{1,3}\\)$');

      if (isRgb.test(result)) {
        const rgb: string[] = color.substring(4, color.length - 1).split(',');
        const r: string = rgb[0].trim();
        const g: string = rgb[1].trim();
        const b: string = rgb[2].trim();

        result = `#${r.length === 1 ? `0${r}` : r}${g.length === 1 ? `0${g}` : g}${b.length === 1 ? `0${b}` : b}`;
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
