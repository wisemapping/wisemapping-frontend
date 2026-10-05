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
import { Point } from '@wisemapping/web2d';
import { $assert, $defined } from '../util/assert';
import { createDocument } from '../util/DOMUtils';
import Mindmap from '../model/Mindmap';
import FeatureModelFactory from '../model/FeatureModelFactory';
import NodeModel from '../model/NodeModel';
import RelationshipModel, { StrokeStyle } from '../model/RelationshipModel';
import XMLMindmapSerializer from './XMLMindmapSerializer';
import ModelCodeName from './ModelCodeName';
import FeatureModel from '../model/FeatureModel';
import { legacyIconEmoji } from '../import/support/LegacyIconMap';
import {
  isFontStyleType,
  isFontWeightType,
  isLineType,
  isTopicShapeType,
} from './TopicAttributeTypes';
import ThemeType from '../model/ThemeType';
import { CanvasStyleType, BackgroundPatternType } from '../model/CanvasStyleType';
import { LAYOUT_ORIENTATION, type LayoutType } from '../layout/LayoutType';

// Keyed by the union, so the compiler reports a theme or pattern added to the type but not here.
const THEME_TYPES: Record<ThemeType, true> = {
  classic: true,
  prism: true,
  robot: true,
  sunrise: true,
  ocean: true,
  aurora: true,
  retro: true,
};

const BACKGROUND_PATTERN_TYPES: Record<BackgroundPatternType, true> = {
  solid: true,
  grid: true,
  dots: true,
};

const isThemeType = (value: string): value is ThemeType =>
  Object.prototype.hasOwnProperty.call(THEME_TYPES, value);

const isLayoutType = (value: string): value is LayoutType =>
  Object.prototype.hasOwnProperty.call(LAYOUT_ORIENTATION, value);

const isBackgroundPatternType = (value: string): value is BackgroundPatternType =>
  Object.prototype.hasOwnProperty.call(BACKGROUND_PATTERN_TYPES, value);

class XMLSerializerTango implements XMLMindmapSerializer {
  private static MAP_ROOT_NODE = 'map';

  private _idsMap: Record<number, Element>;

  constructor() {
    this._idsMap = {};
  }

  toXML(mindmap: Mindmap): Document {
    $assert(mindmap, 'Can not save a null mindmap');

    const document = createDocument();

    // Store map attributes ...
    const mapElem = document.createElement('map');
    const name = mindmap.getId();
    if (name) {
      mapElem.setAttribute('name', this._rmXmlInv(name));
    }

    // Add theme ...
    const theme = mindmap.getTheme();
    if (theme && theme !== 'classic') {
      mapElem.setAttribute('theme', theme);
    }

    // Add layout - always persist
    const layout = mindmap.getLayout();
    mapElem.setAttribute('layout', layout);

    // Add canvas style attributes
    this._persistCanvasStyle(mapElem, mindmap);

    const version = mindmap.getVersion();
    if ($defined(version)) {
      mapElem.setAttribute('version', version);
    }

    document.appendChild(mapElem);

    // Create branches ...
    const topics = mindmap.getBranches();
    topics.forEach((topic) => {
      const topicDom = this._topicToXML(document, topic);
      mapElem.appendChild(topicDom);
    });

    // Create Relationships
    const relationships = mindmap.getRelationships();
    const nodeIds = relationships.length > 0 ? mindmap.getNodeIds() : new Set<number>();
    relationships.forEach((relationship) => {
      if (nodeIds.has(relationship.getFromNode()) && nodeIds.has(relationship.getToNode())) {
        // Isolated relationships are not persisted ....
        const relationDom = XMLSerializerTango._relationshipToXML(document, relationship);
        mapElem.appendChild(relationDom);
      }
    });

    return document;
  }

