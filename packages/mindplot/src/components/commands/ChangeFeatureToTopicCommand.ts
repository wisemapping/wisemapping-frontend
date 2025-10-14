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

class ChangeFeatureToTopicCommand extends Command {
  private _featureId: number;

  private _topicId: number;

  private _attributes;

  constructor(topicId: number, featureId: number, attributes) {
    $assert($defined(topicId), 'topicId can not be null');
    $assert($defined(featureId), 'featureId can not be null');
    $assert($defined(attributes), 'attributes can not be null');

    super();
    this._topicId = topicId;
    this._featureId = featureId;
    this._attributes = attributes;
  }

  execute(commandContext: CommandContext) {
    const topic = commandContext.findTopics([this._topicId])[0];
    const feature = topic.findFeatureById(this._featureId);

    const oldAttributes = feature.getAttributes();
    feature.setAttributes(this._attributes);
    this._attributes = oldAttributes;
  }

  undoExecute(commandContext: CommandContext) {
    this.execute(commandContext);
  }
}

export default ChangeFeatureToTopicCommand;
