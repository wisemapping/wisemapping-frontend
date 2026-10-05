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
import Importer from './Importer';
import ImportError from './ImportError';
import Mindmap from '../model/Mindmap';
import RelationshipModel from '../model/RelationshipModel';
import NodeModel from '../model/NodeModel';
import FreemindConstant from '../export/freemind/FreemindConstant';
import FreemindMap from '../export/freemind/Map';
import FreemindNode, { Choise } from '../export/freemind/Node';
import FreemindEdge from '../export/freemind/Edge';
import FreemindIcon from '../export/freemind/Icon';
import FreemindFont from '../export/freemind/Font';
import FreemindHook from '../export/freemind/Hook';
import FreemindRichcontent from '../export/freemind/Richcontent';
import FreemindArrowlink from '../export/freemind/Arrowlink';
import VersionNumber from '../export/freemind/importer/VersionNumber';
import FreemindIconConverter from './FreemindIconConverter';
import NoteModel from '../model/NoteModel';
import FeatureModelFactory from '../model/FeatureModelFactory';
import FeatureModel from '../model/FeatureModel';
import XMLSerializerFactory from '../persistence/XMLSerializerFactory';
import { TopicShapeType } from '../model/INodeModel';
import ContentType from '../ContentType';
import HtmlSanitizer from '../security/HtmlSanitizer';
import SecureXmlParser from '../security/SecureXmlParser';
import { htmlToPlainText } from './support/HtmlText';
import { applyFreemindFont } from './support/FreemindFont';

export default class FreemindImporter extends Importer {
  private mindmap!: Mindmap;

  private freemindInput: string;

  private freemindMap!: FreemindMap;

  private nodesmap!: Map<string, NodeModel>;

  // Arrowlinks can point to nodes that have not been converted yet, so they are resolved once
  // the whole tree has been walked.
  private arrowlinks!: Array<{ source: NodeModel; arrowlink: FreemindArrowlink }>;

  private idDefault = 0;

  // Topic ids already given, so that two FreeMind ids never map to the same topic id.
  private usedIds!: Set<number>;

  constructor(map: string) {
    super();
    this.freemindInput = map;
  }

  import(nameMap: string, description: string): Promise<string> {
    try {
      return Promise.resolve(this.convert(nameMap, description));
    } catch (error) {
      return Promise.reject(ImportError.from(error, 'FreeMind'));
    }
  }

  private convert(nameMap: string, description: string): string {
    this.mindmap = new Mindmap(nameMap);
    this.nodesmap = new Map<string, NodeModel>();
    this.arrowlinks = [];
    this.idDefault = 0;
    this.usedIds = new Set<number>();

    // Use secure XML parser to prevent XXE attacks
    const freemindDoc = SecureXmlParser.parseSecureXml(this.freemindInput);
    if (!freemindDoc) {
      throw new Error('Failed to parse FreeMind XML - content may be unsafe');
    }
    this.freemindMap = new FreemindMap().loadFromDom(freemindDoc);

    const version: string | undefined = this.freemindMap.getVersion();

    if (!version || version.startsWith('freeplane')) {
      throw new Error(
        'You seems to be be trying to import a Freeplane map. FreePlane is not supported format.',
      );
    } else {
      const mapVersion: VersionNumber = new VersionNumber(version);
      if (mapVersion.isGreaterThan(FreemindConstant.SUPPORTED_FREEMIND_VERSION)) {
        throw new Error(`FreeMind version ${mapVersion.getVersion()} is not supported.`);
      }
    }

    const freeNode = this.freemindMap.getNode()!;
    this.mindmap.setVersion(FreemindConstant.CODE_VERSION);
    this.mindmap.setTheme('prism'); // Apply Prism theme for consistency

    const wiseTopicId = this.getIdNode(freeNode);
    const wiseTopic = this.mindmap.createNode('CentralTopic');
    wiseTopic.setPosition(0, 0);
    wiseTopic.setId(wiseTopicId);

    this.convertNodeProperties(freeNode, wiseTopic, true);

    this.nodesmap.set(freeNode.getId()!, wiseTopic);

    this.convertChildNodes(freeNode, wiseTopic, this.mindmap, 1);
    this.addRelationships(this.mindmap);

    this.mindmap.setDescription(description);
    this.mindmap.addBranch(wiseTopic);

    const serialize = XMLSerializerFactory.createFromMindmap(this.mindmap);
    const domMindmap = serialize.toXML(this.mindmap);
    const xmlToString = new XMLSerializer().serializeToString(domMindmap);
    const formatXml = xmlFormatter(xmlToString, {
      indentation: '    ',
      collapseContent: true,
      lineSeparator: '\n',
    });

    return formatXml;
  }

