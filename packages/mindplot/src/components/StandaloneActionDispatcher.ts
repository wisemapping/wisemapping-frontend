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
import { $assert } from './util/assert';
import type { ActionDispatcherCommands } from './ActionDispatcher';
import ActionDispatcher from './ActionDispatcher';
import DesignerActionRunner from './DesignerActionRunner';
import AddTopicCommand from './commands/AddTopicCommand';
import AddRelationshipCommand from './commands/AddRelationshipCommand';
import AddFeatureToTopicCommand from './commands/AddFeatureToTopicCommand';
import DeleteCommand from './commands/DeleteCommand';
import RemoveFeatureFromTopicCommand from './commands/RemoveFeatureFromTopicCommand';
import DragTopicCommand from './commands/DragTopicCommand';
import GenericFunctionCommand from './commands/GenericFunctionCommand';
import GenericRelationshipFunctionCommand from './commands/GenericRelationshipFunctionCommand';
import MoveControlPointCommand from './commands/MoveControlPointCommand';
import ChangeFeatureToTopicCommand from './commands/ChangeFeatureToTopicCommand';
import ChangeCanvasStyleCommand from './commands/ChangeCanvasStyleCommand';
import ChangeThemeCommand from './commands/ChangeThemeCommand';
import ChangeLayoutCommand from './commands/ChangeLayoutCommand';
import type { CanvasStyleType } from './model/CanvasStyleType';
import type CommandContext from './CommandContext';
import type { FeatureAttributes } from './model/FeatureModel';
import type NodeModel from './model/NodeModel';
import type { StrokeStyle } from './model/RelationshipModel';
import type RelationshipModel from './model/RelationshipModel';
import type Topic from './Topic';
import Relationship from './Relationship';
import type Command from './Command';
import type FeatureType from './model/FeatureType';
import type PositionType from './PositionType';
import type { PivotType } from './RelationshipControlPoints';
import type { TopicShapeType } from './model/INodeModel';
import type { LineType } from './ConnectionLine';
import type ThemeType from './model/ThemeType';
import type { LayoutType } from './layout/LayoutType';
import type { FontStyleType } from './FontStyleType';
import type { FontWeightType } from './FontWeightType';

// The value of a toggle command when it runs: toggle what the topic shows. Undo passes the
// model value to set back instead.
const TOGGLE = Symbol('toggle');

class StandaloneActionDispatcher extends ActionDispatcher implements ActionDispatcherCommands {
  private _actionRunner: DesignerActionRunner;

  public get actionRunner(): DesignerActionRunner {
    return this._actionRunner;
  }

  public set actionRunner(value: DesignerActionRunner) {
    this._actionRunner = value;
  }

  constructor(commandContext: CommandContext) {
    super(commandContext);
    this._actionRunner = new DesignerActionRunner(commandContext, this);
  }

  addTopics(models: NodeModel[], parentTopicsId: number[] | null): void {
    const command = new AddTopicCommand(models, parentTopicsId);
    this.execute(command);
  }

  addRelationship(model: RelationshipModel) {
    const command = new AddRelationshipCommand(model);
    this.execute(command);
  }

  /** */
  deleteEntities(topicsIds: number[], relIds: number[]) {
    const command = new DeleteCommand(topicsIds, relIds);
    this.execute(command);
  }

  /** */
  dragTopic(
    topicId: number,
    position: PositionType,
    order: number | undefined,
    parentTopic: Topic | null,
  ): void {
    const command = new DragTopicCommand(topicId, position, order, parentTopic);
    this.execute(command);
  }

  /** */
  moveTopic(topicId: number, position: PositionType): void {
    $assert(topicId != null, 'topicsId can not be null');
    $assert(position != null, 'position can not be null');

    const commandFunc = (topic: Topic, pos: PositionType) => {
      const result = topic.getPosition();
      topic.getLayoutEventBus().fireEvent('topicMoved', {
        node: topic.getModel(),
        position: pos,
      });

      // Ensure relationships are redrawn when topic moves
      topic.redraw(topic.getThemeVariant(), false);

      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, [topicId], position);
    this.execute(command);
  }

  /** */
  moveControlPoint(model: RelationshipModel, ctrlPoint: PositionType, index: PivotType): void {
    const command = new MoveControlPointCommand(model, ctrlPoint, index);
    this.execute(command);
  }

  /** */
  changeFontStyleToTopic(topicsIds: number[]) {
    // Toggles from what the topic shows; undo sets back the model value, so a style the theme
    // decided is not pinned on the topic.
    const commandFunc = (topic: Topic, value: FontStyleType | undefined | typeof TOGGLE) => {
      const result = topic.getModel().getFontStyle();
      const style = topic.getFontStyle() === 'italic' ? 'normal' : 'italic';
      topic.setFontStyle(value === TOGGLE ? style : value);
      return result;
    };
    const command = new GenericFunctionCommand<FontStyleType | undefined | typeof TOGGLE>(
      commandFunc,
      topicsIds,
      TOGGLE,
    );
    this.execute(command);
  }