  /**
   * Persist canvas style attributes to map element
   * @private
   */
  private _persistCanvasStyle(mapElem: Element, mindmap: Mindmap): void {
    const canvasStyle = mindmap.getCanvasStyle();
    if (!canvasStyle) {
      return;
    }

    if (canvasStyle.backgroundColor != null) {
      mapElem.setAttribute('backgroundColor', canvasStyle.backgroundColor);
    }
    if (canvasStyle.backgroundPattern != null) {
      mapElem.setAttribute('backgroundPattern', canvasStyle.backgroundPattern);
    }
    if (canvasStyle.backgroundGridSize != null) {
      mapElem.setAttribute('backgroundGridSize', String(canvasStyle.backgroundGridSize));
    }
    if (canvasStyle.backgroundGridColor != null) {
      mapElem.setAttribute('backgroundGridColor', canvasStyle.backgroundGridColor);
    }
  }

  /**
   * Load canvas style attributes from map element
   * @private
   */
  private _loadCanvasStyle(rootElem: Element, mindmap: Mindmap): void {
    const backgroundColor = rootElem.getAttribute('backgroundColor');
    const backgroundPatternAttr = rootElem.getAttribute('backgroundPattern');
    const gridSizeAttr = rootElem.getAttribute('backgroundGridSize');
    const gridColorAttr = rootElem.getAttribute('backgroundGridColor');

    // Build canvas style only if at least one attribute is present
    const canvasStyle: CanvasStyleType = {};

    if (backgroundColor != null) {
      canvasStyle.backgroundColor = backgroundColor;
    }
    if (backgroundPatternAttr != null && backgroundPatternAttr !== 'none') {
      // Ignore legacy 'none' value for backward compatibility
      if (isBackgroundPatternType(backgroundPatternAttr)) {
        canvasStyle.backgroundPattern = backgroundPatternAttr;
      } else {
        console.warn(`Unknown background pattern '${backgroundPatternAttr}', ignoring it.`);
      }
    }
    if (gridSizeAttr != null) {
      const parsed = Number.parseInt(gridSizeAttr, 10);
      if (Number.isFinite(parsed)) {
        canvasStyle.backgroundGridSize = parsed;
      }
    }
    if (gridColorAttr != null) {
      canvasStyle.backgroundGridColor = gridColorAttr;
    }

    // Only set if we have at least one property
    if (Object.keys(canvasStyle).length > 0) {
      mindmap.setCanvasStyle(canvasStyle);
    }
  }

