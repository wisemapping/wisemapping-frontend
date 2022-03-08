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
import Command from '../Command';
import CommandContext from '../CommandContext';
import RelationshipModel from '../model/RelationshipModel';

class AddRelationshipCommand extends Command {
  private _model: RelationshipModel;

  /**
     * @classdesc This command class handles do/undo of adding a relationship to a topic.
     */
  constructor(model: RelationshipModel) {
    $assert(model, 'Relationship model can not be null');

    super();
    this._model = model;
  }

  execute(commandContext: CommandContext) {
    const relationship = commandContext.addRelationship(this._model);
    relationship.setOnFocus(true);
  }

  undoExecute(commandContext: CommandContext) {
    const rel = commandContext.findRelationships([this._model.getId()]);
    commandContext.deleteRelationship(rel[0]);
  }
}

export default AddRelationshipCommand;
