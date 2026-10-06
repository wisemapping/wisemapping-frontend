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
import type Mindmap from '../model/Mindmap';
import NodeModel from '../model/NodeModel';
import { sideOf } from '../util/side';
import ModelCodeName from './ModelCodeName';
import XMLMindmapSerializer from './XMLMindmapSerializer';
import XMLSerializerPela from './XMLSerializerTango';

class Beta2PelaMigrator implements XMLMindmapSerializer {
  // Vertical gap between the central topic and the top level topics placed below it.
  private static DETACHED_TOPIC_GAP = 100;

  private _betaSerializer: XMLMindmapSerializer;

  private _pelaSerializer: XMLSerializerPela;

  constructor(betaSerializer: XMLMindmapSerializer) {
    this._betaSerializer = betaSerializer;
    this._pelaSerializer = new XMLSerializerPela();
  }

  toXML(mindmap: Mindmap) {
    return this._pelaSerializer.toXML(mindmap);
  }

  loadFromDom(dom: Document, mapId: string): Mindmap {
    $assert(mapId != null, 'mapId can not be null');
    const mindmap = this._betaSerializer.loadFromDom(dom, mapId);
    mindmap.setVersion(ModelCodeName.PELA);

    // Beta does not set position on second level nodes ...
    const branches = mindmap.getBranches();
    const me = this;
    branches.forEach((model, index) => {
      // The central topic is always positioned (see Mindmap.addBranch). Any other top level
      // topic without position (hand-made maps) is stacked below it.
      if (!model.hasPosition()) {
        // branches is not empty: model is one of them.
        const centralPos = branches[0]!.getPositionOrThrow();
        model.setPosition(
          centralPos.x,
          centralPos.y + index * Beta2PelaMigrator.DETACHED_TOPIC_GAP,
        );
      }
      me._fixPosition(model);
    });

    return mindmap;
  }

  private _fixPosition(parentModel: NodeModel) {
    const parentPos = parentModel.getPositionOrThrow();
    // x === 0 counts as the right side, as Pela2TangoMigrator orders the topics.
    const side = sideOf(parentPos.x);
    const me = this;
    parentModel.getChildren().forEach((child) => {
      if (!child.hasPosition()) {
        child.setPosition(parentPos.x + side, parentPos.y);
      }
      me._fixPosition(child);
    });
  }
}

export default Beta2PelaMigrator;
