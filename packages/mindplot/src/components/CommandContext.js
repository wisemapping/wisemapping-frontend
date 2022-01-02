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
import EventBus from './layout/EventBus';
import NodeModel from './model/NodeModel';

class CommandContext {
  constructor(designer) {
    $assert(designer, 'designer can not be null');
    this._designer = designer;
  }

  /** */
  findTopics(topicIds) {
    $assert($defined(topicIds), 'topicsIds can not be null');
    const topicsIds = Array.isArray(topicIds) ? topicIds : [topicIds];
    const designerTopics = this._designer.getModel().getTopics();
    const result = designerTopics.filter((topic) => topicsIds.includes(topic.getId()));

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
    return mindmap.createNode('MainTopic');
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
  findRelationships(relationshipIds) {
    $assert($defined(relationshipIds), 'relId can not be null');
    const relIds = Array.isArray(relationshipIds) ? relationshipIds : [relationshipIds];

    const designerRel = this._designer.getModel().getRelationships();
    return designerRel.filter((rel) => relIds.includes(rel.getId()));
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
