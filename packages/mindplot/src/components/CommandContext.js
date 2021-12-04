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
import { $assert, $defined } from "@wisemapping/core-js";

class CommandContext {
  constructor(designer) {
    $assert(designer, 'designer can not be null');
    this._designer = designer;
  }

  /** */
  findTopics(topicsIds) {
    $assert($defined(topicsIds), 'topicsIds can not be null');
    if (!(topicsIds instanceof Array)) {
      topicsIds = [topicsIds];
    }

    const designerTopics = this._designer.getModel().getTopics();
    const result = designerTopics.filter((topic) => topicsIds.contains(topic.getId()));

    if (result.length !== topicsIds.length) {
      const ids = designerTopics.map((topic) => topic.getId());
      $assert(
        result.length === topicsIds.length,
        `Could not find topic. Result:${result
        } Filter Criteria:${topicsIds
        } Current Topics: [${ids
        }]`,
      );
    }
    return result;
  }

  /** */
  deleteTopic(topic) {
    this._designer.removeTopic(topic);
  }

  /** */
  createTopic(model) {
    $assert(model, 'model can not be null');
    return this._designer.nodeModelToNodeGraph(model);
  }

  /** */
  createModel() {
    const mindmap = this._designer.getMindmap();
    return mindmap.createNode(NodeModel.MAIN_TOPIC_TYPE);
  }

  /** */
  addTopic(topic) {
    const mindmap = this._designer.getMindmap();
    return mindmap.addBranch(topic.getModel());
  }

  /** */
  connect(childTopic, parentTopic) {
    childTopic.connectTo(parentTopic, this._designer._workspace);
  }

  /** */
  disconnect(topic) {
    topic.disconnect(this._designer._workspace);
  }

  /** */
  addRelationship(model) {
    $assert(model, 'model cannot be null');
    return this._designer.addRelationship(model);
  }

  /** */
  deleteRelationship(relationship) {
    this._designer.deleteRelationship(relationship);
  }

  /** */
  findRelationships(relIds) {
    $assert($defined(relIds), 'relId can not be null');
    if (!(relIds instanceof Array)) {
      relIds = [relIds];
    }

    const designerRel = this._designer.getModel().getRelationships();
    return designerRel.filter((rel) => relIds.contains(rel.getId()));
  }

  /** */
  moveTopic(topic, position) {
    $assert(topic, 'topic cannot be null');
    $assert(position, 'position cannot be null');
    EventBus.instance.fireEvent(EventBus.events.NodeMoveEvent, {
      node: topic.getModel(),
      position,
    });
  }
}
// eslint-disable-next-line import/prefer-default-export
export default CommandContext;
