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
import { $assert } from '../util/assert';
import INodeModel, { NodeModelType as NodeType } from './INodeModel';
import NodeModel from './NodeModel';
import RelationshipModel from './RelationshipModel';

abstract class IMindmap {
  getCentralTopic(): INodeModel {
    return this.getBranches()[0];
  }

  abstract getDescription(): string;

  abstract setDescription(value: string): void;

  abstract getId(): string | undefined;

  abstract setId(id: string): void;

  abstract getVersion(): string;

  abstract setVersion(version: string): void;

  abstract addBranch(nodeModel: INodeModel): void;

  abstract getBranches(): NodeModel[];

  abstract removeBranch(node: INodeModel): void;

  abstract getRelationships(): RelationshipModel[];

  connect(parent: INodeModel, child: INodeModel): void {
    // Child already has a parent ?
    $assert(!child.getParent(), 'Child model seems to be already connected');

    //  Connect node...
    parent.append(child);

    // Remove from the branch ...
    this.removeBranch(child);
  }

  /**
   * @param child
   * @throws will throw an error if child is null or undefined
   * @throws will throw an error if child's parent cannot be found
   */
  disconnect(child: INodeModel): void {
    const parent = child.getParent();
    $assert(child, 'Child can not be null.');
    $assert(parent, 'Child model seems to be already connected');

    parent?.removeChild(child);
    this.addBranch(child);
  }

  abstract hasAlreadyAdded(node): boolean;

  abstract createNode(type: NodeType, id: number);

  abstract createRelationship(fromNodeId: number, toNodeId: number): void;

  abstract addRelationship(rel: RelationshipModel): void;

  abstract deleteRelationship(relationship: RelationshipModel): void;

  inspect(): string {
    let result = '';
    result = '{ ';

    const branches = this.getBranches();
    result = `${result} , version:${this.getVersion()}`;
    result = `${result} , [`;

    for (let i = 0; i < branches.length; i++) {
      const node = branches[i];
      if (i !== 0) {
        result = `${result},\n `;
      }
      result = `${result}(${i}) =>${node.inspect()}`;
    }
    result = `${result}]`;

    result = `${result} } `;
    return result;
  }

  copyTo(target: IMindmap) {
    const version = this.getVersion();
    target.setVersion(version);

    const desc = this.getDescription();
    target.setDescription(desc);

    // Then the rest of the branches ...
    const sbranchs = this.getBranches();
    sbranchs.forEach((snode) => {
      const tnode = target.createNode(snode.getType(), snode.getId());
      snode.copyTo(tnode);
      target.addBranch(tnode);
    });
  }
}

export default IMindmap;
