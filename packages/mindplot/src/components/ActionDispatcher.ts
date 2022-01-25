/* eslint-disable  import/no-cycle */
/* eslint-disable  no-use-before-define */
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
import { $assert } from '@wisemapping/core-js';
import Point from '@wisemapping/web2d';
import { Mindmap } from '..';
import CommandContext from './CommandContext';
import Events from './Events';
import NodeModel from './model/NodeModel';
import RelationshipModel from './model/RelationshipModel';
import Topic from './Topic';

abstract class ActionDispatcher extends Events {
  static _instance: ActionDispatcher;

  constructor(commandContext: CommandContext) {
    $assert(commandContext, 'commandContext can not be null');
    super();
  }

  abstract addRelationship(model: RelationshipModel, mindmap: Mindmap);

  abstract addTopics(models: NodeModel[], parentTopicId: any[]);

  abstract deleteEntities(topicsIds: number[], relIds: number[]);

  abstract dragTopic(topicId: number, position: Point, order: number, parentTopic: Topic);

  abstract moveTopic(topicId: number, position: any);

  abstract moveControlPoint(ctrlPoint: this, point: any);

  abstract changeFontFamilyToTopic(topicIds: number[], fontFamily: string);

  abstract changeFontStyleToTopic(topicsIds: number[]);

  abstract changeFontColorToTopic(topicsIds: number[], color: string);

  abstract changeFontSizeToTopic(topicsIds: number[], size: number);

  abstract changeBackgroundColorToTopic(topicsIds: number[], color: string);

  abstract changeBorderColorToTopic(topicsIds: number[], color: string);

  abstract changeShapeTypeToTopic(topicsIds: number[], shapeType: string);

  abstract changeFontWeightToTopic(topicsIds: number[]);

  abstract changeTextToTopic(topicsIds: number[], text: string);

  abstract shrinkBranch(topicsIds: number[], collapse: boolean);

  abstract addFeatureToTopic(topicId: number, type: string, attributes: object);

  abstract changeFeatureToTopic(topicId: number, featureId: any, attributes: object);

  abstract removeFeatureFromTopic(topicId: number, featureId: number);

  static setInstance = (dispatcher: ActionDispatcher) => {
    this._instance = dispatcher;
  };

  static getInstance = (): ActionDispatcher => ActionDispatcher._instance;
}

export default ActionDispatcher;