  protected _topicToXML(document: Document, topic: NodeModel) {
    const parentTopic = document.createElement('topic');

    // Set topic attributes...
    if (topic.getType() === 'CentralTopic') {
      parentTopic.setAttribute('central', 'true');
    } else {
      // getPosition() reports a missing or corrupted position as undefined: leave it out.
      const pos = topic.getPosition();
      if (pos) {
        parentTopic.setAttribute('position', `${Math.ceil(pos.x)},${Math.ceil(pos.y)}`);
      }

      const order = topic.getOrder();
      if (typeof order === 'number' && Number.isFinite(order)) {
        parentTopic.setAttribute('order', order.toString());
      }
    }

    const text = topic.getText();
    if (text) {
      this._noteTextToXML(document, parentTopic, text);
    }

    // Topic text is always plain, no contentType needed

    // Save the model's explicit shape (undefined means use theme default)
    const shape = topic.getShapeType();
    if (shape !== undefined) {
      parentTopic.setAttribute('shape', shape);
      const size = topic.getImageSize();
      if (shape === 'image' && size) {
        parentTopic.setAttribute('image', `${size.width},${size.height}:${topic.getImageUrl()}`);
      }
    }
    // Serialize image emoji as a separate attribute (feature)
    const imageEmojiChar = topic.getImageEmojiChar();
    if (imageEmojiChar) {
      parentTopic.setAttribute('imageEmoji', imageEmojiChar);
    }

    // Serialize image gallery icon as a separate attribute (feature)
    const imageGalleryIconName = topic.getImageGalleryIconName();
    if (imageGalleryIconName) {
      parentTopic.setAttribute('imageGallery', imageGalleryIconName.toLowerCase());
    }

    if (
      topic.areChildrenShrunken() &&
      topic.getChildren().length > 0 &&
      topic.getType() !== 'CentralTopic'
    ) {
      parentTopic.setAttribute('shrink', 'true');
    }

    // Font properties ...
    const id = topic.getId();
    parentTopic.setAttribute('id', id.toString());

    let font = '';

    const fontFamily = topic.getFontFamily();
    font += `${fontFamily || ''};`;

    const fontSize = topic.getFontSize();
    font += `${fontSize || ''};`;

    const fontColor = topic.getFontColor();
    font += `${fontColor || ''};`;

    const fontWeight = topic.getFontWeight();
    font += `${fontWeight || ''};`;

    const fontStyle = topic.getFontStyle();
    font += `${fontStyle || ''};`;

    if (
      $defined(fontFamily) ||
      $defined(fontSize) ||
      $defined(fontColor) ||
      $defined(fontWeight) ||
      $defined(fontStyle)
    ) {
      parentTopic.setAttribute('fontStyle', font);
    }

    const bgColor = topic.getBackgroundColor();
    if (bgColor) {
      parentTopic.setAttribute('bgColor', bgColor);
    }

    const brColor = topic.getBorderColor();
    if (brColor) {
      parentTopic.setAttribute('brColor', brColor);
    }

    // Save the model's explicit connection style (undefined means use theme default)
    const connectionStyle = topic.getConnectionStyle();
    if (connectionStyle !== undefined) {
      parentTopic.setAttribute('connStyle', `${connectionStyle}`);
    }

    const connectionColor = topic.getConnectionColor();
    if (connectionColor) {
      parentTopic.setAttribute('connColor', connectionColor);
    }

    const metadata = topic.getMetadata();
    if ($defined(metadata)) {
      parentTopic.setAttribute('metadata', metadata);
    }

    // Serialize features ...
    const features = topic.getFeatures();
    features.forEach((feature) => {
      const featureType = feature.getType();
      const featureDom = document.createElement(featureType);
      const attributes = feature.getAttributes();

      const attributesKeys = Object.keys(attributes);
      for (let attrIndex = 0; attrIndex < attributesKeys.length; attrIndex++) {
        const key = attributesKeys[attrIndex];
        const value = attributes[key];
        if (key === 'text') {
          XMLSerializerTango._appendCDATA(document, featureDom, this._rmXmlInv(value));
        } else {
          featureDom.setAttribute(key, value);
        }
      }
      parentTopic.appendChild(featureDom);
    });

    // CHILDREN TOPICS
    const childTopics = topic.getChildren();
    childTopics.forEach((childTopic) => {
      const childDom = this._topicToXML(document, childTopic);
      parentTopic.appendChild(childDom);
    });

    return parentTopic;
  }

  protected _noteTextToXML(document: Document, elem: Element, text: string) {
    if (text.indexOf('\n') === -1) {
      elem.setAttribute('text', this._rmXmlInv(text));
    } else {
      const textDom = document.createElement('text');
      XMLSerializerTango._appendCDATA(document, textDom, this._rmXmlInv(text));
      elem.appendChild(textDom);
    }
  }

  /**
   * A CDATA section can not contain "]]>", so the text is split after "]]" into
   * consecutive sections. Readers concatenate all the CDATA sections of the element.
   */
  private static _appendCDATA(document: Document, elem: Element, text: string): void {
    text.split(']]>').forEach((part, index, parts) => {
      const isLast = index === parts.length - 1;
      const prefix = index > 0 ? '>' : '';
      const suffix = isLast ? '' : ']]';
      elem.appendChild(document.createCDATASection(`${prefix}${part}${suffix}`));
    });
  }

