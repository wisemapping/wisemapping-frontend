/* eslint-disable class-methods-use-this */
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
import { $assert } from '@wisemapping/core-js';
import Events from './Events';

class ActionDispatcher extends Events {
  constructor(commandContext) {
    $assert(commandContext, 'commandContext can not be null');
    super();
  }

  addRelationship(model, mindmap) {
    throw new Error('method must be implemented.');
  }

  addTopics(models, parentTopicId) {
    throw new Error('method must be implemented.');
  }

  deleteEntities(topicsIds, relIds) {
    throw new Error('method must be implemented.');
  }

  dragTopic(topicId, position, order, parentTopic) {
    throw new Error('method must be implemented.');
  }

  moveTopic(topicId, position) {
    throw new Error('method must be implemented.');
  }

  moveControlPoint(ctrlPoint, point) {
    throw new Error('method must be implemented.');
  }

  changeFontFamilyToTopic(topicIds, fontFamily) {
    throw new Error('method must be implemented.');
  }

  changeFontStyleToTopic(topicsIds) {
    throw new Error('method must be implemented.');
  }

  changeFontColorToTopic(topicsIds, color) {
    throw new Error('method must be implemented.');
  }

  changeFontSizeToTopic(topicsIds, size) {
    throw new Error('method must be implemented.');
  }

  changeBackgroundColorToTopic(topicsIds, color) {
    throw new Error('method must be implemented.');
  }

  changeBorderColorToTopic(topicsIds, color) {
    throw new Error('method must be implemented.');
  }

  changeShapeTypeToTopic(topicsIds, shapeType) {
    throw new Error('method must be implemented.');
  }

  changeFontWeightToTopic(topicsIds) {
    throw new Error('method must be implemented.');
  }

  changeTextToTopic(topicsIds, text) {
    throw new Error('method must be implemented.');
  }

  shrinkBranch(topicsIds, collapse) {
    throw new Error('method must be implemented.');
  }

  addFeatureToTopic(topicId, type, attributes) {
    throw new Error('method must be implemented.');
  }

  changeFeatureToTopic(topicId, featureId, attributes) {
    throw new Error('method must be implemented.');
  }

  removeFeatureFromTopic(topicId, featureId) {
    throw new Error('method must be implemented.');
  }
}

ActionDispatcher.setInstance = (dispatcher) => {
  ActionDispatcher._instance = dispatcher;
};

ActionDispatcher.getInstance = () => ActionDispatcher._instance;

export default ActionDispatcher;
