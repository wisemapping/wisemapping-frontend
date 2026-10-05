/*    Copyright [2007-2025] [wisemapping]
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
import { $assert } from '../util/assert';
import ModelCodeName from './ModelCodeName';
import Mindmap from '../model/Mindmap';
import FeatureModelFactory from '../model/FeatureModelFactory';
import NodeModel from '../model/NodeModel';
import XMLMindmapSerializer from './XMLMindmapSerializer';
import emojiToIconMap from './iconToEmoji.json';
import { isFontStyleType, isFontWeightType, isTopicShapeType } from './TopicAttributeTypes';

class XMLSerializerBeta implements XMLMindmapSerializer {
  private static MAP_ROOT_NODE = 'map';

  /**
   * Beta is a read-only format: loaded maps are migrated to Tango (see XMLSerializerFactory), whose
   * serializer writes them.
   */
  toXML(): Document {
    throw new Error('Saving maps in the beta format is not supported');
  }

  loadFromDom(dom: Document, mapId: string): Mindmap {
    $assert(dom, 'Dom can not be null');
    $assert(mapId, 'mapId can not be null');

    // Is a valid object ? The messages are only built on failure: they are expensive.
    const { documentElement } = dom;
    if (documentElement.nodeName === 'parsererror') {
      $assert(false, `Error while parsing: '${documentElement.textContent}`);
    }

    // Is a wisemap?.
    if (documentElement.tagName !== XMLSerializerBeta.MAP_ROOT_NODE) {
      $assert(
        false,
        `This seem not to be a map document. Root Tag: '${documentElement.tagName}', XML:${new XMLSerializer().serializeToString(dom)}`,
      );
    }

    // Start the loading process ...
    let version = documentElement.getAttribute('version');
    version = version ?? ModelCodeName.BETA;
    const mindmap = new Mindmap(mapId, version);

    // Default to classic theme for beta version maps
    mindmap.setTheme('classic');

    // Beta version always uses mindmap layout
    mindmap.setLayout('mindmap');

    const children = documentElement.childNodes;
    for (let i = 0; i < children.length; i++) {
      // Only element nodes (nodeType 1) are read.
      const child = children[i] as Element;
      if (child.nodeType === 1) {
        const topic = this._deserializeNode(child, mindmap);
        mindmap.addBranch(topic);
      }
    }
    mindmap.setId(mapId);
    return mindmap;
  }

  _deserializeNode(domElem: Element, mindmap: Mindmap): NodeModel {
    const type = domElem.getAttribute('central') != null ? 'CentralTopic' : 'MainTopic';
    const topic = mindmap.createNode(type);

    // Load attributes...
    const text = domElem.getAttribute('text');
    if (text != null) {
      topic.setText(text);
    }

    // Topic text is always plain, no contentType needed

    const order = domElem.getAttribute('order');
    if (order != null) {
      const parsedOrder = parseInt(order, 10);
      if (Number.isFinite(parsedOrder)) {
        topic.setOrder(parsedOrder);
      } else {
        console.warn(`Invalid order value in XML: "${order}" for topic ${topic.getId()}`);
      }
    }

    let shape = domElem.getAttribute('shape');
    if (shape != null) {
      // Hack for legacy mapping loading ...
      shape = shape === 'rectagle' ? 'rectangle' : shape;
      if (isTopicShapeType(shape)) {
        topic.setShapeType(shape);
      } else {
        console.warn(`Unknown shape '${shape}' for topic ${topic.getId()}, ignoring it.`);
      }
    }

    const isShrink = domElem.getAttribute('shrink');
    if (isShrink != null) {
      topic.setChildrenShrunken(isShrink === 'true');
    }

    const fontStyle = domElem.getAttribute('fontStyle');
    if (fontStyle != null) {
      const font = fontStyle.split(';');

      if (font[0]) {
        topic.setFontFamily(font[0]);
      }

      const fontSize = Number.parseInt(font[1], 10);
      if (Number.isFinite(fontSize)) {
        topic.setFontSize(fontSize);
      }

      if (font[2]) {
        topic.setFontColor(font[2]);
      }

      // Unknown values are ignored, so the theme default applies.
      const fontWeight = font[3];
      if (fontWeight) {
        if (isFontWeightType(fontWeight)) {
          topic.setFontWeight(fontWeight);
        } else {
          console.warn(
            `Unknown font weight '${fontWeight}' for topic ${topic.getId()}, ignoring it.`,
          );
        }
      }

      const fontStyleValue = font[4];
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

    const bgColor = domElem.getAttribute('bgColor');
    if (bgColor != null) {
      topic.setBackgroundColor(bgColor);
    }

    const borderColor = domElem.getAttribute('brColor');
    if (borderColor != null) {
      topic.setBorderColor(borderColor);
    }

    const position = domElem.getAttribute('position');
    if (position != null) {
      const pos = position.split(',');
      const x = Number.parseInt(pos[0], 10);
      const y = Number.parseInt(pos[1], 10);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        topic.setPosition(x, y);
      }
    }

    // Creating icons and children nodes
    const children = domElem.childNodes;
    for (let i = 0; i < children.length; i++) {
      // Only element nodes (nodeType 1) are read.
      const child = children[i] as Element;
      if (child.nodeType === 1) {
        $assert(
          child.tagName === 'topic' ||
            child.tagName === 'icon' ||
            child.tagName === 'link' ||
            child.tagName === 'note',
          `Illegal node type:${child.tagName}`,
        );
        if (child.tagName === 'topic') {
          const childTopic = this._deserializeNode(child, mindmap);
          childTopic.connectTo(topic);
        } else if (child.tagName === 'icon') {
          const icon = this._deserializeIcon(child);
          if (icon) {
            topic.addFeature(icon);
          }
        } else if (child.tagName === 'link') {
          const link = this._deserializeLink(child);
          if (link) {
            topic.addFeature(link);
          }
        } else if (child.tagName === 'note') {
          const note = this._deserializeNote(child);
          topic.addFeature(note);
        }
      }
    }

    return topic;
  }

  _deserializeIcon(domElem: Element) {
    const id = domElem.getAttribute('id');
    if (!id) {
      return undefined;
    }
    // Same migration as the Tango loader: legacy icons become emojis when there is one.
    const emoji = (emojiToIconMap as Record<string, string>)[id];
    return emoji
      ? FeatureModelFactory.createModel('eicon', { id: emoji })
      : FeatureModelFactory.createModel('icon', { id });
  }

  _deserializeLink(domElem: Element) {
    // A link without url can not be shown: skip it rather than failing to load the map.
    const url = domElem.getAttribute('url');
    return url ? FeatureModelFactory.createModel('link', { url }) : undefined;
  }

  _deserializeNote(domElem: Element) {
    // Beta notes are escape()-encoded, as the legacy pela ones read by the Tango serializer.
    const text = domElem.getAttribute('text');
    return FeatureModelFactory.createModel('note', { text: text ? unescape(text) : ' ' });
  }
}

export default XMLSerializerBeta;