  static _relationshipToXML(document: Document, relationship: RelationshipModel) {
    const result = document.createElement('relationship');
    result.setAttribute('srcTopicId', relationship.getFromNode().toString());
    result.setAttribute('destTopicId', relationship.getToNode().toString());

    // Relationships are always drawn thin curved, so lineType is not read back. It is still written,
    // with the value saved maps have always carried: 3, SIMPLE_CURVED in the numbering of the time
    // (today's LineType would read it as POLYLINE_STRAIGHT). Line types for relationships would
    // need a new attribute ...
    result.setAttribute('lineType', '3');
    const strCtrlPoint = relationship.getSrcCtrlPoint();
    if (strCtrlPoint) {
      result.setAttribute(
        'srcCtrlPoint',
        `${Math.round(strCtrlPoint.x)},${Math.round(strCtrlPoint.y)}`,
      );
    }
    const destCtrPoint = relationship.getDestCtrlPoint();
    if (destCtrPoint) {
      result.setAttribute(
        'destCtrlPoint',
        `${Math.round(destCtrPoint.x)},${Math.round(destCtrPoint.y)}`,
      );
    }
    result.setAttribute('endArrow', String(relationship.getEndArrow()));
    result.setAttribute('startArrow', String(relationship.getStartArrow()));

    // Add stroke color if custom
    const strokeColor = relationship.getStrokeColor();
    if (strokeColor) {
      result.setAttribute('strokeColor', strokeColor);
    }

    // Add stroke style
    result.setAttribute('strokeStyle', relationship.getStrokeStyle());

    return result;
  }

  loadFromDom(dom: Document, mapId: string) {
    $assert(dom, 'dom can not be null');
    $assert(mapId, 'mapId can not be null');

    const rootElem = dom.documentElement;

    // Is a wisemap?.
    $assert(
      rootElem.tagName === XMLSerializerTango.MAP_ROOT_NODE,
      `This seem not to be a map document. Found tag: ${rootElem.tagName}`,
    );

    // Start the loading process ...
    const version = rootElem.getAttribute('version') || 'pela';
    const mindmap = new Mindmap(mapId, version);

    const theme = rootElem.getAttribute('theme');
    // Map dark-prism to prism for backward compatibility
    const mappedTheme = theme === 'dark-prism' ? 'prism' : theme;
    if (mappedTheme && isThemeType(mappedTheme)) {
      mindmap.setTheme(mappedTheme);
    } else {
      // Default to classic theme if no theme is specified, or it is not a known one
      if (mappedTheme) {
        console.warn(`Unknown theme '${mappedTheme}', falling back to 'classic'.`);
      }
      mindmap.setTheme('classic');
    }

    // Load layout attribute, defaulting to mindmap
    const layoutAttr = rootElem.getAttribute('layout');
    if (layoutAttr && isLayoutType(layoutAttr)) {
      mindmap.setLayout(layoutAttr);
    } else {
      if (layoutAttr) {
        console.warn(`Unknown layout '${layoutAttr}', falling back to 'mindmap'.`);
      }
      mindmap.setLayout('mindmap');
    }

    // Load canvas style attributes
    this._loadCanvasStyle(rootElem, mindmap);

    // Add all the topics nodes ...
    const childNodes = Array.from(rootElem.childNodes);
    const topicsNodes = childNodes
      .filter((child: ChildNode) => child.nodeType === 1 && (child as Element).tagName === 'topic')
      .map((c) => c as Element);
    topicsNodes.forEach((child) => {
      const topic = this._deserializeNode(child, mindmap);
      mindmap.addBranch(topic);
    });

    // Then all relationshops, they are connected to topics ...
    const relationshipsNodes = childNodes
      .filter(
        (child: ChildNode) => child.nodeType === 1 && (child as Element).tagName === 'relationship',
      )
      .map((c) => c as Element);
    const nodeIds = relationshipsNodes.length > 0 ? mindmap.getNodeIds() : new Set<number>();
    relationshipsNodes.forEach((child) => {
      try {
        const relationship = XMLSerializerTango._deserializeRelationship(child, mindmap, nodeIds);
        mindmap.addRelationship(relationship);
      } catch (e) {
        console.error(e);
      }
    });

    // Older versions synthesize missing positions in their migrator. Tango requires one, so a
    // missing or corrupted position (e.g. "NaN,NaN") falls back to the parent position.
    if (version === ModelCodeName.TANGO) {
      mindmap.getBranches().forEach((branch) => XMLSerializerTango._fixMissingPositions(branch));
    }

    // Clean up from the recursion ...
    this._idsMap = {};
    mindmap.setId(mapId);
    return mindmap;
  }

