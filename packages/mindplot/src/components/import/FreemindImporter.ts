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
import Mindmap from '../model/Mindmap';
import RelationshipModel from '../model/RelationshipModel';
import NodeModel from '../model/NodeModel';
import FreemindConstant from '../export/freemind/FreemindConstant';
import FreemindMap from '../export/freemind/Map';
import FreemindNode, { Choise } from '../export/freemind/Node';
import FreemindEdge from '../export/freemind/Edge';
import FreemindIcon from '../export/freemind/Icon';
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

export default class FreemindImporter extends Importer {
  private mindmap!: Mindmap;

  private freemindInput: string;

  private freemindMap!: FreemindMap;

  private nodesmap!: Map<string, NodeModel>;

  private idDefault = 0;

  constructor(map: string) {
    super();
    this.freemindInput = map;
  }

  import(nameMap: string, description: string): Promise<string> {
    this.mindmap = new Mindmap(nameMap);
    this.nodesmap = new Map<string, NodeModel>();

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
    this.addRelationship(this.mindmap);

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

    return Promise.resolve(formatXml);
  }

  private addRelationship(mindmap: Mindmap): void {
    const mapRelaitonship: Array<RelationshipModel> = mindmap.getRelationships();

    mapRelaitonship.forEach((relationship: RelationshipModel) => {
      this.fixRelationshipControlPoints(relationship);

      // // Fix dest ID
      // const destId: string = relationship.getDestCtrlPoint();
      // const destTopic: NodeModel | undefined = this.nodesmap.get(destId);
      // if (destTopic) {
      //   relationship.setDestCtrlPoint(destTopic.getId());
      // }

      // // Fix src ID
      // const srcId: string = relationship.getSrcCtrlPoint();
      // const srcTopic: NodeModel | undefined = this.nodesmap.get(srcId);
      // if (srcTopic) {
      //   relationship.setSrcCtrlPoint(srcTopic.getId());
      // }

      mapRelaitonship.push(relationship);
    });
  }

