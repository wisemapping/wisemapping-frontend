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
import { $assert, $defined } from '@wisemapping/core-js';
import Command from '../Command';
import CommandContext from '../CommandContext';
import Topic from '../Topic';

class GenericFunctionCommand extends Command {
  private _discardDuplicated: string;

  private _value: string | object | boolean | number;

  private _topicsId: number[];

  private _commandFunc: (topic: Topic, value: string | object | boolean | number) => string | object | boolean;

  private _oldValues: any[];

  private _applied: boolean;

  constructor(commandFunc: (topic: Topic, value: string | object | boolean) => string | object | boolean, topicsIds: number[], value: string | object | boolean | number = undefined) {
    $assert(commandFunc, 'commandFunc must be defined');
    $assert($defined(topicsIds), 'topicsIds must be defined');

    super();
    this._value = value;
    this._topicsId = topicsIds;
    this._commandFunc = commandFunc;
    this._oldValues = [];
    this.discardDuplicated = undefined;
  }

  /**
     * Overrides abstract parent method
     */
  execute(commandContext: CommandContext) {
    if (!this._applied) {
      const topics = commandContext.findTopics(this._topicsId);

      if (topics != null) {
        const me = this;
        topics.forEach((topic: Topic) => {
          const oldValue = me._commandFunc(topic, me._value);
          me._oldValues.push(oldValue);
        });
      }
      this._applied = true;
    } else {
      throw new Error('Command can not be applied two times in a row.');
    }
  }

  undoExecute(commandContext: CommandContext): void {
    if (this._applied) {
      const topics = commandContext.findTopics(this._topicsId);

      topics.forEach(((topic: Topic, index: number) => {
        this._commandFunc(topic, this._oldValues[index]);
      }));

      this._applied = false;
      this._oldValues = [];
    } else {
      throw new Error('undo can not be applied.');
    }
  }

  public get disardDuplicated(): string {
    return this._discardDuplicated;
  }

  public set discardDuplicated(value: string) {
    this._discardDuplicated = value;
  }
}

export default GenericFunctionCommand;
