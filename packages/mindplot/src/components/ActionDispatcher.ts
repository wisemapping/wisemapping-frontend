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
import type CommandContext from './CommandContext';
import type { CanvasStyleType } from './model/CanvasStyleType';
import type { PivotType } from './RelationshipControlPoints';
import EventDispispatcher from './EventDispatcher';
import type NodeModel from './model/NodeModel';
import type RelationshipModel from './model/RelationshipModel';
import type { StrokeStyle } from './model/RelationshipModel';
import type Relationship from './Relationship';
import type Topic from './Topic';
import type PositionType from './PositionType';
import type { ModelUpdateEvent } from './DesignerUndoManager';
import type { FeatureAttributes } from './model/FeatureModel';
import type FeatureType from './model/FeatureType';
import type { TopicShapeType } from './model/INodeModel';
import type { LineType } from './ConnectionLine';
import type ThemeType from './model/ThemeType';
import type { LayoutType } from './layout/LayoutType';

/** The events of the ActionDispatcher: 'modelUpdate' after every command, undo or redo. */
type ActionDispatcherEvents = { modelUpdate: ModelUpdateEvent };

/**
 * The commands an ActionDispatcher runs, each one undoable. They are property signatures, not
 * methods, so that strictFunctionTypes checks an implementation against them: a method's
 * parameters are bivariant, which let an implementation take less than its callers pass.
 */
export interface ActionDispatcherCommands {
  addRelationship: (model: RelationshipModel) => void;
  /** @param parentTopicsId the parent of each model, by index; null adds them all unconnected */
  addTopics: (models: NodeModel[], parentTopicsId: number[] | null) => void;
  deleteEntities: (topicsIds: number[], relIds: number[]) => void;
  /** @param parentTopic null disconnects the topic, at the given position */
  dragTopic: (
    topicId: number,
    position: PositionType,
    order: number | undefined,
    parentTopic: Topic | null,
  ) => void;
  moveTopic: (topicId: number, position: PositionType) => void;
  moveControlPoint: (model: RelationshipModel, ctrlPoint: PositionType, index: PivotType) => void;
  changeFontFamilyToTopic: (topicIds: number[], fontFamily: string | undefined) => void;
  changeFontStyleToTopic: (topicsIds: number[]) => void;
  changeFontColorToTopic: (topicsIds: number[], color: string | undefined) => void;
  changeFontSizeToTopic: (topicsIds: number[], size: number) => void;
  changeFontWeightToTopic: (topicsIds: number[]) => void;
  changeTextToTopic: (topicsIds: number[], text: string) => void;
  changeImageEmojiCharToTopic: (topicsIds: number[], imageEmojiChar: string | undefined) => void;
  changeImageGalleryIconNameToTopic: (
    topicsIds: number[],
    imageGalleryIconName: string | undefined,
  ) => void;
  changeBackgroundColorToTopic: (topicsIds: number[], color: string | undefined) => void;
  changeBorderColorToTopic: (topicsIds: number[], color: string | undefined) => void;
  changeBorderStyleToTopic: (topicsIds: number[], style: string | undefined) => void;
  changeShapeTypeToTopic: (topicsIds: number[], shapeType: TopicShapeType | undefined) => void;
  changeConnectionStyleToTopic: (topicsIds: number[], lineType: LineType | undefined) => void;
  changeConnectionColorToTopic: (topicsIds: number[], value: string | undefined) => void;
  changeRelationshipColor: (relationships: Relationship[], value: string | undefined) => void;
  changeRelationshipStrokeStyle: (relationships: Relationship[], strokeStyle: StrokeStyle) => void;
  changeRelationshipEndArrow: (relationships: Relationship[], value: boolean) => void;
  changeRelationshipStartArrow: (relationships: Relationship[], value: boolean) => void;
  changeCanvasStyle: (style: CanvasStyleType | undefined) => void;
  changeTheme: (themeType: ThemeType) => void;
  changeLayout: (layoutType: LayoutType) => void;
  shrinkBranch: (topicsIds: number[], collapse: boolean) => void;
  addFeatureToTopic: (
    topicIds: number[],
    featureType: FeatureType,
    attributes: FeatureAttributes,
  ) => void;
  changeFeatureToTopic: (topicId: number, featureId: number, attributes: FeatureAttributes) => void;
  removeFeatureFromTopic: (topicId: number, featureId: number) => void;
}

/** A dispatcher with its commands: what a designer builds, and what getInstance returns. */
export type CommandDispatcher = ActionDispatcher & ActionDispatcherCommands;

/**
 * The command context and the 'modelUpdate' events of a dispatcher. Its commands are the
 * ActionDispatcherCommands, which an implementation declares with `implements`.
 */
abstract class ActionDispatcher extends EventDispispatcher<ActionDispatcherEvents> {
  private static _instance: CommandDispatcher | undefined;

  private _commandContext: CommandContext;

  constructor(commandContext: CommandContext) {
    $assert(commandContext, 'commandContext can not be null');
    super();
    this._commandContext = commandContext;
  }

  getCommandContext(): CommandContext {
    return this._commandContext;
  }

  static setInstance = (dispatcher: CommandDispatcher) => {
    this._instance = dispatcher;
  };

  /** Drops the instance if it is still the given one: a newer designer may have replaced it. */
  static clearInstance = (dispatcher: CommandDispatcher) => {
    if (this._instance === dispatcher) {
      this._instance = undefined;
    }
  };

  static getInstance = (): CommandDispatcher => {
    if (!ActionDispatcher._instance) {
      throw new Error(
        'There is no ActionDispatcher: no designer has been built, or it was disposed',
      );
    }
    return ActionDispatcher._instance;
  };
}

export default ActionDispatcher;
