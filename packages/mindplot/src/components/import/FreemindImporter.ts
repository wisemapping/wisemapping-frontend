import xmlFormatter from 'xml-formatter';
import Importer from './Importer';
import Mindmap from '../model/Mindmap';
import RelationshipModel from '../model/RelationshipModel';
import NodeModel from '../model/NodeModel';
import { TopicShape } from '../model/INodeModel';
import FreemindConstant from '../export/freemind/FreemindConstant';
import FreemindMap from '../export/freemind/Map';
import FreemindNode, { Choise } from '../export/freemind/Node';
import FreemindFont from '../export/freemind/Font';
import FreemindEdge from '../export/freemind/Edge';
import FreemindIcon from '../export/freemind/Icon';
import FreemindHook from '../export/freemind/Hook';
import FreemindRichcontent from '../export/freemind/Richcontent';
import FreemindArrowLink from '../export/freemind/Arrowlink';
import VersionNumber from '../export/freemind/importer/VersionNumber';
import FreemindIconConverter from './FreemindIconConverter';
import NoteModel from '../model/NoteModel';
import FeatureModelFactory from '../model/FeatureModelFactory';
import FeatureModel from '../model/FeatureModel';
import XMLSerializerFactory from '../persistence/XMLSerializerFactory';

export default class FreemindImporter extends Importer {
  private mindmap: Mindmap;

  private freemindInput: string;

  private freemindMap: FreemindMap;

  private nodesmap: Map<string, NodeModel>;

  private relationship: Array<RelationshipModel>;

  private idDefault = 0;

  constructor(map: string) {
    super();
    this.freemindInput = map;
  }

  import(nameMap: string, description: string): Promise<string> {
    this.mindmap = new Mindmap(nameMap);
    this.nodesmap = new Map<string, NodeModel>();
    this.relationship = new Array<RelationshipModel>();

    const parser = new DOMParser();
    const freemindDoc = parser.parseFromString(this.freemindInput, 'application/xml');
    this.freemindMap = new FreemindMap().loadFromDom(freemindDoc);

    const version: string = this.freemindMap.getVersion();

    if (!version || version.startsWith('freeplane')) {
      throw new Error('You seems to be be trying to import a Freeplane map. FreePlane is not supported format.');
    } else {
      const mapVersion: VersionNumber = new VersionNumber(version);
      if (mapVersion.isGreaterThan(FreemindConstant.SUPPORTED_FREEMIND_VERSION)) {
        throw new Error(`FreeMind version ${mapVersion.getVersion()} is not supported.`);
      }
    }

    const freeNode: FreemindNode = this.freemindMap.getNode();
    this.mindmap.setVersion(FreemindConstant.CODE_VERSION);

    const wiseTopicId = this.getIdNode(this.freemindMap.getNode());
    const wiseTopic = this.mindmap.createNode('CentralTopic');
    wiseTopic.setPosition(0, 0);
    wiseTopic.setId(wiseTopicId);

    this.convertNodeProperties(freeNode, wiseTopic, true);

    this.nodesmap.set(freeNode.getId(), wiseTopic);

    this.convertChildNodes(freeNode, wiseTopic, this.mindmap, 1);
    this.addRelationship(this.mindmap);

    this.mindmap.setDescription(description);
    this.mindmap.addBranch(wiseTopic);

    const serialize = XMLSerializerFactory.createInstanceFromMindmap(this.mindmap);
    const domMindmap = serialize.toXML(this.mindmap);
    const xmlToString = new XMLSerializer().serializeToString(domMindmap);
    const formatXml = xmlFormatter(xmlToString, {
      indentation: '    ',
      collapseContent: true,
      lineSeparator: '\n',
    });

    return Promise.resolve(formatXml);
  }

  private addRelationship(mindmap: Mindmap): void {
    const mapRelaitonship: Array<RelationshipModel> = mindmap.getRelationships();

    mapRelaitonship.forEach((relationship: RelationshipModel) => {
      this.fixRelationshipControlPoints(relationship);

      // Fix dest ID
      const destId: string = relationship.getDestCtrlPoint();
      const destTopic: NodeModel = this.nodesmap.get(destId);
      relationship.setDestCtrlPoint(destTopic.getId());

      // Fix src ID
      const srcId: string = relationship.getSrcCtrlPoint();
      const srcTopic: NodeModel = this.nodesmap.get(srcId);
      relationship.setSrcCtrlPoint(srcTopic.getId());

      mapRelaitonship.push(relationship);
    });
  }

