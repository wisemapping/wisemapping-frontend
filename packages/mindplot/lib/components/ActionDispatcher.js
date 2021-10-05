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
const Events = require('./Events').default;

// noinspection JSUnusedLocalSymbols
const ActionDispatcher = new Class({
  Implements: [Events],
  initialize(commandContext) {
    $assert(commandContext, 'commandContext can not be null');
  },

  addRelationship(model, mindmap) {
    throw 'method must be implemented.';
  },

  addTopics(models, parentTopicId) {
    throw 'method must be implemented.';
  },

  deleteEntities(topicsIds, relIds) {
    throw 'method must be implemented.';
  },

  dragTopic(topicId, position, order, parentTopic) {
    throw 'method must be implemented.';
  },

  moveTopic(topicId, position) {
    throw 'method must be implemented.';
  },

  moveControlPoint(ctrlPoint, point) {
    throw 'method must be implemented.';
  },

  changeFontFamilyToTopic(topicIds, fontFamily) {
    throw 'method must be implemented.';
  },

  changeFontStyleToTopic(topicsIds) {
    throw 'method must be implemented.';
  },

  changeFontColorToTopic(topicsIds, color) {
    throw 'method must be implemented.';
  },

  changeFontSizeToTopic(topicsIds, size) {
    throw 'method must be implemented.';
  },

  changeBackgroundColorToTopic(topicsIds, color) {
    throw 'method must be implemented.';
  },

  changeBorderColorToTopic(topicsIds, color) {
    throw 'method must be implemented.';
  },

  changeShapeTypeToTopic(topicsIds, shapeType) {
    throw 'method must be implemented.';
  },

  changeFontWeightToTopic(topicsIds) {
    throw 'method must be implemented.';
  },

  changeTextToTopic(topicsIds, text) {
    throw 'method must be implemented.';
  },

  shrinkBranch(topicsIds, collapse) {
    throw 'method must be implemented.';
  },

  addFeatureToTopic(topicId, type, attributes) {
    throw 'method must be implemented.';
  },

  changeFeatureToTopic(topicId, featureId, attributes) {
    throw 'method must be implemented.';
  },

  removeFeatureFromTopic(topicId, featureId) {
    throw 'method must be implemented.';
  },
});

ActionDispatcher.setInstance = function (dispatcher) {
  ActionDispatcher._instance = dispatcher;
};

ActionDispatcher.getInstance = function () {
  return ActionDispatcher._instance;
};

export default ActionDispatcher;