  changeTextToTopic(topicsIds: number[], text: string): void {
    $assert(topicsIds != null, 'topicsIds can not be null');

    const commandFunc = (topic: Topic, value: string | undefined) => {
      // Keep the model value (undefined when empty): getText() returns the theme placeholder.
      const result = topic.getModel().getText();
      topic.setText(value);
      return result;
    };
    commandFunc.commandType = 'changeTextToTopic';

    const command = new GenericFunctionCommand(commandFunc, topicsIds, text);
    this.execute(command);
  }

  changeFontFamilyToTopic(topicIds: number[], fontFamily: string | undefined) {
    $assert(topicIds, 'topicIds can not be null');

    const commandFunc = (topic: Topic, commandFontFamily: string | undefined) => {
      // Keep the model value (undefined when the theme decides) so undo does not pin the theme one.
      const result = topic.getModel().getFontFamily();
      topic.setFontFamily(commandFontFamily);

      topic.redraw(topic.getThemeVariant(), false);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicIds, fontFamily);
    this.execute(command);
  }

  changeFontColorToTopic(topicsIds: number[], color: string | undefined) {
    const commandFunc = (topic: Topic, commandColor: string | undefined) => {
      // Keep the model value (undefined when the theme decides) so undo does not pin the theme color.
      const result = topic.getModel().getFontColor();
      topic.setFontColor(commandColor);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, color);
    command.setDiscardDuplicated('fontColorCommandId');
    this.execute(command);
  }

  changeBackgroundColorToTopic(topicsIds: number[], color: string | undefined) {
    const commandFunc = (topic: Topic, value: string | undefined) => {
      const result = topic.getModel().getBackgroundColor();
      topic.setBackgroundColor(value);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, color);
    command.setDiscardDuplicated('backColor');
    this.execute(command);
  }

  /** */
  changeBorderColorToTopic(topicsIds: number[], color: string | undefined): void {
    const commandFunc = (topic: Topic, commandColor: string | undefined) => {
      const result = topic.getModel().getBorderColor();
      topic.setBorderColor(commandColor);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, color);
    command.setDiscardDuplicated('borderColorCommandId');
    this.execute(command);
  }

  /** */
  changeBorderStyleToTopic(topicsIds: number[], style: string | undefined): void {
    const commandFunc = (topic: Topic, commandStyle: string | undefined) => {
      const result = topic.getBorderStyle();
      topic.setBorderStyle(commandStyle);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, style);
    command.setDiscardDuplicated('borderStyleCommandId');
    this.execute(command);
  }

  /** */
  changeFontSizeToTopic(topicsIds: number[], size: number) {
    $assert(topicsIds, 'topicIds can not be null');
    $assert(size, 'size can not be null');

    const commandFunc = (topic: Topic, commandSize: number | undefined) => {
      const result = topic.getModel().getFontSize();
      topic.setFontSize(commandSize);

      topic.redraw(topic.getThemeVariant(), false);
      return result;
    };

    const command = new GenericFunctionCommand<number | undefined>(commandFunc, topicsIds, size);
    this.execute(command);
  }

  changeImageEmojiCharToTopic(topicsIds: number[], imageEmojiChar: string | undefined) {
    const commandFunc = (topic: Topic, commandImageEmojiChar: string | undefined) => {
      const result = topic.getImageEmojiChar();
      topic.setImageEmojiChar(commandImageEmojiChar);

      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, imageEmojiChar);
    this.execute(command);
  }

  changeImageGalleryIconNameToTopic(topicsIds: number[], imageGalleryIconName: string | undefined) {
    const commandFunc = (topic: Topic, commandImageGalleryIconName: string | undefined) => {
      const result = topic.getImageGalleryIconName();
      topic.setImageGalleryIconName(commandImageGalleryIconName);

      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, imageGalleryIconName);
    this.execute(command);
  }

  changeShapeTypeToTopic(topicsIds: number[], shapeType: TopicShapeType | undefined) {
    const commandFunc = (topic: Topic, commandShapeType: TopicShapeType | undefined) => {
      const result = topic.getModel().getShapeType();
      topic.setShapeType(commandShapeType);

      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, shapeType);
    this.execute(command);
  }

  changeConnectionStyleToTopic(topicsIds: number[], lineType: LineType | undefined) {
    const commandFunc = (topic: Topic, type: LineType | undefined) => {
      const result = topic.getModel().getConnectionStyle();
      topic.setConnectionStyle(type);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, lineType);
    this.execute(command);
  }

