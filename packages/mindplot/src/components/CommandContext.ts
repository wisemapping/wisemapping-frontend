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
import { Designer } from '..';
import EventBus from './layout/EventBus';
import NodeModel from './model/NodeModel';
import RelationshipModel from './model/RelationshipModel';
import PositionType from './PositionType';
import Relationship from './Relationship';
import Topic from './Topic';

class CommandContext {
  private _designer: Designer;

  constructor(designer: Designer) {
    $assert(designer, 'designer can not be null');
    this._designer = designer;
  }

  public get designer(): Designer {
    return this._designer;
  }

  public set designer(value: Designer) {
    this._designer = value;
  }

  findTopics(topicIds: number[]): Topic[] {
    const topicsIds = Array.isArray(topicIds) ? topicIds : [topicIds];
    const designerTopics = this._designer.getModel().getTopics();
    const result = designerTopics.filter((topic) => topicsIds.includes(topic.getId()));

    if (result.length !== topicsIds.length) {
      const ids = designerTopics.map((topic) => topic.getId());
      throw new Error(
        `Could not find topic. Result:${result} Filter Criteria:${topicsIds} Current Topics: [${ids}])`,
      );
    }
    return result;
  }

  /** */
  deleteTopic(topic: Topic): void {
    this._designer.removeTopic(topic);
  }

  /** */
  createTopic(model: NodeModel): Topic {
    $assert(model, 'model can not be null');
    return this._designer.nodeModelToTopic(model);
  }

  /** */
  addTopic(topic: Topic): void {
    const mindmap = this._designer.getMindmap();
    mindmap.addBranch(topic.getModel());
  }

  /** */
  connect(childTopic: Topic, parentTopic: Topic): void {
    childTopic.connectTo(parentTopic, this._designer.getWorkSpace());
  }

  /** */
  disconnect(topic: Topic): void {
    topic.disconnect(this._designer.getWorkSpace());
  }

  /** */
  addRelationship(model: RelationshipModel): Relationship {
    $assert(model, 'model cannot be null');
    return this._designer.addRelationship(model);
  }

  /** */
  deleteRelationship(relationship: Relationship): void {
    this._designer.deleteRelationship(relationship);
  }

  /** */
  findRelationships(relationshipIds: number[]): Relationship[] {
    $assert($defined(relationshipIds), 'relId can not be null');
    const relIds = Array.isArray(relationshipIds) ? relationshipIds : [relationshipIds];

    const designerRel = this._designer.getModel().getRelationships();
    return designerRel.filter((rel) => relIds.includes(rel.getId()));
  }

  /** */
  moveTopic(topic: Topic, position: PositionType): void {
    $assert(topic, 'topic cannot be null');
    $assert(position, 'position cannot be null');
    EventBus.instance.fireEvent('topicMoved', {
      node: topic.getModel(),
      position,
    });
  }
}
export default CommandContext;