  private static _fixMissingPositions(node: NodeModel, parentPosition = { x: 0, y: 0 }): void {
    let position = node.getPosition();
    if (!position) {
      position = parentPosition;
      node.setPosition(position.x, position.y);
    }
    node.getChildren().forEach((child) => XMLSerializerTango._fixMissingPositions(child, position));
  }

  protected _deserializeNode(domElem: Element, mindmap: Mindmap): NodeModel {
    const type = domElem.getAttribute('central') != null ? 'CentralTopic' : 'MainTopic';

    // Load attributes...
    let id: number | undefined;
    const idStr = domElem.getAttribute('id');
    if (idStr) {
      id = Number.parseInt(idStr, 10);
    }

    // Is a duplicated node ?. Force the generation of a new id ...
    if (id === undefined || this._idsMap[id] !== undefined) {
      id = undefined;
    }

    // Create element ...
    const topic = mindmap.createNode(type, id);
    this._idsMap[topic.getId()] = domElem;

    // Set text property is it;s defined...
    const text = domElem.getAttribute('text');
    if ($defined(text) && text) {
      topic.setText(text);
    }

    // Topic text is always plain, no contentType needed

    const fontStyle = domElem.getAttribute('fontStyle');
    if ($defined(fontStyle) && fontStyle) {
      // Optimized font parsing: split once and assign directly
      const fontParts = fontStyle.split(';');

      // Only set properties if they exist and are non-empty
      const fontFamily = fontParts[0];
      if (fontFamily) {
        topic.setFontFamily(fontFamily);
      }

      // A non numeric size is ignored, so the theme default applies.
      const fontSize = Number.parseInt(fontParts[1], 10);
      if (Number.isFinite(fontSize)) {
        topic.setFontSize(fontSize);
      }

      const fontColor = fontParts[2];
      if (fontColor) {
        topic.setFontColor(fontColor);
      }

      // Unknown values are ignored, so the theme default applies.
      const fontWeight = fontParts[3];
      if (fontWeight) {
        if (isFontWeightType(fontWeight)) {
          topic.setFontWeight(fontWeight);
        } else {
          console.warn(
            `Unknown font weight '${fontWeight}' for topic ${topic.getId()}, ignoring it.`,
          );
        }
      }

      const fontStyleValue = fontParts[4];
      if (fontStyleValue) {
        if (isFontStyleType(fontStyleValue)) {
          topic.setFontStyle(fontStyleValue);
        } else {
          console.warn(
            `Unknown font style '${fontStyleValue}' for topic ${topic.getId()}, ignoring it.`,
          );
        }
      }
    }

    let shape = domElem.getAttribute('shape');
    if (shape) {
      // Fix typo on serialization....
      shape = shape.replace('rectagle', 'rectangle');
      if (isTopicShapeType(shape)) {
        topic.setShapeType(shape);
      } else {
        console.warn(`Unknown shape '${shape}' for topic ${topic.getId()}, ignoring it.`);
      }

      // Is an image ?
      const image = domElem.getAttribute('image');
      if (image && shape === 'image') {
        const size = image.substring(0, image.indexOf(':'));
        const url = image.substring(image.indexOf(':') + 1, image.length);
        topic.setImageUrl(url);

        const split = size.split(',');
        const width = Number.parseInt(split[0], 10);
        const height = Number.parseInt(split[1], 10);
        if (Number.isFinite(width) && Number.isFinite(height)) {
          topic.setImageSize(width, height);
        }
      }
    }
    // Deserialize image emoji as a separate attribute (feature)
    const imageEmoji = domElem.getAttribute('imageEmoji');
    if (imageEmoji) {
      topic.setImageEmojiChar(imageEmoji);
    }

    // Deserialize image gallery icon as a separate attribute (feature)
    const imageGalleryIcon = domElem.getAttribute('imageGallery');
    if (imageGalleryIcon) {
      topic.setImageGalleryIconName(imageGalleryIcon.toLowerCase());
    }

    const bgColor = domElem.getAttribute('bgColor');
    if (bgColor) {
      topic.setBackgroundColor(bgColor);
    }

    const connStyle = domElem.getAttribute('connStyle');
    if ($defined(connStyle) && connStyle) {
      const lineType = Number.parseInt(connStyle, 10);
      if (isLineType(lineType)) {
        topic.setConnectionStyle(lineType);
      } else {
        console.warn(
          `Unknown connection style '${connStyle}' for topic ${topic.getId()}, ignoring it.`,
        );
      }
    }

    const connColor = domElem.getAttribute('connColor');
    if ($defined(connColor) && connColor) {
      topic.setConnectionColor(connColor);
    }

    const borderColor = domElem.getAttribute('brColor');
    if (borderColor) {
      topic.setBorderColor(borderColor);
    }

    const order = domElem.getAttribute('order');
    if (order !== null && order !== 'NaN') {
      // Validate parsed order is a finite number (defense against corrupted XML)
      const parsedOrder = parseInt(order, 10);
      if (Number.isFinite(parsedOrder)) {
        topic.setOrder(parsedOrder);
      } else {
        console.warn(`Invalid order value in XML: "${order}" for topic ${topic.getId()}, skipping`);
      }
    }

    const isShrink = domElem.getAttribute('shrink');
    // Hack: Some production maps has been stored with the central topic collapsed. This is a bug.
    if ($defined(isShrink) && type !== 'CentralTopic') {
      topic.setChildrenShrunken(isShrink === 'true');
    }

    const position = domElem.getAttribute('position');
    if (position !== null) {
      const pos = position.split(',');
      const x = Number.parseInt(pos[0], 10);
      const y = Number.parseInt(pos[1], 10);
      // A corrupted position (e.g. "NaN,NaN") is treated as missing.
      if (Number.isFinite(x) && Number.isFinite(y)) {
        topic.setPosition(x, y);
      }
    }

    const metadata = domElem.getAttribute('metadata');
    if (metadata !== null) {
      topic.setMetadata(metadata);
    }

    // Creating icons and children nodes
    const children = Array.from(domElem.childNodes);
    children.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const elem = child as Element;
        if (elem.tagName === 'topic') {
          const childTopic = this._deserializeNode(elem, mindmap);
          childTopic.connectTo(topic);
        } else if (FeatureModelFactory.isSupported(elem.tagName)) {
          // Load attributes ...
          const namedNodeMap = elem.attributes;
          const attributes: Record<string, string> = {};

          for (let j = 0; j < namedNodeMap.length; j++) {
            const attribute = namedNodeMap.item(j);
            if (attribute !== null) {
              attributes[attribute.name] = attribute.value;
            }
          }

          // Has text node ?.
          const textAttr = XMLSerializerTango._deserializeTextAttr(elem);
          if (textAttr) {
            attributes.text = textAttr;
          }

          // Create a new element ....
          const featureType = elem.tagName;
          let feature: FeatureModel = FeatureModelFactory.createModel(featureType, attributes);

          // Migrate icons to emoji ...
          if (featureType === 'icon') {
            const svgIcon: string = attributes.id;
            const emoji = XMLSerializerTango.emojiEquivalent(svgIcon);
            if (emoji) {
              attributes.id = emoji;
              feature = FeatureModelFactory.createModel('eicon', attributes);
            }
          }

          topic.addFeature(feature);
        } else if (elem.tagName === 'text') {
          const nodeText = XMLSerializerTango._deserializeNodeText(child);
          topic.setText(nodeText);
        }
      }
    });

    // Workaround: for some reason, some saved maps have holes in the order.
    if (topic.getType() !== 'CentralTopic') {
      topic
        .getChildren()
        .sort((a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0))
        .forEach((child, index) => {
          if (child.getOrder() !== index) {
            child.setOrder(index);
            console.log('Toppic with order sequence hole. Introducing auto recovery sequence fix.');
          }
        });
    }
    return topic;
  }

  static _deserializeTextAttr(domElem: Element): string {
    let value = domElem.getAttribute('text');
    if (!value) {
      value = XMLSerializerTango._readCDATA(domElem);
    } else {
      // Notes must be decoded ...
      value = unescape(value);
    }
    // Hack for empty nodes ...
    if (!value) {
      value = ' ';
    }

    return value;
  }

  private static emojiEquivalent(icon: string): string | undefined {
    return legacyIconEmoji(icon);
  }

  private static _deserializeNodeText(domElem: ChildNode): string {
    const value = XMLSerializerTango._readCDATA(domElem);
    return value !== null ? value : '';
  }

  /**
   * Concatenates the CDATA sections and the text of the element, null if it has none. The writer
   * always uses CDATA, but plain text content (e.g. a hand-edited or third-party map) is read too.
   * Whitespace-only text is skipped: it is the indentation of a pretty-printed document.
   */
  private static _readCDATA(domElem: ChildNode): string | null {
    const children = domElem.childNodes;
    let value: string | null = null;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const content = child.nodeValue ?? '';
      const isText = child.nodeType === Node.TEXT_NODE && content.trim() !== '';
      if (child.nodeType === Node.CDATA_SECTION_NODE || isText) {
        value = (value ?? '') + content;
      }
    }
    return value;
  }

  private static _deserializeRelationship(
    domElement: Element,
    mindmap: Mindmap,
    nodeIds: Set<number>,
  ): RelationshipModel {
    const srcId = Number.parseInt(domElement.getAttribute('srcTopicId')!, 10);
    const destId = Number.parseInt(domElement.getAttribute('destTopicId')!, 10);
    const srcCtrlPoint = domElement.getAttribute('srcCtrlPoint');
    const destCtrlPoint = domElement.getAttribute('destCtrlPoint');

    // If for some reason a relationship lines has source and dest nodes the same, don't import it.
    if (srcId === destId) {
      throw new Error('Invalid relationship, dest and source are equals');
    }

    // Is the connections points valid ?. If it's not, do not load the relationship ...
    if (!nodeIds.has(srcId) || !nodeIds.has(destId)) {
      throw new Error('Transition could not created, missing node for relationship');
    }

    // The stored lineType is legacy (see _relationshipToXML): the model keeps its thin curve ...
    const model = mindmap.createRelationship(srcId, destId);
    if (srcCtrlPoint) {
      try {
        const spoint = Point.fromString(srcCtrlPoint);
        model.setSrcCtrlPoint(spoint);
      } catch (e) {
        console.error(e);
      }
    }

    if (destCtrlPoint) {
      try {
        const dpoint = Point.fromString(destCtrlPoint);
        model.setDestCtrlPoint(dpoint);
      } catch (e) {
        console.error(e);
      }
    }

    // Load arrow settings from XML
    const endArrow = domElement.getAttribute('endArrow');
    if (endArrow !== null) {
      model.setEndArrow(endArrow === 'true');
    }

    const startArrow = domElement.getAttribute('startArrow');
    if (startArrow !== null) {
      model.setStartArrow(startArrow === 'true');
    }

    // Load stroke color if present
    const strokeColor = domElement.getAttribute('strokeColor');
    if (strokeColor) {
      model.setStrokeColor(strokeColor);
    }

    // Load stroke style if present
    const strokeStyle = domElement.getAttribute('strokeStyle');
    if (strokeStyle && Object.values(StrokeStyle).includes(strokeStyle as StrokeStyle)) {
      model.setStrokeStyle(strokeStyle as StrokeStyle);
    } else {
      // Default to dashed for backwards compatibility
      model.setStrokeStyle(StrokeStyle.DASHED);
    }

    return model;
  }

  /**
   * This method ensures that the output String has only
   * valid XML unicode characters as specified by the
   * XML 1.0 standard. For reference, please see
   * <a href="http://www.w3.org/TR/2000/REC-xml-20001006#NT-Char">the
   * standard</a>. This method will return an empty
   * String if the input is null or empty.
   *
   * @param in The String whose non-valid characters we want to remove.
   * @return The in String, stripped of non-valid characters.
   */
  protected _rmXmlInv(str: string): string {
    // Matched by code point (u flag), so surrogate pairs are kept and lone surrogates removed.
    return str.replace(/[^\t\n\r\u{20}-\u{D7FF}\u{E000}-\u{FFFD}\u{10000}-\u{10FFFF}]/gu, '');
  }
}

export default XMLSerializerTango;
