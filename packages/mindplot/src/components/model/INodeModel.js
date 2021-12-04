/* eslint-disable class-methods-use-this */
/*
 *    Copyright [2015] [wisemapping]
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
import { $assert, $defined } from '@wisemapping/core-js';
import _ from '../../../../../libraries/underscore-min';

class INodeModel {
  constructor(mindmap) {
    $assert(mindmap && mindmap.getBranches, 'mindmap can not be null');
    this._mindmap = mindmap;
  }

  /** */
  getId() {
    return this.getProperty('id');
  }

  /** */
  setId(id) {
    if ($defined(id) && id > INodeModel._uuid) {
      INodeModel._uuid = id;
    }
    if (!$defined(id)) {
      id = INodeModel._nextUUID();
    }

    this.putProperty('id', id);
  }

  /** */
  getType() {
    return this.getProperty('type');
  }

  /** */
  setType(type) {
    this.putProperty('type', type);
  }

  /** */
  setText(text) {
    this.putProperty('text', text);
  }

  /** */
  getText() {
    return this.getProperty('text');
  }

  /** */
  setPosition(x, y) {
    $assert(!Number.isNaN(parseInt(x, 10)), `x position is not valid:${x}`);
    $assert(!Number.isNaN(parseInt(y, 10)), `y position is not valid:${y}`);
    this.putProperty('position', `{x:${parseInt(x, 10)},y:${parseInt(y, 10)}}`);
  }

  /** */
  getPosition() {
    const value = this.getProperty('position');
    let result = null;
    if (value != null) {
      result = eval(`(${value})`);
    }
    return result;
  }

  /** */
  setImageSize(width, height) {
    this.putProperty('imageSize', `{width:${width},height:${height}}`);
  }

  /** */
  getImageSize() {
    const value = this.getProperty('imageSize');
    let result = null;
    if (value != null) {
      result = eval(`(${value})`);
    }
    return result;
  }

  /** */
  setImageUrl(url) {
    this.putProperty('imageUrl', url);
  }

  /** */
  getMetadata() {
    return this.getProperty('metadata');
  }

  /** */
  setMetadata(json) {
    this.putProperty('metadata', json);
  }

  /** */
  getImageUrl() {
    return this.getProperty('imageUrl');
  }

  /** */
  getMindmap() {
    return this._mindmap;
  }

  /**
       * lets the mindmap handle the disconnect node operation
       * @see mindplot.model.IMindmap.disconnect
       */
  disconnect() {
    const mindmap = this.getMindmap();
    mindmap.disconnect(this);
  }

  /** */
  getShapeType() {
    return this.getProperty('shapeType');
  }

  /** */
  setShapeType(type) {
    this.putProperty('shapeType', type);
  }

  /** */
  setOrder(value) {
    $assert(
      (typeof value === 'number' && isFinite(value)) || value == null,
      'Order must be null or a number',
    );
    this.putProperty('order', value);
  }

  /** */
  getOrder() {
    return this.getProperty('order');
  }

  /** */
  setFontFamily(fontFamily) {
    this.putProperty('fontFamily', fontFamily);
  }

  /** */
  getFontFamily() {
    return this.getProperty('fontFamily');
  }

  /** */
  setFontStyle(fontStyle) {
    this.putProperty('fontStyle', fontStyle);
  }

  /** */
  getFontStyle() {
    return this.getProperty('fontStyle');
  }

  /** */
  setFontWeight(weight) {
    this.putProperty('fontWeight', weight);
  }

  /** */
  getFontWeight() {
    return this.getProperty('fontWeight');
  }

  /** */
  setFontColor(color) {
    this.putProperty('fontColor', color);
  }

  /** */
  getFontColor() {
    return this.getProperty('fontColor');
  }

  /** */
  setFontSize(size) {
    this.putProperty('fontSize', size);
  }

  /** */
  getFontSize() {
    return this.getProperty('fontSize');
  }

  /** */
  getBorderColor() {
    return this.getProperty('borderColor');
  }

  /** */
  setBorderColor(color) {
    this.putProperty('borderColor', color);
  }

  /** */
  getBackgroundColor() {
    return this.getProperty('backgroundColor');
  }

  /** */
  setBackgroundColor(color) {
    this.putProperty('backgroundColor', color);
  }

  /** */
  areChildrenShrunken() {
    const result = this.getProperty('shrunken');
    return $defined(result) ? result : false;
  }

  /**
       * @return {Boolean} true if the children nodes are hidden by the shrink option
       */
  setChildrenShrunken(value) {
    this.putProperty('shrunken', value);
  }

  /**
       * @return {Boolean} true
       */
  isNodeModel() {
    return true;
  }

  /**
       * @return {Boolean} true if the node model has a parent assigned to it
       */
  isConnected() {
    return this.getParent() != null;
  }

  /** @abstract */
  append(node) {
    throw new Error('Unsupported operation');
  }

  /**
       * lets the mindmap handle the connect node operation
       * @throws will throw an error if parent is null or undefined
       * @see mindplot.model.IMindmap.connect
       */
  connectTo(parent) {
    $assert(parent, 'parent can not be null');
    const mindmap = this.getMindmap();
    mindmap.connect(parent, this);
  }

  /**
       * @param target
       * @return target
       */
  copyTo(target) {
    const source = this;
    // Copy properties ...
    const keys = source.getPropertiesKeys();
    _.each(keys, (key) => {
      const value = source.getProperty(key);
      target.putProperty(key, value);
    });

    // Copy children ...
    const children = this.getChildren();
    const tmindmap = target.getMindmap();

    _.each((children, snode) => {
      const tnode = tmindmap.createNode(snode.getType(), snode.getId());
      snode.copyTo(tnode);
      target.append(tnode);
    });

    return target;
  }

  /**
       * lets parent handle the delete node operation, or, if none defined, calls the mindmap to
       * remove the respective branch
       */
  deleteNode() {
    const mindmap = this.getMindmap();

    //        console.log("Before:" + mindmap.inspect());
    const parent = this.getParent();
    if ($defined(parent)) {
      parent.removeChild(this);
    } else {
      // If it has not parent, it must be an isolate topic ...
      mindmap.removeBranch(this);
    }
    // It's an isolated node. It must be a hole branch ...
    //        console.log("After:" + mindmap.inspect());
  }

  /** @abstract */
  getPropertiesKeys() {
    throw new Error('Unsupported operation');
  }

  /** @abstract */
  putProperty(key, value) {
    throw new Error('Unsupported operation');
  }

  /** @abstract */
  setParent(parent) {
    throw new Error('Unsupported operation');
  }

  /** @abstract */
  getChildren() {
    throw new Error('Unsupported operation');
  }

  /** @abstract */
  getParent() {
    throw new Error('Unsupported operation');
  }

  /** @abstract */
  clone() {
    throw new Error('Unsupported operation');
  }

  /** */
  inspect() {
    let result = `{ type: ${this.getType()} , id: ${this.getId()} , text: ${this.getText()}`;

    const children = this.getChildren();
    if (children.length > 0) {
      result = `${result}, children: {(size:${children.length}`;
      _.each(children, (node) => {
        result = `${result}=> (`;
        const keys = node.getPropertiesKeys();
        _.each(keys, (key) => {
          const value = node.getProperty(key);
          result = `${result + key}:${value},`;
        });
        result = `${result}}`;
      });
    }

    result = `${result} }`;
    return result;
  }

  /** @abstract */
  removeChild(child) {
    throw new Error('Unsupported operation');
  }
}

/**
 * @enum {String}
 */
const TopicShape = {
  RECTANGLE: 'rectagle',
  ROUNDED_RECT: 'rounded rectagle',
  ELLIPSE: 'elipse',
  LINE: 'line',
  IMAGE: 'image',
};

/**
 * @constant
 * @type {String}
 * @default
 */
INodeModel.CENTRAL_TOPIC_TYPE = 'CentralTopic';
/**
 * @constant
 * @type {String}
 * @default
 */
INodeModel.MAIN_TOPIC_TYPE = 'MainTopic';

/**
 * @constant
 * @type {Number}
 * @default
 */
INodeModel.MAIN_TOPIC_TO_MAIN_TOPIC_DISTANCE = 220;

/**
 * @todo: This method must be implemented. (unascribed)
 */
INodeModel._nextUUID = () => {
  if (!$defined(INodeModel._uuid)) {
    INodeModel._uuid = 0;
  }

  INodeModel._uuid += 1;
  return INodeModel._uuid;
};
INodeModel._uuid = 0;

export { TopicShape };
export default INodeModel;
