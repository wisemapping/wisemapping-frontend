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
const Command = require('../Command').default;

const DeleteCommand = new Class(/** @lends mindplot.commands.DeleteCommand */{
  Extends: Command,
  /**
     * @classdesc This command class handles do/undo of deleting a topic.
     * @constructs
     * @param {Array<String>} topicIds ids of the topics to delete
     * @param {Array<String>} relIds ids of the relationships connected to the topics
     * @extends mindplot.Command
     */
  initialize(topicIds, relIds) {
    $assert($defined(relIds), 'topicIds can not be null');

    this.parent();
    this._relIds = relIds;
    this._topicIds = topicIds;
    this._deletedTopicModels = [];
    this._deletedRelModel = [];
    this._parentTopicIds = [];
  },

  /**
     * Overrides abstract parent method
     */
  execute(commandContext) {
    // If a parent has been selected for deletion, the children must be excluded from the delete ...
    const topics = this._filterChildren(this._topicIds, commandContext);

    if (topics.length > 0) {
      _.each(topics, function (topic) {
        // In case that it's editing text node, force close without update ...
        topic.closeEditors();

        const model = topic.getModel();

        // Delete relationships
        const relationships = this._collectInDepthRelationships(topic);
        this._deletedRelModel.append(relationships.map((rel) => rel.getModel().clone()));

        _.each(relationships, (relationship) => {
          commandContext.deleteRelationship(relationship);
        });

        // Store information for undo ...
        const clonedModel = model.clone();
        this._deletedTopicModels.push(clonedModel);
        const outTopic = topic.getOutgoingConnectedTopic();
        let outTopicId = null;
        if (outTopic != null) {
          outTopicId = outTopic.getId();
        }
        this._parentTopicIds.push(outTopicId);

        // Finally, delete the topic from the workspace...
        commandContext.deleteTopic(topic);
      }, this);
    }

    const rels = commandContext.findRelationships(this._relIds);
    if (rels.length > 0) {
      _.each(rels, function (rel) {
        this._deletedRelModel.push(rel.getModel().clone());
        commandContext.deleteRelationship(rel);
      }, this);
    }
  },

  /**
     * Overrides abstract parent method
     * @see {@link mindplot.Command.undoExecute}
     */
  undoExecute(commandContext) {
    // Add all the topics ...
    _.each(this._deletedTopicModels, (model) => {
      commandContext.createTopic(model);
    }, this);

    // Do they need to be connected ?
    _.each(this._deletedTopicModels, function (topicModel, index) {
      const topics = commandContext.findTopics(topicModel.getId());

      const parentId = this._parentTopicIds[index];
      if (parentId) {
        const parentTopics = commandContext.findTopics(parentId);
        commandContext.connect(topics[0], parentTopics[0]);
      }
    }, this);

    // Add rebuild relationships ...
    _.each(this._deletedRelModel, (model) => {
      commandContext.addRelationship(model);
    });

    // Finally display the topics ...
    _.each(this._deletedTopicModels, (topicModel) => {
      const topics = commandContext.findTopics(topicModel.getId());
      topics[0].setBranchVisibility(true);
    }, this);

    // Focus on last recovered topic ..
    if (this._deletedTopicModels.length > 0) {
      const firstTopic = this._deletedTopicModels[0];
      const topic = commandContext.findTopics(firstTopic.getId())[0];
      topic.setOnFocus(true);
    }

    this._deletedTopicModels = [];
    this._parentTopicIds = [];
    this._deletedRelModel = [];
  },

  _filterChildren(topicIds, commandContext) {
    const topics = commandContext.findTopics(topicIds);

    const result = [];
    _.each(topics, (topic) => {
      let parent = topic.getParent();
      let found = false;
      while (parent != null && !found) {
        found = topicIds.contains(parent.getId());
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
  },

  _collectInDepthRelationships(topic) {
    let result = [];
    result.append(topic.getRelationships());

    const children = topic.getChildren();
    const rels = children.map(function (topic) {
      return this._collectInDepthRelationships(topic);
    }, this);
    result.append(rels.flatten());

    if (result.length > 0) {
      // Filter for unique ...
      result = result.sort((a, b) => a.getModel().getId() - b.getModel().getId());
      const ret = [result[0]];
      for (let i = 1; i < result.length; i++) { // start loop at 1 as element 0 can never be a duplicate
        if (result[i - 1] !== result[i]) {
          ret.push(result[i]);
        }
      }
      result = ret;
    }
    return result;
  },

});

export default DeleteCommand;