  private fixRelationshipControlPoints(relationship: RelationshipModel): void {
    const srcTopic: NodeModel = this.nodesmap.get(relationship.getToNode().toString());
    const destNode: NodeModel = this.nodesmap.get(relationship.getFromNode().toString());

    // Fix x coord
    const srcCtrlPoint: string = relationship.getSrcCtrlPoint();
    if (srcCtrlPoint) {
      const coords = srcTopic.getPosition();
      if (coords.x < 0) {
        const x = coords.x * -1;
        relationship.setSrcCtrlPoint(`${x},${coords.y}`);

        // Fix coord
        if (srcTopic.getOrder() && srcTopic.getOrder() % 2 !== 0) {
          const y = coords.y * -1;
          relationship.setSrcCtrlPoint(`${coords.x},${y}`);
        }
      }
    }

    const destCtrlPoint: string = relationship.getDestCtrlPoint();
    if (destCtrlPoint) {
      const coords = destNode.getPosition();

      if (coords.x < 0) {
        const x = coords.x * -1;
        relationship.setDestCtrlPoint(`${x},${coords.y}`);
      }

      if (destNode.getOrder() && destNode.getOrder() % 2 !== 0) {
        const y = coords.y * -1;
        relationship.setDestCtrlPoint(`${coords.x},${y}`);
      }
    }
  }

  private convertNodeProperties(freeNode: FreemindNode, wiseTopic: NodeModel, centralTopic: boolean): void {
    const text: string = freeNode.getText();
<<<<<<< HEAD
    if (text) {
      if (!centralTopic && text.length > 100) {
        wiseTopic.setText(text.replace(/([^\n]{1,100})\s/g, '$1\n'));
      } else {
        wiseTopic.setText(text);
      }
    }
=======
    if (text) wiseTopic.setText(text);
>>>>>>> 5901b660deddff72765594a2aadd5045e7061043

    const bgColor: string = freeNode.getBackgorundColor();
    if (bgColor) wiseTopic.setBackgroundColor(bgColor);

    if (centralTopic === false) {
      const shape = this.getShapeFromFreeNode(freeNode);
      if (shape && shape !== 'fork') wiseTopic.setShapeType(shape);
    }

    // Check for style...
    const fontStyle = this.generateFontStyle(freeNode, null);
    if (fontStyle && fontStyle !== ';;;;') wiseTopic.setFontStyle(fontStyle);

    // Is there any link...
    const url: string = freeNode.getLink();
    if (url) {
      const link: FeatureModel = FeatureModelFactory.createModel('link', { url });
      wiseTopic.addFeature(link);
    }

    const folded = Boolean(freeNode.getFolded());
    if (folded) wiseTopic.setChildrenShrunken(folded);
  }

