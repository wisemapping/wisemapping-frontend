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
import Command from '../Command';
import type CommandContext from '../CommandContext';
import type { FeatureAttributes } from '../model/FeatureModel';
import type FeatureModel from '../model/FeatureModel';
import type FeatureType from '../model/FeatureType';

class AddFeatureToTopicCommand extends Command {
  private _topicIds: number[];

  private _featureType: FeatureType;

  private _attributes: FeatureAttributes;

  // One feature per topic, keyed by topic id. Created on the first execute and reused on redo,
  // so later commands that refer to a feature by id keep working.
  private _featureModels: Map<number, FeatureModel>;

  /*
   * @classdesc This command class handles do/undo of adding features to topics, e.g. an
   * icon or a note. For a reference of existing features, refer to {@link mindplot.TopicFeature}
   * @constructs
   * @param {String} topicId the id of the topic
   * @param {String} featureType the id of the feature type to add, e.g. "icon"
   * @param {Object} attributes the attribute(s) of the respective feature model
   * @extends mindplot.Command
   * @see mindplot.model.FeatureModel and subclasses
   */
  constructor(topicIds: number[], featureType: FeatureType, attributes: FeatureAttributes) {
    super();
    this._topicIds = topicIds;
    this._featureType = featureType;
    this._attributes = attributes;
    this._featureModels = new Map();
  }

  execute(commandContext: CommandContext): void {
    const topics = commandContext.findTopics(this._topicIds);
    topics.forEach((topic) => {
      // Feature must be created only one time.
      let featureModel = this._featureModels.get(topic.getId());
      if (!featureModel) {
        const model = topic.getModel();
        featureModel = model.createFeature(this._featureType, this._attributes);
        this._featureModels.set(topic.getId(), featureModel);
      }
      topic.addFeature(featureModel);
    });
  }

  undoExecute(commandContext: CommandContext) {
    const topics = commandContext.findTopics(this._topicIds);
    topics.forEach((topic) => {
      topic.removeFeature(this._featureModels.get(topic.getId())!);
    });
  }
}

export default AddFeatureToTopicCommand;
