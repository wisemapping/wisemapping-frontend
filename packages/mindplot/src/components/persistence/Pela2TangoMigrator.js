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
import XMLSerializer_Tango from './XMLSerializer_Tango';
import ModelCodeName from './ModelCodeName';

const Pela2TangoMigrator = new Class({
  initialize(pelaSerializer) {
    this._pelaSerializer = pelaSerializer;
    this._tangoSerializer = new XMLSerializer_Tango();
  },

  toXML(mindmap) {
    return this._tangoSerializer.toXML(mindmap);
  },

  loadFromDom(dom, mapId) {
    $assert($defined(mapId), 'mapId can not be null');
    const mindmap = this._pelaSerializer.loadFromDom(dom, mapId);
    mindmap.setVersion(ModelCodeName.TANGO);
    this._fixOrder(mindmap);
    this._fixPosition(mindmap);
    return mindmap;
  },

  _fixOrder(mindmap) {
    // First level node policies has been changed.
    const centralNode = mindmap.getBranches()[0];
    const children = centralNode.getChildren();
    const leftNodes = [];
    const rightNodes = [];
    for (var i = 0; i < children.length; i++) {
      const child = children[i];
      const position = child.getPosition();
      if (position.x < 0) {
        leftNodes.push(child);
      } else {
        rightNodes.push(child);
      }
    }
    rightNodes.sort((a, b) => a.getOrder() > b.getOrder());
    leftNodes.sort((a, b) => a.getOrder() > b.getOrder());

    for (i = 0; i < rightNodes.length; i++) {
      rightNodes[i].setOrder(i * 2);
    }

    for (i = 0; i < leftNodes.length; i++) {
      leftNodes[i].setOrder(i * 2 + 1);
    }
  },

  _fixPosition(mindmap) {
    // Position was not required in previous versions. Try to synthesize one .
    const centralNode = mindmap.getBranches()[0];
    const children = centralNode.getChildren();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const position = child.getPosition();
      this._fixNodePosition(child, position);
    }
  },
  _fixNodePosition(node, parentPosition) {
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
  },
});

export default Pela2TangoMigrator;