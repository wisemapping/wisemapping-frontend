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
import cloneDeep from 'lodash/cloneDeep';
import { $assert } from '../util/assert';
import type { NodeModelType, NodePropKey, NodeProps } from './INodeModel';
import INodeModel from './INodeModel';
import FeatureModelFactory from './FeatureModelFactory';
import type { FeatureAttributes } from './FeatureModel';
import type FeatureModel from './FeatureModel';
import type Mindmap from './Mindmap';
import type FeatureType from './FeatureType';
import { type FeatureByType } from './FeatureType';

class NodeModel extends INodeModel {
  private _properties: Partial<NodeProps>;

  private _children: NodeModel[];

  private _features: FeatureModel[];

  private _parent: NodeModel | null;

  constructor(type: NodeModelType, mindmap: Mindmap, id?: number) {
    super(mindmap);

    this._properties = {};
    this.setId(id);
    this.setType(type);
    this.areChildrenShrunken();

    this._children = [];
    this._features = [];
    this._parent = null;
  }

  /**
   * @param type
   * @param attributes
   * @return {mindplot.model.FeatureModel} the created feature model
   */
  createFeature<T extends FeatureType>(type: T, attributes: FeatureAttributes): FeatureByType[T] {
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
  findFeatureByType<T extends FeatureType>(type: T): FeatureByType[T][] {
    $assert(type, 'type can not be null');
    return this._features.filter((feature): feature is FeatureByType[T] => feature.isOfType(type));
  }

  /**
   * @param {String} id
   * @throws will throw an error if id is null or undefined
   * @throws will throw an error if feature could not be found
   * @return the feature with the given id
   */
  findFeatureById(id: number): FeatureModel {
    $assert(id != null, 'id can not be null');
    const matches = this._features.filter((feature) => feature.getId() === id);
    const [result] = matches;
    $assert(result && matches.length === 1, `Feature could not be found:${id}`);
    return result;
  }

  getPropertiesKeys(): NodePropKey[] {
    return Object.keys(this._properties) as NodePropKey[];
  }

  putProperty<K extends NodePropKey>(key: K, value: NodeProps[K]): void {
    this._properties[key] = value;
    if (key === 'id') {
      INodeModel.treeChanged();
    }
  }

  getProperties(): Readonly<Partial<NodeProps>> {
    return this._properties;
  }

  // id and type are set by the constructor, so they are never missing.
  getProperty<K extends NodePropKey>(key: K): NodeProps[K] {
    return this._properties[key] as NodeProps[K];
  }

  clone(): NodeModel {
    const result = new NodeModel(this.getType(), this._mindmap);
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
   * A copy of this branch with new ids, owned by `mindmap` (this node's map by default): a copy
   * pasted into another map must belong to it, or it is themed and deleted against the wrong one.
   */
  deepCopy(mindmap: Mindmap = this._mindmap): NodeModel {
    const result = new NodeModel(this.getType(), mindmap);
    result._children = this._children.map((node) => {
      const cnode = (node as NodeModel).deepCopy(mindmap);
      cnode._parent = result;
      return cnode;
    });

    const id = result.getId();
    result._properties = { ...this._properties };
    result.setId(id);

    result._features = cloneDeep(this._features);
    return result;
  }

  append(child: NodeModel): void {
    $assert(child && child.isNodeModel(), 'Only NodeModel can be appended to Mindmap object');
    this._children.push(child);
    child._parent = this;
    INodeModel.treeChanged();
  }

  removeChild(child: NodeModel): void {
    $assert(child && child.isNodeModel(), 'Only NodeModel can be appended to Mindmap object.');
    this._children = this._children.filter((c) => c !== child);
    child._parent = null;
    INodeModel.treeChanged();
  }

  findNodeById(id: number): NodeModel | undefined {
    if (this.getId() === id) {
      return this;
    }
    // The first match, depth first; the children after it are not searched.
    return this._children.reduce<NodeModel | undefined>(
      (found, child) => found ?? child.findNodeById(id),
      undefined,
    );
  }

  getChildren(): NodeModel[] {
    return this._children;
  }

  getParent(): NodeModel | null {
    return this._parent;
  }

  setParent(parent: NodeModel): void {
    $assert(parent !== this, 'The same node can not be parent and child if itself.');
    this._parent = parent;
  }
}

export default NodeModel;
