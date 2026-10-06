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
import type Topic from '../Topic';

class GenericFunctionCommand<T> extends Command {
  private _value: T;

  private _topicsIds: number[];

  private _commandFunc: (topic: Topic, value: T) => T;

  // Keyed by topic id: findTopics returns topics in model order, which can change between execute and undo.
  private _oldValues: Map<number, T>;

  private _applied: boolean;

  constructor(commandFunc: (topic: Topic, value: T) => T, topicsIds: number[], value: T) {
    super();
    this._value = value;
    this._topicsIds = topicsIds;
    this._commandFunc = commandFunc;
    this._oldValues = new Map();
    this._applied = false;
  }

  /**
   * Overrides abstract parent method
   */
  execute(commandContext: CommandContext): void {
    if (!this._applied) {
      const topics = commandContext.findTopics(this._topicsIds);

      if (topics != null) {
        topics.forEach((topic: Topic) => {
          const oldValue = this._commandFunc(topic, this._value);
          this._oldValues.set(topic.getId(), oldValue);
        });
      }
      this._applied = true;
    } else {
      throw new Error('Command can not be applied two times in a row.');
    }
  }

  undoExecute(commandContext: CommandContext): void {
    if (this._applied) {
      const topics = commandContext.findTopics(this._topicsIds);

      topics.forEach((topic: Topic) => {
        this._commandFunc(topic, this._oldValues.get(topic.getId()) as T);
      });

      this._applied = false;
      this._oldValues = new Map();
    } else {
      throw new Error('undo can not be applied.');
    }
  }

  override mergeWith(previous: Command): boolean {
    if (!(previous instanceof GenericFunctionCommand) || !this._applied || !previous._applied) {
      return false;
    }

    const sameTargets =
      previous._topicsIds.length === this._topicsIds.length &&
      this._topicsIds.every((id) => previous._topicsIds.includes(id));
    if (!sameTargets) {
      return false;
    }

    // Undo must go back to the values before the first of the merged changes ...
    this._oldValues = new Map(previous._oldValues as Map<number, T>);
    return true;
  }
}

export default GenericFunctionCommand;