  private addRelationships(mindmap: Mindmap): void {
    this.arrowlinks.forEach(({ source, arrowlink }) => {
      const destId = arrowlink.getDestination();
      const destNode = destId ? this.nodesmap.get(destId) : undefined;
      if (destNode) {
        const relationship = new RelationshipModel(source.getId(), destNode.getId());

        // Set control points if available
        const endinclination = arrowlink.getEndInclination();
        if (endinclination) {
          const inclination: Array<string> = endinclination.split(';');
          if (inclination.length >= 2) {
            relationship.setDestCtrlPoint({
              x: parseFloat(inclination[0]),
              y: parseFloat(inclination[1]),
            });
          }
        }

        const startinclination = arrowlink.getStartinclination();
        if (startinclination) {
          const inclination: Array<string> = startinclination.split(';');
          if (inclination.length >= 2) {
            relationship.setSrcCtrlPoint({
              x: parseFloat(inclination[0]),
              y: parseFloat(inclination[1]),
            });
          }
        }

        const endarrow = arrowlink.getEndarrow();
        if (endarrow) {
          relationship.setEndArrow(endarrow.toLowerCase() !== 'none');
        }

        const startarrow = arrowlink.getStartarrow();
        if (startarrow) {
          relationship.setStartArrow(startarrow.toLowerCase() !== 'none');
        }

        this.fixRelationshipControlPoints(relationship, source, destNode);
        mindmap.addRelationship(relationship);
      }
    });
  }

  private fixRelationshipControlPoints(
    relationship: RelationshipModel,
    srcTopic: NodeModel,
    destTopic: NodeModel,
  ): void {
    // FreeMind measures the inclination away from the node, so it is mirrored for nodes on the left side.
    const srcCtrlPoint = relationship.getSrcCtrlPoint();
    if (srcCtrlPoint && srcTopic.getPositionOrThrow().x < 0) {
      relationship.setSrcCtrlPoint({ x: -srcCtrlPoint.x, y: srcCtrlPoint.y });
    }

    const destCtrlPoint = relationship.getDestCtrlPoint();
    if (destCtrlPoint && destTopic.getPositionOrThrow().x < 0) {
      relationship.setDestCtrlPoint({ x: -destCtrlPoint.x, y: destCtrlPoint.y });
    }
  }

  private convertNodeProperties(
    freeNode: FreemindNode,
    wiseTopic: NodeModel,
    centralTopic: boolean,
  ): void {
    const text = freeNode.getText();
    if (text) {
      if (!centralTopic && text.length > 100) {
        wiseTopic.setText(text.replace(/([^\n]{1,100})\s/g, '$1\n'));
      } else {
        wiseTopic.setText(text);
      }
    }

    const bgColor = freeNode.getBackgroundColor();
    if (bgColor) {
      wiseTopic.setBackgroundColor(bgColor);
    }

    // COLOR is the text color. The font is a child element, read with the other children.
    const color = freeNode.getColor();
    if (color) {
      wiseTopic.setFontColor(color);
    }

    if (centralTopic === false) {
      const shape = this.getShapeFromFreeNode(freeNode);
      if (shape) {
        wiseTopic.setShapeType(shape);
      }
    }

    // Is there any link...
    const url = freeNode.getLink();
    if (url) {
      const link: FeatureModel = FeatureModelFactory.createModel('link', { url });
      wiseTopic.addFeature(link);
    }

    const folded = Boolean(freeNode.getFolded());
    if (folded) wiseTopic.setChildrenShrunken(folded);
  }

