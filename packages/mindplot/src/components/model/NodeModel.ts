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
import INodeModel, { NodeModelType } from './INodeModel';
import FeatureModelFactory from './FeatureModelFactory';
import FeatureModel, { FeatureType } from './FeatureModel';
import Mindmap from './Mindmap';

class NodeModel extends INodeModel {
  private _properties: Record<string, string | number | boolean>;

  // eslint-disable-next-line no-use-before-define
  private _children: NodeModel[];

  private _features: FeatureModel[];

  // eslint-disable-next-line no-use-before-define
  private _parent: NodeModel;

  constructor(type: NodeModelType, mindmap: Mindmap, id: number) {
    $assert(type, 'Node type can not be null');
    $assert(mindmap, 'mindmap can not be null');
    super(mindmap);

    this._properties = {};
    this.setId(id);
    this.setType(type);
    this.areChildrenShrunken();

    this._children = [];
    this._features = [];
  }

  /**
     * @param type
     * @param attributes
     * @return {mindplot.model.FeatureModel} the created feature model
     */
  createFeature(type: FeatureType, attributes: any): FeatureModel {
    return FeatureModelFactory.createModel(type, attributes);
  }

  /**
     * @param feature
     * @throws will throw an error if feature is null or undefined
     */
  addFeature(feature: FeatureModel) {
    $assert(feature, 'feature can not be null');
    this._features.push(feature);
  }

  getFeatures(): FeatureModel[] {
    return this._features;
  }

  /**
     * @param feature
     * @throws will throw an error if feature is null or undefined
     * @throws will throw an error if the feature could not be removed
     */
  removeFeature(feature: FeatureModel): void {
    $assert(feature, 'feature can not be null');
    const size = this._features.length;
    this._features = this._features.filter((f) => feature.getId() !== f.getId());
    $assert(size - 1 === this._features.length, 'Could not be removed ...');
  }

  /**
     * @param {String} type the feature type, e.g. icon or link
     * @throws will throw an error if type is null or undefined
     */
  findFeatureByType(type: string): FeatureModel[] {
    $assert(type, 'type can not be null');
    return this._features.filter((feature) => feature.getType() === type);
  }

  /**
     * @param {String} id
     * @throws will throw an error if id is null or undefined
     * @throws will throw an error if feature could not be found
     * @return the feature with the given id
     */
  findFeatureById(id: number): FeatureModel {
    $assert($defined(id), 'id can not be null');
    const result = this._features.filter((feature) => feature.getId() === id);
    $assert(result.length === 1, `Feature could not be found:${id}`);
    return result[0];
  }

  getPropertiesKeys() {
    return Object.keys(this._properties);
  }

  /**
     * @param key
     * @param value
     * @throws will throw an error if key is null or undefined
     */
  putProperty(key: string, value: string | number | boolean) {
    $defined(key, 'key can not be null');
    this._properties[key] = value;
  }

  getProperties() {
    return this._properties;
  }

  getProperty(key: string) {
    $defined(key, 'key can not be null');
    const result = this._properties[key];
    return !$defined(result) ? null : result;
  }

  /**
     * @return {mindplot.model.NodeModel} an identical clone of the NodeModel
     */
  clone(): NodeModel {
    const result = new NodeModel(this.getType(), this._mindmap, -1);
    result._children = this._children.map((node) => {
      const cnode = node.clone() as NodeModel;
      cnode._parent = result;
      return cnode;
    });

    result._properties = cloneDeep(this._properties);
    result._features = cloneDeep(this._features);
    return result;
  }

  /**
     * Similar to clone, assign new id to the elements ...
     * @return {mindplot.model.NodeModel}
     */
  deepCopy(): NodeModel {
    const result = new NodeModel(this.getType(), this._mindmap, -1);
    result._children = this._children.map((node) => {
      const cnode = (node as NodeModel).deepCopy();
      cnode._parent = result;
      return cnode;
    });

    const id = result.getId();
    result._properties = { ...this._properties };
    result.setId(id);

    result._features = cloneDeep(this._features);
    return result;
  }

  /**
     * @param {mindplot.model.NodeModel} child
     * @throws will throw an error if child is null, undefined or not a NodeModel object
     */
  append(child: NodeModel): void {
    $assert(child && child.isNodeModel(), 'Only NodeModel can be appended to Mindmap object');
    this._children.push(child);
    child._parent = this;
  }

  /**
     * @param {mindplot.model.NodeModel} child
     * @throws will throw an error if child is null, undefined or not a NodeModel object
     */
  removeChild(child: NodeModel): void {
    $assert(child && child.isNodeModel(), 'Only NodeModel can be appended to Mindmap object.');
    this._children = this._children.filter((c) => c !== child);
    child._parent = null;
  }

  getChildren(): NodeModel[] {
    return this._children;
  }

  getParent(): NodeModel {
    return this._parent;
  }

  setParent(parent: NodeModel): void {
    $assert(parent !== this, 'The same node can not be parent and child if itself.');
    this._parent = parent;
  }
}

export default NodeModel;