  private fixRelationshipControlPoints(relationship: RelationshipModel): void {
    const srcTopic: NodeModel | undefined = this.nodesmap.get(relationship.getToNode().toString());
    const destNode: NodeModel | undefined = this.nodesmap.get(
      relationship.getFromNode().toString(),
    );
    if (srcTopic && destNode) {
      // Fix x coord
      const srcCtrlPoint = relationship.getSrcCtrlPoint();
      if (srcCtrlPoint) {
        const coords = srcTopic.getPosition();
        if (coords.x < 0) {
          const x = coords.x * -1;
          relationship.setSrcCtrlPoint({ x, y: coords.y });

          // Fix coord
          const order = srcTopic.getOrder();
          if (order !== undefined && order % 2 !== 0) {
            const y = coords.y * -1;
            relationship.setSrcCtrlPoint({ x: coords.x, y });
          }
        }
      }

      const destCtrlPoint = relationship.getDestCtrlPoint();
      if (destCtrlPoint) {
        const coords = destNode.getPosition();

        if (coords.x < 0) {
          const x = coords.x * -1;
          relationship.setDestCtrlPoint({ x, y: coords.y });
        }

        const order = destNode.getOrder();
        if (order !== undefined && order % 2 !== 0) {
          const y = coords.y * -1;
          relationship.setDestCtrlPoint({ x: coords.x, y });
        }
      }
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

    if (centralTopic === false) {
      const shape = this.getShapeFromFreeNode(freeNode);
      if (shape) {
        wiseTopic.setShapeType(shape);
      }
    }

    // Check for style...
    // const fontStyle = this.generateFontStyle(freeNode, undefined);
    // if (fontStyle && fontStyle !== ';;;;') {
    //   wiseTopic.setFontStyle(fontStyle);
    // }

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
    let currentWiseTopic: NodeModel = wiseParent;
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

        this.convertChildNodes(child, wiseChild, mindmap, depth++);

        if (wiseChild !== wiseParent) {
          wiseParent.append(wiseChild);
        }

        currentWiseTopic = wiseChild;
      }

      // if (child instanceof FreemindFont) {
      //   const font: FreemindFont = child as FreemindFont;
      //   const fontStyle: string = this.generateFontStyle(freeParent, font);
      //   if (fontStyle) {
      //     currentWiseTopic.setFontStyle(fontStyle);
      //   }
      // }

      if (child instanceof FreemindEdge) {
        const edge: FreemindEdge = child as FreemindEdge;
        currentWiseTopic.setBackgroundColor(edge.getColor());
      }

      if (child instanceof FreemindIcon) {
        const freeIcon: FreemindIcon = child as FreemindIcon;
        const iconId = freeIcon.getBuiltin();
        if (iconId) {
          const wiseIconId = FreemindIconConverter.toWiseId(iconId);
          if (wiseIconId) {
            const mindmapIcon: FeatureModel = FeatureModelFactory.createModel('icon', {
              id: wiseIconId,
            });
            currentWiseTopic.addFeature(mindmapIcon);
          }
        }
      }

      if (child instanceof FreemindHook) {
        const hook: FreemindHook = child as FreemindHook;
        const mindmapNote: NoteModel = new NoteModel({ text: '' });

        let textNote = hook.getText();
        if (!textNote) {
          textNote = FreemindConstant.EMPTY_NOTE;
          mindmapNote.setText(textNote);
          currentWiseTopic.addFeature(mindmapNote);
        }
      }

      if (child instanceof FreemindRichcontent) {
        const type = child.getType();
        const html = child.getHtml();
        if (html) {
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
              currentWiseTopic.addFeature(noteModel);
              break;
            }

            case 'NODE': {
              currentWiseTopic.setText(cleanHtml);
              // Topic text is always plain, no contentType needed
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
              currentWiseTopic.addFeature(noteModel);
            }
          }
        }
      }

      if (child instanceof FreemindArrowlink) {
        const arrow: FreemindArrowlink = child as FreemindArrowlink;
        const destId = arrow.getDestination();

        if (destId) {
          // Find the source and destination nodes
          const sourceNode = this.nodesmap.get(freeParent.getId()!);
          const destNode = this.nodesmap.get(destId);

          if (sourceNode && destNode) {
            // Create a new relationship with the correct node IDs
            const newRelationship = new RelationshipModel(sourceNode.getId(), destNode.getId());

            // Set control points if available
            const endinclination = arrow.getEndInclination();
            if (endinclination) {
              const inclination: Array<string> = endinclination.split(';');
              if (inclination.length >= 2) {
                newRelationship.setDestCtrlPoint({
                  x: parseFloat(inclination[0]),
                  y: parseFloat(inclination[1]),
                });
              }
            }

            const startinclination = arrow.getStartinclination();
            if (startinclination) {
              const inclination: Array<string> = startinclination.split(';');
              if (inclination.length >= 2) {
                newRelationship.setSrcCtrlPoint({
                  x: parseFloat(inclination[0]),
                  y: parseFloat(inclination[1]),
                });
              }
            }

            const endarrow = arrow.getEndarrow();
            if (endarrow) {
              newRelationship.setEndArrow(endarrow.toLowerCase() !== 'none');
            }

            const startarrow = arrow.getStartarrow();
            if (startarrow) {
              newRelationship.setStartArrow(startarrow.toLowerCase() !== 'none');
            }

            newRelationship.setLineType(3);
            mindmap.addRelationship(newRelationship);
          }
        }
      }
    });
  }

  private getIdNode(node: FreemindNode): number {
    const id = node.getId();
    let idFreeToIdWise: number;

    if (id !== undefined && id !== undefined) {
      if (id === '_') {
        this.idDefault++;
        idFreeToIdWise = this.idDefault;
      } else {
        idFreeToIdWise = parseInt(id.split('_').pop()!, 10);
      }
    } else {
      this.idDefault++;
      idFreeToIdWise = this.idDefault;
    }

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

  // private generateFontStyle(node: FreemindNode, font: FreemindFont | undefined): string {
  //   const fontStyle: Array<string> = [];

  //   // Font family
  //   if (font) {
  //     const name = font.getName();
  //     if (name) {
  //       fontStyle.push(name);
  //     }
  //   }
  //   fontStyle.push(';');

  //   // Font Size
  //   if (font) {
  //     const size = font.getSize();
  //     const fontSize: number =
  //       !size || parseInt(size, 10) < 8 ? FreemindConstant.FONT_SIZE_NORMAL : parseInt(size, 10);
  //     let wiseFontSize: number = FreemindConstant.FONT_SIZE_SMALL;
  //     if (fontSize >= 24) {
  //       wiseFontSize = FreemindConstant.FONT_SIZE_HUGE;
  //     }
  //     if (fontSize >= 16) {
  //       wiseFontSize = FreemindConstant.FONT_SIZE_LARGE;
  //     }
  //     if (fontSize >= 8) {
  //       wiseFontSize = FreemindConstant.FONT_SIZE_NORMAL;
  //     }
  //     fontStyle.push(wiseFontSize.toString());
  //   }
  //   fontStyle.push(';');

  //   // Font Color
  //   const color = node.getColor();
  //   if (color && color !== '') {
  //     fontStyle.push(color);
  //   }
  //   fontStyle.push(';');

  //   // Font Italic
  //   if (font) {
  //     const hasItalic = Boolean(font.getItalic());
  //     fontStyle.push(hasItalic ? FreemindConstant.ITALIC : '');
  //   }
  //   fontStyle.push(';');

  //   const result: string = fontStyle.join('');
  //   return result;
  // }

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
      const position = wiseParent.getPosition();
      x *= position.x < 0 ? 1 : -1;
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
      const position = wiseParent.getPosition();
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

  private cleanHtml(content: string): string {
    // Use secure HTML sanitizer to prevent XSS and other injection attacks
    return HtmlSanitizer.sanitize(content);
  }
}
