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

const StandaloneActionDispatcher = new Class(
  /** @lends StandaloneActionDispatcher */ {
    Extends: ActionDispatcher,
    /**
         * @extends mindplot.ActionDispatcher
         * @constructs
         * @param {mindplot.CommandContext} commandContext
         */
    initialize(commandContext) {
      this.parent(commandContext);
      this._actionRunner = new DesignerActionRunner(commandContext, this);
    },

    /** */
    addTopics(models, parentTopicsId) {
      const command = new AddTopicCommand(models, parentTopicsId);
      this.execute(command);
    },

    /** */
    addRelationship(model) {
      const command = new AddRelationshipCommand(model);
      this.execute(command);
    },

    /** */
    deleteEntities(topicsIds, relIds) {
      const command = new DeleteCommand(topicsIds, relIds);
      this.execute(command);
    },

    /** */
    dragTopic(topicId, position, order, parentTopic) {
      const command = new DragTopicCommand(topicId, position, order, parentTopic);
      this.execute(command);
    },

    /** */
    moveTopic(topicId, position) {
      $assert($defined(topicId), 'topicsId can not be null');
      $assert($defined(position), 'position can not be null');

      const commandFunc = function (topic, value) {
        const result = topic.getPosition();
        EventBus.instance.fireEvent(EventBus.events.NodeMoveEvent, {
          node: topic.getModel(),
          position: value,
        });
        return result;
      };

      const command = new GenericFunctionCommand(commandFunc, topicId, position);
      this.execute(command);
    },

    /** */
    moveControlPoint(ctrlPoint, point) {
      const command = new MoveControlPointCommand(ctrlPoint, point);
      this.execute(command);
    },

    /** */
    changeFontStyleToTopic(topicsIds) {
      const commandFunc = function (topic) {
        const result = topic.getFontStyle();
        const style = result === 'italic' ? 'normal' : 'italic';
        topic.setFontStyle(style, true);
        return result;
      };
      const command = new GenericFunctionCommand(commandFunc, topicsIds);
      this.execute(command);
    },

    /** */
    changeTextToTopic(topicsIds, text) {
      $assert($defined(topicsIds), 'topicsIds can not be null');

      const commandFunc = function (topic, value) {
        const result = topic.getText();
        topic.setText(value);
        return result;
      };
      commandFunc.commandType = 'changeTextToTopic';

      const command = new GenericFunctionCommand(commandFunc, topicsIds, text);
      this.execute(command);
    },

    /** */
    changeFontFamilyToTopic(topicIds, fontFamily) {
      $assert(topicIds, 'topicIds can not be null');
      $assert(fontFamily, 'fontFamily can not be null');

      const commandFunc = function (topic, fontFamily) {
        const result = topic.getFontFamily();
        topic.setFontFamily(fontFamily, true);

        topic._adjustShapes();
        return result;
      };

      const command = new GenericFunctionCommand(commandFunc, topicIds, fontFamily);
      this.execute(command);
    },

    /** */
    changeFontColorToTopic(topicsIds, color) {
      $assert(topicsIds, 'topicIds can not be null');
      $assert(color, 'color can not be null');

      const commandFunc = function (topic, color) {
        const result = topic.getFontColor();
        topic.setFontColor(color, true);
        return result;
      };

      const command = new GenericFunctionCommand(commandFunc, topicsIds, color);
      command.discardDuplicated = 'fontColorCommandId';
      this.execute(command);
    },

    /** */
    changeBackgroundColorToTopic(topicsIds, color) {
      $assert(topicsIds, 'topicIds can not be null');
      $assert(color, 'color can not be null');

      const commandFunc = function (topic, color) {
        const result = topic.getBackgroundColor();
        topic.setBackgroundColor(color);
        return result;
      };

      const command = new GenericFunctionCommand(commandFunc, topicsIds, color);
      command.discardDuplicated = 'backColor';
      this.execute(command);
    },

    /** */
    changeBorderColorToTopic(topicsIds, color) {
      $assert(topicsIds, 'topicIds can not be null');
      $assert(color, 'topicIds can not be null');

      const commandFunc = function (topic, color) {
        const result = topic.getBorderColor();
        topic.setBorderColor(color);
        return result;
      };

      const command = new GenericFunctionCommand(commandFunc, topicsIds, color);
      command.discardDuplicated = 'borderColorCommandId';
      this.execute(command);
    },

    /** */
    changeFontSizeToTopic(topicsIds, size) {
      $assert(topicsIds, 'topicIds can not be null');
      $assert(size, 'size can not be null');

      const commandFunc = function (topic, size) {
        const result = topic.getFontSize();
        topic.setFontSize(size, true);

        topic._adjustShapes();
        return result;
      };

      const command = new GenericFunctionCommand(commandFunc, topicsIds, size);
      this.execute(command);
    },

    /** */
    changeShapeTypeToTopic(topicsIds, shapeType) {
      $assert(topicsIds, 'topicsIds can not be null');
      $assert(shapeType, 'shapeType can not be null');

      const commandFunc = function (topic, shapeType) {
        const result = topic.getShapeType();
        topic.setShapeType(shapeType, true);
        return result;
      };

      const command = new GenericFunctionCommand(commandFunc, topicsIds, shapeType);
      this.execute(command);
    },

    /** */
    changeFontWeightToTopic(topicsIds) {
      $assert(topicsIds, 'topicsIds can not be null');

      const commandFunc = function (topic) {
        const result = topic.getFontWeight();
        const weight = result === 'bold' ? 'normal' : 'bold';
        topic.setFontWeight(weight, true);

        topic._adjustShapes();
        return result;
      };

      const command = new GenericFunctionCommand(commandFunc, topicsIds);
      this.execute(command);
    },

    /** */
    shrinkBranch(topicsIds, collapse) {
      $assert(topicsIds, 'topicsIds can not be null');

      const commandFunc = function (topic, isShrink) {
        topic.setChildrenShrunken(isShrink);
        return !isShrink;
      };

      const command = new GenericFunctionCommand(commandFunc, topicsIds, collapse);
      this.execute(command, false);
    },

    /** */
    addFeatureToTopic(topicId, featureType, attributes) {
      const command = new AddFeatureToTopicCommand(topicId, featureType, attributes);
      this.execute(command);
    },

    /** */
    changeFeatureToTopic(topicId, featureId, attributes) {
      const command = new ChangeFeatureToTopicCommand(topicId, featureId, attributes);
      this.execute(command);
    },

    /** */
    removeFeatureFromTopic(topicId, featureId) {
      const command = new RemoveFeatureFromTopicCommand(topicId, featureId);
      this.execute(command);
    },

    /** */
    execute(command) {
      this._actionRunner.execute(command);
    },
  },
);

