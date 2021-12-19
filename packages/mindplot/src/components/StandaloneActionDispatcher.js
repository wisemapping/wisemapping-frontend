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
import { $defined, $assert } from '@wisemapping/core-js';
import ActionDispatcher from './ActionDispatcher';
import DesignerActionRunner from './DesignerActionRunner';
import AddTopicCommand from './commands/AddTopicCommand';
import AddRelationshipCommand from './commands/AddRelationshipCommand';
import AddFeatureToTopicCommand from './commands/AddFeatureToTopicCommand';
import DeleteCommand from './commands/DeleteCommand';
import RemoveFeatureFromTopicCommand from './commands/RemoveFeatureFromTopicCommand';
import DragTopicCommand from './commands/DragTopicCommand';
import GenericFunctionCommand from './commands/GenericFunctionCommand';
import MoveControlPointCommand from './commands/MoveControlPointCommand';
import ChangeFeatureToTopicCommand from './commands/ChangeFeatureToTopicCommand';
import NodeModel from './model/NodeModel';
import EventBus from './layout/EventBus';

class StandaloneActionDispatcher extends ActionDispatcher {
  constructor(commandContext) {
    super(commandContext);
    this._actionRunner = new DesignerActionRunner(commandContext, this);
  }

  /** */
  addTopics(models, parentTopicsId) {
    const command = new AddTopicCommand(models, parentTopicsId);
    this.execute(command);
  }

  /** */
  addRelationship(model) {
    const command = new AddRelationshipCommand(model);
    this.execute(command);
  }

  /** */
  deleteEntities(topicsIds, relIds) {
    const command = new DeleteCommand(topicsIds, relIds);
    this.execute(command);
  }

  /** */
  dragTopic(topicId, position, order, parentTopic) {
    const command = new DragTopicCommand(topicId, position, order, parentTopic);
    this.execute(command);
  }

  /** */
  moveTopic(topicId, position) {
    $assert($defined(topicId), 'topicsId can not be null');
    $assert($defined(position), 'position can not be null');

    const commandFunc = (topic, value) => {
      const result = topic.getPosition();
      EventBus.instance.fireEvent(EventBus.events.NodeMoveEvent, {
        node: topic.getModel(),
        position: value,
      });
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicId, position);
    this.execute(command);
  }

  /** */
  moveControlPoint(ctrlPoint, point) {
    const command = new MoveControlPointCommand(ctrlPoint, point);
    this.execute(command);
  }

  /** */
  changeFontStyleToTopic(topicsIds) {
    const commandFunc = (topic) => {
      const result = topic.getFontStyle();
      const style = result === 'italic' ? 'normal' : 'italic';
      topic.setFontStyle(style, true);
      return result;
    };
    const command = new GenericFunctionCommand(commandFunc, topicsIds);
    this.execute(command);
  }

  /** */
  changeTextToTopic(topicsIds, text) {
    $assert($defined(topicsIds), 'topicsIds can not be null');

    const commandFunc = (topic, value) => {
      const result = topic.getText();
      topic.setText(value);
      return result;
    };
    commandFunc.commandType = 'changeTextToTopic';

    const command = new GenericFunctionCommand(commandFunc, topicsIds, text);
    this.execute(command);
  }

  /** */
  changeFontFamilyToTopic(topicIds, fontFamily) {
    $assert(topicIds, 'topicIds can not be null');
    $assert(fontFamily, 'fontFamily can not be null');

    const commandFunc = (topic, fontFamily) => {
      const result = topic.getFontFamily();
      topic.setFontFamily(fontFamily, true);

      topic._adjustShapes();
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicIds, fontFamily);
    this.execute(command);
  }

  /** */
  changeFontColorToTopic(topicsIds, color) {
    $assert(topicsIds, 'topicIds can not be null');
    $assert(color, 'color can not be null');

    const commandFunc = (topic, color) => {
      const result = topic.getFontColor();
      topic.setFontColor(color, true);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, color);
    command.discardDuplicated = 'fontColorCommandId';
    this.execute(command);
  }

  /** */
  changeBackgroundColorToTopic(topicsIds, color) {
    $assert(topicsIds, 'topicIds can not be null');
    $assert(color, 'color can not be null');

    const commandFunc = (topic, color) => {
      const result = topic.getBackgroundColor();
      topic.setBackgroundColor(color);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, color);
    command.discardDuplicated = 'backColor';
    this.execute(command);
  }

  /** */
  changeBorderColorToTopic(topicsIds, color) {
    $assert(topicsIds, 'topicIds can not be null');
    $assert(color, 'topicIds can not be null');

    const commandFunc = (topic, color) => {
      const result = topic.getBorderColor();
      topic.setBorderColor(color);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, color);
    command.discardDuplicated = 'borderColorCommandId';
    this.execute(command);
  }

  /** */
  changeFontSizeToTopic(topicsIds, size) {
    $assert(topicsIds, 'topicIds can not be null');
    $assert(size, 'size can not be null');

    const commandFunc = (topic, size) => {
      const result = topic.getFontSize();
      topic.setFontSize(size, true);

      topic._adjustShapes();
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, size);
    this.execute(command);
  }

  /** */
  changeShapeTypeToTopic(topicsIds, shapeType) {
    $assert(topicsIds, 'topicsIds can not be null');
    $assert(shapeType, 'shapeType can not be null');

    const commandFunc = (topic, shapeType) => {
      const result = topic.getShapeType();
      topic.setShapeType(shapeType, true);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, shapeType);
    this.execute(command);
  }

  /** */
  changeFontWeightToTopic(topicsIds) {
    $assert(topicsIds, 'topicsIds can not be null');

    const commandFunc = (topic) => {
      const result = topic.getFontWeight();
      const weight = result === 'bold' ? 'normal' : 'bold';
      topic.setFontWeight(weight, true);

      topic._adjustShapes();
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds);
    this.execute(command);
  }

  /** */
  shrinkBranch(topicsIds, collapse) {
    $assert(topicsIds, 'topicsIds can not be null');

    const commandFunc = (topic, isShrink) => {
      topic.setChildrenShrunken(isShrink);
      return !isShrink;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, collapse);
    this.execute(command, false);
  }

  /** */
  addFeatureToTopic(topicId, featureType, attributes) {
    const command = new AddFeatureToTopicCommand(topicId, featureType, attributes);
    this.execute(command);
  }

  /** */
  changeFeatureToTopic(topicId, featureId, attributes) {
    const command = new ChangeFeatureToTopicCommand(topicId, featureId, attributes);
    this.execute(command);
  }

  /** */
  removeFeatureFromTopic(topicId, featureId) {
    const command = new RemoveFeatureFromTopicCommand(topicId, featureId);
    this.execute(command);
  }

  /** */
  execute(command) {
    this._actionRunner.execute(command);
  }
}

export default StandaloneActionDispatcher;
