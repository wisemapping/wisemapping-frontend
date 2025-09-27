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
import INodeModel, { NodeModelType } from './INodeModel';
import NodeModel from './NodeModel';
import RelationshipModel from './RelationshipModel';
import ModelCodeName from '../persistence/ModelCodeName';
import ThemeType from './ThemeType';

class Mindmap extends IMindmap {
  private _description: string;

  private _version: string;

  private _id: string | undefined;

  private _branches: Array<NodeModel>;

  private _relationships: Array<RelationshipModel>;

  private _theme: ThemeType;

  private _canvasStyle:
    | {
        backgroundColor: string;
        backgroundPattern: 'solid' | 'grid' | 'dots' | 'none';
        gridSize: number;
        gridColor: string;
      }
    | undefined;

  constructor(id?: string, version: string = ModelCodeName.TANGO) {
    super();
    this._branches = [];
    this._description = '';
    this._relationships = [];
    this._theme = 'classic'; // Default theme
    this._version = version;
    this._id = id;
  }

  getTheme(): ThemeType {
    return this._theme;
  }

  setTheme(value: ThemeType): void {
    this._theme = value;
  }

  getCanvasStyle():
    | {
        backgroundColor: string;
        backgroundPattern: 'solid' | 'grid' | 'dots' | 'none';
        gridSize: number;
        gridColor: string;
      }
    | undefined {
    return this._canvasStyle;
  }

  setCanvasStyle(
    value:
      | {
          backgroundColor: string;
          backgroundPattern: 'solid' | 'grid' | 'dots' | 'none';
          gridSize: number;
          gridColor: string;
        }
      | undefined,
  ): void {
    this._canvasStyle = value;
  }

  /** */
  getDescription(): string {
    return this._description;
  }

  /** */
  setDescription(value: string) {
    this._description = value;
  }

  getId(): string | undefined {
    return this._id;
  }

  /** */
  setId(id: string) {
    this._id = id;
  }

  /** */
  getVersion(): string {
    return this._version;
  }

  /** */
  setVersion(version: string): void {
    this._version = version;
  }

  /**
   * @param {mindplot.model.NodeModel} nodeModel
   * @throws will throw an error if nodeModel is null, undefined or not a node model object
   * @throws will throw an error if
   */
  addBranch(nodeModel: INodeModel): void {
    $assert(nodeModel && nodeModel.isNodeModel(), 'Add node must be invoked with model objects');
    const branches = this.getBranches();
    if (branches.length === 0) {
      $assert(nodeModel.getType() === 'CentralTopic', 'First element must be the central topic');
      nodeModel.setPosition(0, 0);
    } else {
      $assert(nodeModel.getType() !== 'CentralTopic', 'Mindmaps only have one cental topic');
    }

    this._branches.push(nodeModel as NodeModel);
  }

  /**
   * @param nodeModel
   */
  removeBranch(nodeModel: INodeModel): void {
    $assert(nodeModel && nodeModel.isNodeModel(), 'Remove node must be invoked with model objects');
    this._branches = this._branches.filter((b) => b !== nodeModel);
  }

  getBranches(): NodeModel[] {
    return this._branches;
  }

  getRelationships(): Array<RelationshipModel> {
    return this._relationships;
  }

  hasAlreadyAdded(node: NodeModel): boolean {
    let result = false;

    // Check in not connected nodes.
    const branches = this._branches;
    for (let i = 0; i < branches.length; i++) {
      result = branches[i].isChildNode(node);
      if (result) {
        break;
      }
    }
    return result;
  }

  createNode(type: NodeModelType = 'MainTopic', id?: number): NodeModel {
    return new NodeModel(type, this, id);
  }

  createRelationship(sourceNodeId: number, targetNodeId: number): RelationshipModel {
    $assert($defined(sourceNodeId), 'from node cannot be null');
    $assert($defined(targetNodeId), 'to node cannot be null');

    return new RelationshipModel(sourceNodeId, targetNodeId);
  }

  /**
   * @param relationship
   */
  addRelationship(relationship: RelationshipModel) {
    this._relationships.push(relationship);
  }

  /**
   * @param relationship
   */
  deleteRelationship(relationship: RelationshipModel) {
    this._relationships = this._relationships.filter((r) => r !== relationship);
  }

  findNodeById(id: number) {
    let result;
    for (let i = 0; i < this._branches.length; i++) {
      const branch = this._branches[i];
      result = branch.findNodeById(id);
      if (result) {
        break;
      }
    }
    return result;
  }

  static buildEmpty = (mapId: string) => {
    const result = new Mindmap(mapId);
    const node = result.createNode('CentralTopic', 0);
    result.addBranch(node);
    return result;
  };
}

export default Mindmap;
