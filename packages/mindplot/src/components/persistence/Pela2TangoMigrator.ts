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
    $assert(mapId != null, 'mapId can not be null');
    const mindmap = this._pelaSerializer.loadFromDom(dom, mapId);
    mindmap.setVersion(ModelCodeName.TANGO);
    // An empty map has no central topic: there is nothing to fix.
    const centralNode = mindmap.getBranches()[0];
    if (centralNode) {
      // Positions first: the order fix reads them to tell the left and right sides apart.
      this._fixPosition(centralNode);
      this._fixOrder(centralNode);
    }
    return mindmap;
  }

  private _fixOrder(centralNode: NodeModel) {
    // First level node policies has been changed.
    const children: NodeModel[] = centralNode.getChildren();
    const leftNodes: NodeModel[] = [];
    const rightNodes: NodeModel[] = [];

    children.forEach((child) => {
      const position = child.getPositionOrThrow();
      if (position.x < 0) {
        leftNodes.push(child);
      } else {
        rightNodes.push(child);
      }
      rightNodes.sort((a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0));
      leftNodes.sort((a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0));
    });

    rightNodes.forEach((node, i) => node.setOrder(i * 2));
    leftNodes.forEach((node, i) => node.setOrder(i * 2 + 1));
  }

  private _fixPosition(centralNode: NodeModel): void {
    // Position was not required in previous versions. Try to synthesize one .
    centralNode.getChildren().forEach((child) => {
      if (!child.hasPosition()) {
        child.setPosition(0, 0);
      }
      this._fixNodePosition(child, child.getPositionOrThrow());
    });
  }

  private _fixNodePosition(node: NodeModel, parentPosition: { x: number; y: number }): void {
    // Position was not required in previous versions. Try to synthesize one .
    let position = node.getPosition();
    if (!position) {
      // One step further from the centre, on the side of the parent (x 0 counts as right).
      const offset = parentPosition.x < 0 ? -30 : 30;
      position = { x: parentPosition.x + offset, y: parentPosition.y };
      node.setPosition(position.x, position.y);
    }
    node.getChildren().forEach((child) => this._fixNodePosition(child, position));
  }
}

export default Pela2TangoMigrator;