  changeConnectionColorToTopic(topicsIds: number[], value: string | undefined) {
    const commandFunc = (topic: Topic, color: string | undefined) => {
      const result = topic.getModel().getConnectionColor();
      topic.setConnectionColor(color);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, value);
    this.execute(command);
  }

  changeRelationshipColor(relationships: Relationship[], value: string | undefined) {
    const commandFunc = (relationship: Relationship, color: string | undefined) => {
      const result: string | undefined = relationship.getModel().getStrokeColor();
      relationship.getModel().setStrokeColor(color);
      if (color) {
        relationship.setStroke(color, 'solid', 1);
      } else {
        // Use default color when color is undefined
        const defaultColor = Relationship.getStrokeColor();
        relationship.setStroke(defaultColor, 'solid', 1);
      }
      return result;
    };

    const command = new GenericRelationshipFunctionCommand(commandFunc, relationships, value);
    this.execute(command);
  }

  changeRelationshipStrokeStyle(relationships: Relationship[], strokeStyle: StrokeStyle) {
    const commandFunc = (relationship: Relationship, style: StrokeStyle) => {
      const result: StrokeStyle = relationship.getModel().getStrokeStyle();
      relationship.getModel().setStrokeStyle(style);
      relationship.redraw();
      return result;
    };
    const command = new GenericRelationshipFunctionCommand(commandFunc, relationships, strokeStyle);
    this.execute(command);
  }

  changeRelationshipEndArrow(relationships: Relationship[], value: boolean) {
    const commandFunc = (relationship: Relationship, endArrow: boolean) => {
      const result: boolean = relationship.getModel().getEndArrow();
      relationship.getModel().setEndArrow(endArrow);
      relationship.setShowEndArrow(endArrow);
      return result;
    };
    const command = new GenericRelationshipFunctionCommand(commandFunc, relationships, value);
    this.execute(command);
  }

  changeRelationshipStartArrow(relationships: Relationship[], value: boolean) {
    const commandFunc = (relationship: Relationship, startArrow: boolean) => {
      const result: boolean = relationship.getModel().getStartArrow();
      relationship.getModel().setStartArrow(startArrow);
      relationship.setShowStartArrow(startArrow);
      return result;
    };
    const command = new GenericRelationshipFunctionCommand(commandFunc, relationships, value);
    this.execute(command);
  }

  changeFontWeightToTopic(topicsIds: number[]) {
    $assert(topicsIds, 'topicsIds can not be null');

    // Toggles from what the topic shows, between normal and bold; undo sets back the model value.
    const commandFunc = (topic: Topic, value: FontWeightType | undefined | typeof TOGGLE) => {
      const result = topic.getModel().getFontWeight();
      const weight = topic.getFontWeight() === 'bold' ? 'normal' : 'bold';
      topic.setFontWeight(value === TOGGLE ? weight : value);
      topic.redraw(topic.getThemeVariant(), false);
      return result;
    };

    const command = new GenericFunctionCommand<FontWeightType | undefined | typeof TOGGLE>(
      commandFunc,
      topicsIds,
      TOGGLE,
    );
    this.execute(command);
  }

  changeTheme(themeType: ThemeType): void {
    const command = new ChangeThemeCommand(themeType);
    this.execute(command);
  }

  changeLayout(layoutType: LayoutType): void {
    const command = new ChangeLayoutCommand(layoutType);
    this.execute(command);
  }

  /** */
  shrinkBranch(topicsIds: number[], collapse: boolean) {
    $assert(topicsIds, 'topicsIds can not be null');

    const commandFunc = (topic: Topic, isShrink: boolean) => {
      // Collapse/expand all also hits branches already in that state: undo must leave them as they were.
      const result = topic.getModel().areChildrenShrunken();
      topic.setChildrenShrunken(isShrink);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, collapse);
    this.execute(command);
  }

  addFeatureToTopic(topicId: number[], featureType: FeatureType, attributes: FeatureAttributes) {
    const command = new AddFeatureToTopicCommand(topicId, featureType, attributes);
    this.execute(command);
  }

  /** */
  changeFeatureToTopic(topicId: number, featureId: number, attributes: FeatureAttributes) {
    const command = new ChangeFeatureToTopicCommand(topicId, featureId, attributes);
    this.execute(command);
  }

  /** */
  removeFeatureFromTopic(topicId: number, featureId: number) {
    const command = new RemoveFeatureFromTopicCommand(topicId, featureId);
    this.execute(command);
  }

  changeCanvasStyle(style: CanvasStyleType | undefined): void {
    const command = new ChangeCanvasStyleCommand(style);
    this.execute(command);
  }

  /** */
  execute(command: Command) {
    this._actionRunner.execute(command);
  }
}

export default StandaloneActionDispatcher;
