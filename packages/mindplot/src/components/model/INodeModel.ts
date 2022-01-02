/* eslint-disable class-methods-use-this */
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
import { $assert, $defined } from '@wisemapping/core-js';
import FeatureModel from './FeatureModel';
import Mindmap from './Mindmap';

// regex taken from https://stackoverflow.com/a/34763398/58128
const parseJsObject = (str: string) => JSON.parse(str.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": '));

abstract class INodeModel {
  static MAIN_TOPIC_TO_MAIN_TOPIC_DISTANCE: number = 220;
  static _next_uuid: number = 0;

  _mindmap: Mindmap;

  constructor(mindmap: Mindmap) {
    $assert(mindmap && mindmap.getBranches, 'mindmap can not be null');
    this._mindmap = mindmap;
  }

  getId(): number {
    return this.getProperty('id');
  }
  abstract getFeatures(): Array<FeatureModel>;

  /** */
  setId(id: number): void {
    if (!$defined(id)) {
      const newId = INodeModel._nextUUID();
      this.putProperty('id', newId);
    } else {
      if (id > INodeModel._next_uuid) {
        $assert(Number.isFinite(id));
        INodeModel._next_uuid = id;
      }
      this.putProperty('id', id);
    }
  }

  getType(): NodeModelType {
    return this.getProperty('type');
  }

  /** */
  setType(type: NodeModelType): void {
    this.putProperty('type', type);
  }

  /** */
  setText(text: string): void {
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
      result = parseJsObject(value);
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
      result = parseJsObject(value);
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
      (typeof value === 'number' && Number.isFinite(value)) || value == null,
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
  // eslint-disable-next-line no-unused-vars
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
    keys.forEach((key) => {
      const value = source.getProperty(key);
      target.putProperty(key, value);
    });

    // Copy children ...
    const children = this.getChildren();
    const tmindmap = target.getMindmap();

    children.forEach((snode) => {
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

  abstract getPropertiesKeys(): string[];

  abstract getProperty(key: string);

  abstract putProperty(key: string, value: any): void;

  abstract setParent(parent: INodeModel): void;

  abstract getChildren(): INodeModel[];

  abstract getParent(): INodeModel;

  abstract clone(): INodeModel;

  isChildNode(node: INodeModel): boolean {
    let result = false;
    if (node === this) {
      result = true;
    } else {
      const children = this.getChildren();
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        result = child.isChildNode(node);
        if (result) {
          break;
        }
      }
    }
    return result;
  }

  findNodeById(id: number): INodeModel {
    $assert(Number.isFinite(id));
    let result = null;
    if (this.getId() === id) {
      result = this;
    } else {
      const children = this.getChildren();
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        result = child.findNodeById(id);
        if (result) {
          break;
        }
      }
    }
    return result;
  }

  inspect() {
    let result = `{ type: ${this.getType()} , id: ${this.getId()} , text: ${this.getText()}`;

    const children = this.getChildren();
    if (children.length > 0) {
      result = `${result}, children: {(size:${children.length}`;
      children.forEach((node) => {
        result = `${result}=> (`;
        const keys = node.getPropertiesKeys();
        keys.forEach((key) => {
          const value = node.getProperty(key);
          result = `${result + key}:${value},`;
        });
        result = `${result}}`;
      });
    }

    result = `${result} }`;
    return result;
  }

  abstract removeChild(child: INodeModel);

  static _nextUUID(): number {
    INodeModel._next_uuid += 1;
    return INodeModel._next_uuid;
  };
}

const TopicShape = {
  RECTANGLE: 'rectagle',
  ROUNDED_RECT: 'rounded rectagle',
  ELLIPSE: 'elipse',
  LINE: 'line',
  IMAGE: 'image',
};

export type NodeModelType = 'CentralTopic' | 'MainTopic';

/**
 * @todo: This method must be implemented. (unascribed)
 */
export { TopicShape };
export default INodeModel;
