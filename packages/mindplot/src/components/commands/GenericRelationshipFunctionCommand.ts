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
import CommandContext from '../CommandContext';
import Relationship from '../Relationship';

class GenericRelationshipFunctionCommand<T> extends Command {
  private _value: T;

  // Ids, not objects: undoing a delete rebuilds relationships as new objects.
  private _relationshipIds: number[];

  private _commandFunc: (relationship: Relationship, value: T) => T;

  private _oldValues: Map<number, T>;

  private _applied: boolean;

  constructor(
    commandFunc: (relationship: Relationship, value: T) => T,
    relationships: Relationship[],
    value: T,
  ) {
    super();
    this._value = value;
    this._relationshipIds = relationships.map((relationship) => relationship.getId());
    this._commandFunc = commandFunc;
    this._oldValues = new Map();
    this._applied = false;
  }

  /**
   * Overrides abstract parent method
   */
  execute(commandContext: CommandContext): void {
    if (!this._applied) {
      const relationships = commandContext.findRelationships(this._relationshipIds);
      relationships.forEach((relationship: Relationship) => {
        const oldValue = this._commandFunc(relationship, this._value);
        this._oldValues.set(relationship.getId(), oldValue);
      });
      this._applied = true;
    } else {
      throw new Error('Command can not be applied two times in a row.');
    }
  }

  undoExecute(commandContext: CommandContext): void {
    if (this._applied) {
      const relationships = commandContext.findRelationships(this._relationshipIds);
      relationships.forEach((relationship: Relationship) => {
        this._commandFunc(relationship, this._oldValues.get(relationship.getId()) as T);
      });

      this._applied = false;
      this._oldValues = new Map();
    } else {
      throw new Error('undo can not be applied.');
    }
  }
}

export default GenericRelationshipFunctionCommand;
