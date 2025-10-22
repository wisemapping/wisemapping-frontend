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
import { $assert, $defined } from '../util/assert';
import XMLSerializer from './XMLSerializerTango';
import ModelCodeName from './ModelCodeName';
import XMLMindmapSerializer from './XMLMindmapSerializer';
import Mindmap from '../model/Mindmap';
import NodeModel from '../model/NodeModel';

class Pela2TangoMigrator implements XMLMindmapSerializer {
  private _pelaSerializer: XMLMindmapSerializer;

  private _tangoSerializer: XMLSerializer;

  constructor(pelaSerializer: XMLMindmapSerializer) {
    this._pelaSerializer = pelaSerializer;
    this._tangoSerializer = new XMLSerializer();
  }

  toXML(mindmap: Mindmap): Document {
    return this._tangoSerializer.toXML(mindmap);
  }

  loadFromDom(dom: Document, mapId: string): Mindmap {
    $assert($defined(mapId), 'mapId can not be null');
    const mindmap = this._pelaSerializer.loadFromDom(dom, mapId);
    mindmap.setVersion(ModelCodeName.TANGO);
    this._fixOrder(mindmap);
    this._fixPosition(mindmap);
    return mindmap;
  }

  private _fixOrder(mindmap: Mindmap) {
    // First level node policies has been changed.
    const centralNode: NodeModel = mindmap.getBranches()[0];
    const children: NodeModel[] = centralNode.getChildren();
    const leftNodes: NodeModel[] = [];
    const rightNodes: NodeModel[] = [];

    children.forEach((child) => {
      const position = child.getPosition();
      if (position.x < 0) {
        leftNodes.push(child);
      } else {
        rightNodes.push(child);
      }
      rightNodes.sort((a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0));
      leftNodes.sort((a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0));
    });

    for (let i = 0; i < rightNodes.length; i++) {
      rightNodes[i].setOrder(i * 2);
    }

    for (let i = 0; i < leftNodes.length; i++) {
      leftNodes[i].setOrder(i * 2 + 1);
    }
  }

  private _fixPosition(mindmap: Mindmap): void {
    // Position was not required in previous versions. Try to synthesize one .
    const centralNode = mindmap.getBranches()[0];
    const children = centralNode.getChildren();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const position = child.getPosition();
      this._fixNodePosition(child, position);
    }
  }

  private _fixNodePosition(node: NodeModel, parentPosition: { x: number; y: number }): void {
    // Position was not required in previous versions. Try to synthesize one .
    let position = node.getPosition();
    if (!position) {
      position = { x: parentPosition.x + 30, y: parentPosition.y };
      node.setPosition(position.x, position.y);
    }
    const children = node.getChildren();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      this._fixNodePosition(child, position);
    }
  }
}

export default Pela2TangoMigrator;
