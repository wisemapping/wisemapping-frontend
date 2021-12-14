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
import { $assert, $defined } from '@wisemapping/core-js';
import Command from '../Command';

class AddTopicCommand extends Command {
  /**
   * @classdesc This command class handles do/undo of adding one or multiple topics to
   * the mindmap.
   * @constructs
   * @param {Array<mindplot.model.NodeModel>} models one or multiple models
   * @param {Array<String>} parentTopicsId ids of the parent topics to add the children to, or null
   * when attaching a dragged node or a node/branch from clipboard
   * @extends mindplot.Command
   */
  constructor(models, parentTopicsId) {
    $assert(models, 'models can not be null');
    $assert(parentTopicsId == null || parentTopicsId.length == models.length, 'parents and models must have the same size');

    super();
    this._models = models;
    this._parentsIds = parentTopicsId;
  }

  /**
       * Overrides abstract parent method
       */
  execute(commandContext) {
    const me = this;
    this._models.forEach((model, index) => {
      // Add a new topic ...
      const topic = commandContext.createTopic(model);

      // Connect to topic ...
      if (me._parentsIds) {
        const parentId = me._parentsIds[index];
        if ($defined(parentId)) {
          const parentTopic = commandContext.findTopics(parentId)[0];
          commandContext.connect(topic, parentTopic);
        }
      } else {
        commandContext.addTopic(topic);
      }

      // Select just created node ...
      const designer = commandContext._designer;
      designer.onObjectFocusEvent(topic);
      topic.setOnFocus(true);

      // Render node ...
      topic.setVisibility(true);
    });
  }

  /**
       * Overrides abstract parent method
       * @see {@link mindplot.Command.undoExecute}
       */
  undoExecute(commandContext) {
    // Delete disconnected the nodes. Create a copy of the topics ...
    const clonedModel = [];
    this._models.forEach((model) => {
      clonedModel.push({ ...model });
    });

    // Finally, remove the nodes ...
    this._models.forEach((model) => {
      const topicId = model.getId();
      const topic = commandContext.findTopics(topicId)[0];
      commandContext.deleteTopic(topic);
    });

    this._models = clonedModel;
  }
}

export default AddTopicCommand;