  private convertChildNodes(freeParent: FreemindNode, wiseParent: NodeModel, mindmap: Mindmap, depth: number): void {
    const freeChilden = freeParent.getArrowlinkOrCloudOrEdge();
    let currentWiseTopic: NodeModel = wiseParent;
    let order = 0;
    let firstLevelRightOrder = 0;
    let firstLevelLeftOrder = 1;

    freeChilden.forEach((child) => {
      if (child instanceof FreemindNode) {
        const wiseId = this.getIdNode(child);
        const wiseChild = mindmap.createNode('MainTopic', wiseId);

        this.nodesmap.set(child.getId(), wiseChild);

        let norder: number;
        if (depth !== 1) {
          norder = order++;
        } else if (child.getPosition() && child.getPosition() === FreemindConstant.POSITION_LEFT) {
          norder = firstLevelLeftOrder;
          firstLevelLeftOrder += 2;
        } else {
          norder = firstLevelRightOrder;
          firstLevelRightOrder += 2;
        }

        wiseChild.setOrder(norder);

        // Convert node position...
        const childrenCountSameSide = this.getChildrenCountSameSide(freeChilden, child);
        const position: {x: number, y: number} = this.convertPosition(wiseParent, child, depth, norder, childrenCountSameSide);
        wiseChild.setPosition(position.x, position.y);

        // Convert the rest of the node properties...
        this.convertNodeProperties(child, wiseChild, false);

        this.convertChildNodes(child, wiseChild, mindmap, depth++);

        if (wiseChild !== wiseParent) {
          wiseParent.append(wiseChild);
        }

        currentWiseTopic = wiseChild;
      }

      if (child instanceof FreemindFont) {
        const font: FreemindFont = child as FreemindFont;
        const fontStyle: string = this.generateFontStyle(freeParent, font);
        if (fontStyle) {
          currentWiseTopic.setFontStyle(fontStyle);
        }
      }

      if (child instanceof FreemindEdge) {
        const edge: FreemindEdge = child as FreemindEdge;
        currentWiseTopic.setBackgroundColor(edge.getColor());
      }

      if (child instanceof FreemindIcon) {
        const freeIcon: FreemindIcon = child as FreemindIcon;
        const iconId: string = freeIcon.getBuiltin();
        const wiseIconId = FreemindIconConverter.toWiseId(iconId);
        if (wiseIconId) {
          const mindmapIcon: FeatureModel = FeatureModelFactory.createModel('icon', { id: wiseIconId });
          currentWiseTopic.addFeature(mindmapIcon);
        }
      }

      if (child instanceof FreemindHook) {
        const hook: FreemindHook = child as FreemindHook;
        const mindmapNote: NoteModel = new NoteModel({ text: '' });

        let textNote: string = hook.getText();
        if (!textNote) {
          textNote = FreemindConstant.EMPTY_NOTE;
          mindmapNote.setText(textNote);
          currentWiseTopic.addFeature(mindmapNote);
        }
      }

      if (child instanceof FreemindRichcontent) {
        const type = child.getType();
        const html = child.getHtml();
        const text = this.html2Text(html);

        switch (type) {
          case 'NOTE': {
            const noteModel: FeatureModel = FeatureModelFactory.createModel('note', { text: text || FreemindConstant.EMPTY_NOTE });
            currentWiseTopic.addFeature(noteModel);
            break;
          }

          case 'NODE': {
            currentWiseTopic.setText(text);
            break;
          }

          default: {
            const noteModel: FeatureModel = FeatureModelFactory.createModel('note', { text: text || FreemindConstant.EMPTY_NOTE });
            currentWiseTopic.addFeature(noteModel);
          }
        }
      }

      if (child instanceof FreemindArrowLink) {
        const arrow: FreemindArrowLink = child as FreemindArrowLink;
        const relationship: RelationshipModel = new RelationshipModel(0, 0);
        const destId: string = arrow.getDestination();

        relationship.setSrcCtrlPoint(destId);
        relationship.setDestCtrlPoint(freeParent.getId());
        const endinclination: string = arrow.getEndInclination();
        if (endinclination) {
          const inclination: Array<string> = endinclination.split(';');
          relationship.setDestCtrlPoint(`${inclination[0]},${inclination[1]}`);
        }

        const startinclination: string = arrow.getStartinclination();
        if (startinclination) {
          const inclination: Array<string> = startinclination.split(';');
          relationship.setSrcCtrlPoint(`${inclination[0]},${inclination[1]}`);
        }

        const endarrow: string = arrow.getEndarrow();
        if (endarrow) {
          relationship.setEndArrow(endarrow.toLowerCase() !== 'none');
        }

        const startarrow: string = arrow.getStartarrow();
        if (startarrow) {
          relationship.setStartArrow(startarrow.toLowerCase() !== 'none');
        }

        relationship.setLineType(3);
        this.relationship.push(relationship);
      }
    });
  }

  private getIdNode(node: FreemindNode): number {
    const id = node.getId();
    let idFreeToIdWise: number;

    if (id) {
      if (id === '_') {
        this.idDefault++;
        idFreeToIdWise = this.idDefault;
      } else {
        idFreeToIdWise = parseInt(id.split('_').pop(), 10);
      }
    } else {
      this.idDefault++;
      idFreeToIdWise = this.idDefault;
    }

    return idFreeToIdWise;
  }

