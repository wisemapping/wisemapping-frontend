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
import { $assert } from '../util/assert';
import Command from '../Command';
import type CommandContext from '../CommandContext';
import type { FeatureAttributes } from '../model/FeatureModel';

class ChangeFeatureToTopicCommand extends Command {
  private _featureId: number;

  private _topicId: number;

  // The attributes to apply. Undefined values (from an undo snapshot) remove the attribute.
  private _attributes: Record<string, string | undefined>;

  constructor(topicId: number, featureId: number, attributes: FeatureAttributes) {
    $assert(topicId != null, 'topicId can not be null');
    $assert(featureId != null, 'featureId can not be null');
    $assert(attributes != null, 'attributes can not be null');

    super();
    this._topicId = topicId;
    this._featureId = featureId;
    this._attributes = attributes;
  }

  execute(commandContext: CommandContext) {
    const topic = commandContext.findTopic(this._topicId);
    const feature = topic.findFeatureById(this._featureId);

    // Snapshot every attribute the change can touch, including the ones the feature lacks
    // (as undefined), so undo removes what the change added.
    const current = feature.getAttributes();
    const oldAttributes: Record<string, string | undefined> = {};
    new Set([...Object.keys(current), ...Object.keys(this._attributes)]).forEach((key) => {
      oldAttributes[key] = current[key];
    });
    feature.setAttributes(this._attributes);
    this._attributes = oldAttributes;
  }

  undoExecute(commandContext: CommandContext) {
    this.execute(commandContext);
  }
}

export default ChangeFeatureToTopicCommand;
