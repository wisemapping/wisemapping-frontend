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
import Command from '../Command';
import CommandContext from '../CommandContext';
import NodeModel from '../model/NodeModel';

class AddTopicCommand extends Command {
  private _models: NodeModel[];

  private _parentsIds: number[] | null;

  // Parents that were collapsed and this command expanded, to collapse them again on undo.
  private _expandedParentIds: number[];

  /**
   * @classdesc This command class handles do/undo of adding one or multiple topics to
   * the mindmap.
   */
  constructor(models: NodeModel[], parentTopicsId: number[] | null) {
    $assert(
      parentTopicsId == null || parentTopicsId.length === models.length,
      'parents and models must have the same size',
    );

    super();
    this._models = models;
    this._parentsIds = parentTopicsId;
    this._expandedParentIds = [];
  }

  execute(commandContext: CommandContext) {
    // A collapsed parent would hide the new topics: expand it as part of this same undo step ...
    this._expandedParentIds = [];
    if (this._parentsIds) {
      const parentIds = this._parentsIds.filter((id): id is number => $defined(id));
      commandContext.findTopics(Array.from(new Set(parentIds))).forEach((parentTopic) => {
        if (parentTopic.areChildrenShrunken()) {
          parentTopic.setChildrenShrunken(false);
          this._expandedParentIds.push(parentTopic.getId());
        }
      });
    }

    this._models.forEach((model, index) => {
      // Add a new topic ...
      const topic = commandContext.createTopic(model);

      // Connect to topic ...
      if (this._parentsIds) {
        const parentId = this._parentsIds[index];
        if ($defined(parentId)) {
          const parentTopic = commandContext.findTopics([parentId])[0];
          commandContext.connect(topic, parentTopic);
        }
      } else {
        commandContext.addTopic(topic);
      }

      // Select just created node ...
      const { designer } = commandContext;
      designer.onObjectFocusEvent(topic);
      topic.setOnFocus(true);

      // Render node ...
      topic.setVisibility(true);
    });
  }

  undoExecute(commandContext: CommandContext) {
    // Delete disconnected the nodes. Create a copy of the topics ...
    const clonedModel: NodeModel[] = [];
    this._models.forEach((model) => {
      clonedModel.push(model.clone());
    });

    // Finally, remove the nodes ...
    this._models.forEach((model: NodeModel) => {
      const topicId = model.getId();
      const topic = commandContext.findTopics([topicId])[0];
      commandContext.deleteTopic(topic);
    });

    // Collapse back the parents that were collapsed before ...
    commandContext.findTopics(this._expandedParentIds).forEach((parentTopic) => {
      parentTopic.setChildrenShrunken(true);
    });
    this._expandedParentIds = [];

    this._models = clonedModel;
  }
}

export default AddTopicCommand;
