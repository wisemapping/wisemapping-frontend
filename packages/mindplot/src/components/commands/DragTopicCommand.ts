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
import { $defined } from '@wisemapping/core-js';
import Command from '../Command';
import CommandContext from '../CommandContext';
import PositionType from '../PositionType';
import Topic from '../Topic';

class DragTopicCommand extends Command {
  private _topicsId: number;

  private _parentId: number | null;

  private _position: PositionType;

  private _order: number | undefined;

  constructor(topicId: number, position: PositionType, order: number, parentTopic: Topic) {
    super();
    this._topicsId = topicId;
    this._parentId = parentTopic ? parentTopic.getId() : null;

    this._position = position;
    this._order = order;
  }

  execute(commandContext: CommandContext): void {
    const topic = commandContext.findTopics([this._topicsId])[0];
    topic.setVisibility(false);

    // Save old position ...
    const origParentTopic = topic.getOutgoingConnectedTopic();

    // In this case, topics are positioned using order ...
    const origOrder = topic.getOrder();
    const origPosition = topic.getPosition();

    // Disconnect topic ..
    if (origParentTopic) {
      commandContext.disconnect(topic);
    }

    // Set topic order ...
    if ($defined(this._order)) {
      topic.setOrder(this._order!);
    } else if (this._position != null) {
      commandContext.moveTopic(topic, this._position);
    } else {
      throw new Error('Illegal command state exception.');
    }

    // Finally, connect topic ...
    if (this._parentId != null) {
      const parentTopic = commandContext.findTopics([this._parentId])[0];
      commandContext.connect(topic, parentTopic);
    }

    // Backup old parent id ...
    this._parentId = null;
    if (origParentTopic != null) {
      this._parentId = origParentTopic.getId();
    }
    topic.setVisibility(true);

    // Store for undo ...
    this._order = origOrder;
    this._position = origPosition;
  }

  undoExecute(commandContext: CommandContext): void {
    this.execute(commandContext);
  }
}

export default DragTopicCommand;
