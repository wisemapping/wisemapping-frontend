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
import IMindmap from './IMindmap';
import INodeModel from './INodeModel';
import NodeModel from './NodeModel';
import RelationshipModel from './RelationshipModel';
import ModelCodeName from '../persistence/ModelCodeName';

class Mindmap extends IMindmap {
  constructor(id, version) {
    super();
    $assert(id, 'Id can not be null');
    this._branches = [];
    this._description = null;
    this._relationships = [];
    this._version = $defined(version) ? version : ModelCodeName.TANGO;
    this._id = id;
  }

  /** */
  getDescription() {
    return this._description;
  }

  /** */
  setDescription(value) {
    this._description = value;
  }

  /** */
  getId() {
    return this._id;
  }

  /** */
  setId(id) {
    this._id = id;
  }

  /** */
  getVersion() {
    return this._version;
  }

  /** */
  setVersion(version) {
    this._version = version;
  }

  /**
         * @param {mindplot.model.NodeModel} nodeModel
         * @throws will throw an error if nodeModel is null, undefined or not a node model object
         * @throws will throw an error if
         */
  addBranch(nodeModel) {
    $assert(nodeModel && nodeModel.isNodeModel(), 'Add node must be invoked with model objects');
    const branches = this.getBranches();
    if (branches.length === 0) {
      $assert(nodeModel.getType() === INodeModel.CENTRAL_TOPIC_TYPE, 'First element must be the central topic');
      nodeModel.setPosition(0, 0);
    } else {
      $assert(nodeModel.getType() !== INodeModel.CENTRAL_TOPIC_TYPE, 'Mindmaps only have one cental topic');
    }

    this._branches.push(nodeModel);
  }

  /**
         * @param nodeModel
         */
  removeBranch(nodeModel) {
    $assert(nodeModel && nodeModel.isNodeModel(), 'Remove node must be invoked with model objects');
    this._branches = this._branches.filter((b) => b !== nodeModel);
  }

  /** */
  getBranches() {
    return this._branches;
  }

  /** */
  getRelationships() {
    return this._relationships;
  }

  /**
         * @param node
         * @return {Boolean} true if node already exists
         */
  hasAlreadyAdded(node) {
    let result = false;

    // Check in not connected nodes.
    const branches = this._branches;
    for (let i = 0; i < branches.length; i++) {
      result = branches[i]._isChildNode(node);
      if (result) {
        break;
      }
    }
  }

  /**
         * @param type
         * @param id
         * @return the node model created
         */
  createNode(type = INodeModel.MAIN_TOPIC_TYPE, id) {
    return new NodeModel(type, this, id);
  }

  /**
   * @param sourceNodeId
   * @param targetNodeId
   * @throws will throw an error if source node is null or undefined
   * @throws will throw an error if target node is null or undefined
   * @return the relationship model created
   */
  createRelationship(sourceNodeId, targetNodeId) {
    $assert($defined(sourceNodeId), 'from node cannot be null');
    $assert($defined(targetNodeId), 'to node cannot be null');

    return new RelationshipModel(sourceNodeId, targetNodeId);
  }

  /**
   * @param relationship
   */
  addRelationship(relationship) {
    this._relationships.push(relationship);
  }

  /**
         * @param relationship
         */
  deleteRelationship(relationship) {
    this._relationships = this._branches.filter((r) => r !== relationship);
  }

  findNodeById(id) {
    let result = null;
    for (let i = 0; i < this._branches.length; i++) {
      const branch = this._branches[i];
      result = branch.findNodeById(id);
      if (result) {
        break;
      }
    }
    return result;
  }
}

/**
 * @param mapId
 * @return an empty mindmap with central topic only
 */
Mindmap.buildEmpty = (mapId) => {
  const result = new Mindmap(mapId);
  const node = result.createNode(INodeModel.CENTRAL_TOPIC_TYPE, 0);
  result.addBranch(node);
  return result;
};

export default Mindmap;