const CommandContext = new Class(
  /** @lends CommandContext */ {
    /**
         * @constructs
         * @param {mindplot.Designer} designer
         */
    initialize(designer) {
      $assert(designer, 'designer can not be null');
      this._designer = designer;
    },

    /** */
    findTopics(topicsIds) {
      $assert($defined(topicsIds), 'topicsIds can not be null');
      if (!(topicsIds instanceof Array)) {
        topicsIds = [topicsIds];
      }

      const designerTopics = this._designer.getModel().getTopics();
      const result = designerTopics.filter((topic) => topicsIds.contains(topic.getId()));

      if (result.length !== topicsIds.length) {
        const ids = designerTopics.map((topic) => topic.getId());
        $assert(
          result.length === topicsIds.length,
          `Could not find topic. Result:${
            result
          }, Filter Criteria:${
            topicsIds
          }, Current Topics: [${
            ids
          }]`,
        );
      }
      return result;
    },

    /** */
    deleteTopic(topic) {
      this._designer.removeTopic(topic);
    },

    /** */
    createTopic(model) {
      $assert(model, 'model can not be null');
      return this._designer.nodeModelToNodeGraph(model);
    },

    /** */
    createModel() {
      const mindmap = this._designer.getMindmap();
      return mindmap.createNode(NodeModel.MAIN_TOPIC_TYPE);
    },

    /** */
    addTopic(topic) {
      const mindmap = this._designer.getMindmap();
      return mindmap.addBranch(topic.getModel());
    },

    /** */
    connect(childTopic, parentTopic) {
      childTopic.connectTo(parentTopic, this._designer._workspace);
    },

    /** */
    disconnect(topic) {
      topic.disconnect(this._designer._workspace);
    },

    /** */
    addRelationship(model) {
      $assert(model, 'model cannot be null');
      return this._designer.addRelationship(model);
    },

    /** */
    deleteRelationship(relationship) {
      this._designer.deleteRelationship(relationship);
    },

    /** */
    findRelationships(relIds) {
      $assert($defined(relIds), 'relId can not be null');
      if (!(relIds instanceof Array)) {
        relIds = [relIds];
      }

      const designerRel = this._designer.getModel().getRelationships();
      return designerRel.filter((rel) => relIds.contains(rel.getId()));
    },

    /** */
    moveTopic(topic, position) {
      $assert(topic, 'topic cannot be null');
      $assert(position, 'position cannot be null');
      EventBus.instance.fireEvent(EventBus.events.NodeMoveEvent, {
        node: topic.getModel(),
        position,
      });
    },
  },
);

export { StandaloneActionDispatcher, CommandContext };