  private convertChildNodes(
    freeParent: FreemindNode,
    wiseParent: NodeModel,
    mindmap: Mindmap,
    depth: number,
  ): void {
    const freeChilden = freeParent.getArrowlinkOrCloudOrEdge();
    let order = 0;

    freeChilden.forEach((child) => {
      if (child instanceof FreemindNode) {
        const wiseId = this.getIdNode(child);
        const wiseChild = mindmap.createNode('MainTopic', wiseId);

        const id = child.getId();
        if (id !== undefined) {
          this.nodesmap.set(id, wiseChild);
        }

        let norder: number;
        if (depth !== 1) {
          norder = order++;
        } else {
          // Use simple alternating order for first-level topics (0, 1, 2, 3...)
          norder = order++;
        }

        wiseChild.setOrder(norder);

        // Convert node position...
        const childrenCountSameSide = this.getChildrenCountSameSide(freeChilden, child);
        const position: { x: number; y: number } = this.convertPosition(
          wiseParent,
          child,
          depth,
          norder,
          childrenCountSameSide,
        );
        wiseChild.setPosition(position.x, position.y);

        // Convert the rest of the node properties...
        this.convertNodeProperties(child, wiseChild, false);

        this.convertChildNodes(child, wiseChild, mindmap, depth + 1);

        if (wiseChild !== wiseParent) {
          wiseParent.append(wiseChild);
        }
      }

      if (child instanceof FreemindFont) {
        applyFreemindFont(wiseParent, {
          name: child.getName(),
          size: child.getSize(),
          bold: child.getBold(),
          italic: child.getItalic(),
        });
      }

      // A FreeMind edge is the line that connects the node to its parent, and the default of its
      // children. The root node has no edge to a parent, but its children inherit its color.
      if (child instanceof FreemindEdge) {
        const edgeColor = child.getColor();
        if (edgeColor) {
          wiseParent.setConnectionColor(edgeColor);
        }
      }

      if (child instanceof FreemindIcon) {
        const freeIcon: FreemindIcon = child as FreemindIcon;
        const iconId = freeIcon.getBuiltin();
        if (iconId) {
          const wiseIcon = FreemindIconConverter.toWiseIcon(iconId);
          if (wiseIcon) {
            const mindmapIcon: FeatureModel = FeatureModelFactory.createModel(wiseIcon.type, {
              id: wiseIcon.id,
            });
            wiseParent.addFeature(mindmapIcon);
          }
        }
      }

      if (child instanceof FreemindHook) {
        // FreeMind 0.7 stored notes as hooks with a text. Other hooks (layout, reminders...) are not notes.
        const textNote = child.getText();
        if (textNote) {
          wiseParent.addFeature(new NoteModel({ text: textNote }));
        }
      }

      if (child instanceof FreemindRichcontent) {
        const type = child.getType();
        const html = child.getHtml();
        // Notes without any text, such as <p></p>, are skipped.
        if (html && (type === 'NODE' || !FreemindImporter.isEmptyHtml(html))) {
          // Preserve HTML content instead of converting to plain text
          const cleanHtml = this.cleanHtml(html);
          switch (type) {
            case 'NOTE': {
              const noteModel: FeatureModel = FeatureModelFactory.createModel('note', {
                text: cleanHtml || FreemindConstant.EMPTY_NOTE,
              });
              // Set contentType for rich text notes
              if (cleanHtml && cleanHtml !== FreemindConstant.EMPTY_NOTE) {
                (noteModel as NoteModel).setContentType(ContentType.HTML);
              }
              wiseParent.addFeature(noteModel);
              break;
            }

            case 'NODE': {
              // Topic text is plain (the model does not persist a content type for it), so the
              // rich text is kept as its text, one line per paragraph.
              wiseParent.setText(htmlToPlainText(cleanHtml));
              break;
            }

            default: {
              const noteModel: FeatureModel = FeatureModelFactory.createModel('note', {
                text: cleanHtml || FreemindConstant.EMPTY_NOTE,
              });
              // Set contentType for rich text notes
              if (cleanHtml && cleanHtml !== FreemindConstant.EMPTY_NOTE) {
                (noteModel as NoteModel).setContentType(ContentType.HTML);
              }
              wiseParent.addFeature(noteModel);
            }
          }
        }
      }

      if (child instanceof FreemindArrowlink) {
        this.arrowlinks.push({ source: wiseParent, arrowlink: child });
      }
    });
  }

