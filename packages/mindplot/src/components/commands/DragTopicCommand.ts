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
import Point from '@wisemapping/web2d';
import Command from '../Command';
import CommandContext from '../CommandContext';
import Topic from '../Topic';

class DragTopicCommand extends Command {
  private _topicsId: number;

  private _parentId: number;

  private _position: Point;

  private _order: number;

  /**
     * @classdesc This command class handles do/undo of dragging a topic to a new position.
     * @constructs
     */
  constructor(topicId: number, position: Point, order: number, parentTopic: Topic) {
    $assert(topicId, 'topicId must be defined');
    super();

    this._topicsId = topicId;
    if ($defined(parentTopic)) {
      this._parentId = parentTopic.getId();
    }

    this._position = position;
    this._order = order;
  }

  /**
     * Overrides abstract parent method
     */
  execute(commandContext: CommandContext): void {
    const topic = commandContext.findTopics([this._topicsId])[0];
    topic.setVisibility(false);

    // Save old position ...
    const origParentTopic = topic.getOutgoingConnectedTopic();

    // In this case, topics are positioned using order ...
    const origOrder = topic.getOrder();
    const origPosition = topic.getPosition();

    // Disconnect topic ..
    if ($defined(origParentTopic) && origParentTopic.getId() !== this._parentId) {
      commandContext.disconnect(topic);
    }

    // Set topic order ...
    if (this._order != null) {
      topic.setOrder(this._order);
    } else if (this._position != null) {
      commandContext.moveTopic(topic, this._position);
    } else {
      $assert('Illegal command state exception.');
    }

    // Finally, connect topic ...
    if (!$defined(origParentTopic) || origParentTopic.getId() !== this._parentId) {
      if ($defined(this._parentId)) {
        const parentTopic = commandContext.findTopics([this._parentId])[0];
        commandContext.connect(topic, parentTopic);
      }

      // Backup old parent id ...
      this._parentId = null;
      if ($defined(origParentTopic)) {
        this._parentId = origParentTopic.getId();
      }
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
