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
import Command from '../Command';
import CommandContext from '../CommandContext';
import NodeModel from '../model/NodeModel';
import RelationshipModel from '../model/RelationshipModel';
import Relationship from '../Relationship';
import Topic from '../Topic';

class DeleteCommand extends Command {
  private _relIds: number[];

  private _topicIds: number[];

  private _deletedTopicModels: NodeModel[];

  private _deletedRelModel: RelationshipModel[];

  private _parentTopicIds: number[];

  constructor(topicIds: number[], relIds: number[]) {
    $assert($defined(relIds), 'topicIds can not be null');

    super();
    this._relIds = relIds;
    this._topicIds = topicIds;
    this._deletedTopicModels = [];
    this._deletedRelModel = [];
    this._parentTopicIds = [];
  }

  /**
   * Overrides abstract parent method
   */
  execute(commandContext: CommandContext) {
    // If a parent has been selected for deletion, the children must be excluded from the delete ...
    const topics = this._filterChildren(this._topicIds, commandContext);

    if (topics.length > 0) {
      topics.forEach((topic) => {
        // In case that it's editing text node, force close without update ...
        topic.closeEditors();

        const model = topic.getModel();

        // Delete relationships
        const relationships = this._collectInDepthRelationships(topic);
        this._deletedRelModel = this._deletedRelModel.concat(
          relationships.map((rel) => rel.getModel().clone()),
        );

        relationships.forEach((relationship) => {
          commandContext.deleteRelationship(relationship);
        });

        // Store information for undo ...
        const clonedModel = model.clone();
        this._deletedTopicModels.push(clonedModel);
        const outTopic = topic.getOutgoingConnectedTopic();

        let outTopicId: number | null = null;
        if (outTopic != null) {
          outTopicId = outTopic.getId();
          this._parentTopicIds.push(outTopicId);
        }

        // Finally, delete the topic from the workspace...
        commandContext.deleteTopic(topic);
      });
    }

    const rels = commandContext.findRelationships(this._relIds);
    if (rels.length > 0) {
      rels.forEach((rel) => {
        this._deletedRelModel.push(rel.getModel().clone());
        commandContext.deleteRelationship(rel);
      });
    }
  }

  /**
   * Overrides abstract parent method
   * @see {@link mindplot.Command.undoExecute}
   */
  undoExecute(commandContext: CommandContext) {
    // Add all the topics ...
    this._deletedTopicModels.forEach((model) => {
      commandContext.createTopic(model);
    });

    // Do they need to be connected ?
    this._deletedTopicModels.forEach((topicModel, index) => {
      const topics = commandContext.findTopics([topicModel.getId()]);

      const parentId = this._parentTopicIds[index];
      if (parentId) {
        const parentTopics = commandContext.findTopics([parentId]);
        commandContext.connect(topics[0], parentTopics[0]);
      }
    });

    // Add rebuild relationships ...
    this._deletedRelModel.forEach((model) => {
      commandContext.addRelationship(model);
    });

    // Finally display the topics ...
    this._deletedTopicModels.forEach((topicModel) => {
      const topics = commandContext.findTopics([topicModel.getId()]);
      topics[0].setBranchVisibility(true);
    });

    // Focus on last recovered topic ..
    if (this._deletedTopicModels.length > 0) {
      const firstTopic = this._deletedTopicModels[0];
      const topic = commandContext.findTopics([firstTopic.getId()])[0];
      topic.setOnFocus(true);
    }

    this._deletedTopicModels = [];
    this._parentTopicIds = [];
    this._deletedRelModel = [];
  }

  private _filterChildren(topicIds: number[], commandContext: CommandContext): Topic[] {
    const topics = commandContext.findTopics(topicIds);

    const result: Topic[] = [];
    topics.forEach((topic: Topic) => {
      let parent = topic.getParent();
      let found = false;
      while (parent != null && !found) {
        found = topicIds.includes(parent.getId());
        if (found) {
          break;
        }
        parent = parent.getParent();
      }

      if (!found) {
        result.push(topic);
      }
    });

    return result;
  }

  private _collectInDepthRelationships(topic: Topic): Relationship[] {
    let result: Relationship[] = [];
    result.push(...topic.getRelationships());

    const children = topic.getChildren();
    const rels: Relationship[][] = children.map((t: Topic) => this._collectInDepthRelationships(t));

    // flatten and concact
    result.push(...rels.flat());

    if (result.length > 0) {
      // Filter for unique ...
      result = result.sort((a, b) => a.getModel().getId() - b.getModel().getId());
      const ret = [result[0]];
      // start loop at 1 as element 0 can never be a duplicate
      for (let i = 1; i < result.length; i++) {
        if (result[i - 1] !== result[i]) {
          ret.push(result[i]);
        }
      }
      result = ret;
    }
    return result;
  }
}

export default DeleteCommand;