  private getIdNode(node: FreemindNode): number {
    const id = node.getId();
    // FreeMind ids look like ID_1234. Ids that do not end in a number, or whose number is already
    // used (ID_5 and Freemind_Link_5), get a generated one.
    const idNumber = id !== undefined ? parseInt(id.split('_').pop()!, 10) : NaN;
    let idFreeToIdWise = idNumber;

    if (Number.isNaN(idNumber) || this.usedIds.has(idNumber)) {
      do {
        this.idDefault++;
      } while (this.usedIds.has(this.idDefault));
      idFreeToIdWise = this.idDefault;
    }

    this.usedIds.add(idFreeToIdWise);
    return idFreeToIdWise;
  }

  private getChildrenCountSameSide(freeChilden: Array<Choise>, freeChild: FreemindNode): number {
    let result = 0;
    let childSide = freeChild.getPosition();

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

  private getShapeFromFreeNode(node: FreemindNode): TopicShapeType {
    const shape = node.getStyle();

    let result: TopicShapeType;
    if (shape === 'bubble') {
      result = 'rounded rectangle';
    } else if (node.getBackgroundColor()) {
      result = 'rectangle';
    } else {
      result = 'line';
    }
    return result;
  }

  private convertPosition(
    wiseParent: NodeModel,
    freeChild: FreemindNode,
    depth: number,
    order: number,
    childrenCount: number,
  ): { x: number; y: number } {
    let x: number =
      FreemindConstant.CENTRAL_TO_TOPIC_DISTANCE +
      (depth - 1) * FreemindConstant.TOPIC_TO_TOPIC_DISTANCE;
    if (depth === 1) {
      const side = freeChild.getPosition();
      x *= side && FreemindConstant.POSITION_LEFT === side ? -1 : 1;
    } else {
      const position = wiseParent.getPositionOrThrow();
      x *= position.x < 0 ? -1 : 1;
    }

    let y: number;
    if (depth === 1) {
      if (order % 2 === 0) {
        const multiplier = (order + 1 - childrenCount) * 2;
        y = multiplier * FreemindConstant.ROOT_LEVEL_TOPIC_HEIGHT;
      } else {
        const multiplier = (order - childrenCount) * 2;
        y = multiplier * FreemindConstant.ROOT_LEVEL_TOPIC_HEIGHT;
      }
    } else {
      const position = wiseParent.getPositionOrThrow();
      y = Math.round(
        position.y -
          ((childrenCount / 2) * FreemindConstant.SECOND_LEVEL_TOPIC_HEIGHT -
            order * FreemindConstant.SECOND_LEVEL_TOPIC_HEIGHT),
      );
    }

    return {
      x,
      y,
    };
  }

  private static isEmptyHtml(html: string): boolean {
    const { body } = new DOMParser().parseFromString(html, 'text/html');
    return !body.textContent?.trim() && !body.querySelector('img');
  }

  private cleanHtml(content: string): string {
    // Use secure HTML sanitizer to prevent XSS and other injection attacks
    return HtmlSanitizer.sanitize(content);
  }
}