  private getChildrenCountSameSide(freeChilden: Array<Choise>, freeChild: FreemindNode): number {
    let result = 0;
    let childSide: string = freeChild.getPosition();

    if (!childSide) {
      childSide = FreemindConstant.POSITION_RIGHT;
    }

    freeChilden.forEach((child) => {
      if (child instanceof FreemindNode) {
        let side = child.getPosition();
        if (!side) {
          side = FreemindConstant.POSITION_RIGHT;
        }
        if (childSide === side) {
          result++;
        }
      }
    });

    return result;
  }

  private getShapeFromFreeNode(node: FreemindNode): string {
    let result: string = node.getStyle();

    if (result === 'bubble') {
      result = TopicShape.ROUNDED_RECT;
    } else if (node.getBackgorundColor()) {
      result = TopicShape.RECTANGLE;
    } else {
      result = TopicShape.LINE;
    }
    return result;
  }

  private generateFontStyle(node: FreemindNode, font: FreemindFont | undefined): string {
    const fontStyle: Array<string> = [];

    // Font family
    if (font) {
      fontStyle.push(font.getName());
    }
    fontStyle.push(';');

    // Font Size
    if (font) {
      const fontSize: number = ((!font.getSize() || parseInt(font.getSize(), 10) < 8) ? FreemindConstant.FONT_SIZE_NORMAL : parseInt(font.getSize(), 10));
      let wiseFontSize: number = FreemindConstant.FONT_SIZE_SMALL;
      if (fontSize >= 24) {
        wiseFontSize = FreemindConstant.FONT_SIZE_HUGE;
      }
      if (fontSize >= 16) {
        wiseFontSize = FreemindConstant.FONT_SIZE_LARGE;
      }
      if (fontSize >= 8) {
        wiseFontSize = FreemindConstant.FONT_SIZE_NORMAL;
      }
      fontStyle.push(wiseFontSize.toString());
    }
    fontStyle.push(';');

    // Font Color
    const color: string = node.getColor();
    if (color && color !== '') {
      fontStyle.push(color);
    }
    fontStyle.push(';');

    // Font Italic
    if (font) {
      const hasItalic = Boolean(font.getItalic());
      fontStyle.push(hasItalic ? FreemindConstant.ITALIC : '');
    }
    fontStyle.push(';');

    const result: string = fontStyle.join('');
    return result;
  }

  private convertPosition(wiseParent: NodeModel, freeChild: FreemindNode, depth: number, order: number, childrenCount: number): {x: number, y: number} {
    let x: number = FreemindConstant.CENTRAL_TO_TOPIC_DISTANCE + ((depth - 1) * FreemindConstant.TOPIC_TO_TOPIC_DISTANCE);
    if (depth === 1) {
      const side: string = freeChild.getPosition();
      x *= (side && FreemindConstant.POSITION_LEFT === side ? -1 : 1);
    } else {
      const position = wiseParent.getPosition();
      x *= position.x < 0 ? 1 : -1;
    }

    let y: number;
    if (depth === 1) {
      if (order % 2 === 0) {
        const multiplier = ((order + 1) - childrenCount) * 2;
        y = multiplier * FreemindConstant.ROOT_LEVEL_TOPIC_HEIGHT;
      } else {
        const multiplier = (order - childrenCount) * 2;
        y = multiplier * FreemindConstant.ROOT_LEVEL_TOPIC_HEIGHT;
      }
    } else {
      const position = wiseParent.getPosition();
      y = Math.round(position.y - ((childrenCount / 2) * FreemindConstant.SECOND_LEVEL_TOPIC_HEIGHT - (order * FreemindConstant.SECOND_LEVEL_TOPIC_HEIGHT)));
    }

    return {
      x,
      y,
    };
  }

  private html2Text(content: string): string {
    const temporalDivElement = document.createElement('div');
    temporalDivElement.innerHTML = content;
    return temporalDivElement.textContent.trim() || temporalDivElement.innerText.trim() || '';
  }
}
