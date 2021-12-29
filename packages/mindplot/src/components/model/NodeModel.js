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
import cloneDeep from 'lodash/cloneDeep';
import INodeModel from './INodeModel';
import FeatureModelFactory from './FeatureModelFactory';

class NodeModel extends INodeModel {
  constructor(type, mindmap, id) {
    $assert(type, 'Node type can not be null');
    $assert(mindmap, 'mindmap can not be null');
    super(mindmap);
    this._properties = {};
    this.setId(id);
    this.setType(type);
    this.areChildrenShrunken(false);

    this._children = [];
    this._feature = [];
  }

  /**
     * @param type
     * @param attributes
     * @return {mindplot.model.FeatureModel} the created feature model
     */
  createFeature(type, attributes) {
    return FeatureModelFactory.createModel(type, attributes);
  }

  /**
     * @param feature
     * @throws will throw an error if feature is null or undefined
     */
  addFeature(feature) {
    $assert(feature, 'feature can not be null');
    this._feature.push(feature);
  }

  /** */
  getFeatures() {
    return this._feature;
  }

  /**
     * @param feature
     * @throws will throw an error if feature is null or undefined
     * @throws will throw an error if the feature could not be removed
     */
  removeFeature(feature) {
    $assert(feature, 'feature can not be null');
    const size = this._feature.length;
    this._feature = this._feature.filter((f) => feature.getId() !== f.getId());
    $assert(size - 1 === this._feature.length, 'Could not be removed ...');
  }

  /**
     * @param {String} type the feature type, e.g. icon or link
     * @throws will throw an error if type is null or undefined
     */
  findFeatureByType(type) {
    $assert(type, 'type can not be null');
    return this._feature.filter((feature) => feature.getType() === type);
  }

  /**
     * @param {String} id
     * @throws will throw an error if id is null or undefined
     * @throws will throw an error if feature could not be found
     * @return the feature with the given id
     */
  findFeatureById(id) {
    $assert($defined(id), 'id can not be null');
    const result = this._feature.filter((feature) => feature.getId() === id);
    $assert(result.length === 1, `Feature could not be found:${id}`);
    return result[0];
  }

  /** */
  getPropertiesKeys() {
    return Object.keys(this._properties);
  }

  /**
     * @param key
     * @param value
     * @throws will throw an error if key is null or undefined
     */
  putProperty(key, value) {
    $defined(key, 'key can not be null');
    this._properties[key] = value;
  }

  /** */
  getProperties() {
    return this._properties;
  }

  /** */
  getProperty(key) {
    $defined(key, 'key can not be null');
    const result = this._properties[key];
    return !$defined(result) ? null : result;
  }

  /**
     * @return {mindplot.model.NodeModel} an identical clone of the NodeModel
     */
  clone() {
    const result = new NodeModel(this.getType(), this._mindmap);
    result._children = this._children.map((node) => {
      const cnode = node.clone();
      cnode._parent = result;
      return cnode;
    });

    result._properties = cloneDeep(this._properties);
    result._feature = cloneDeep(this._feature);
    return result;
  }

  /**
     * Similar to clone, assign new id to the elements ...
     * @return {mindplot.model.NodeModel}
     */
  deepCopy() {
    const result = new NodeModel(this.getType(), this._mindmap);
    result._children = this._children.map((node) => {
      const cnode = node.deepCopy();
      cnode._parent = result;
      return cnode;
    });

    const id = result.getId();
    result._properties = Object.clone(this._properties);
    result.setId(id);

    result._feature = this._feature.clone();
    return result;
  }

  /**
     * @param {mindplot.model.NodeModel} child
     * @throws will throw an error if child is null, undefined or not a NodeModel object
     */
  append(child) {
    $assert(child && child.isNodeModel(), 'Only NodeModel can be appended to Mindmap object');
    this._children.push(child);
    // eslint-disable-next-line no-param-reassign
    child._parent = this;
  }

  /**
     * @param {mindplot.model.NodeModel} child
     * @throws will throw an error if child is null, undefined or not a NodeModel object
     */
  removeChild(child) {
    $assert(child && child.isNodeModel(), 'Only NodeModel can be appended to Mindmap object.');
    this._children = this._children.filter((c) => c !== child);
    // eslint-disable-next-line no-param-reassign
    child._parent = null;
  }

  /** */
  getChildren() {
    return this._children;
  }

  /** */
  getParent() {
    return this._parent;
  }

  /** */
  setParent(parent) {
    $assert(parent !== this, 'The same node can not be parent and child if itself.');
    this._parent = parent;
  }

  _isChildNode(node) {
    let result = false;
    if (node === this) {
      result = true;
    } else {
      const children = this.getChildren();
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        result = child._isChildNode(node);
        if (result) {
          break;
        }
      }
    }
    return result;
  }

  /**
     * @id
     * @return {mindplot.model.NodeModel} the node with the respective id
     */
  findNodeById(id) {
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
}

export default NodeModel;
