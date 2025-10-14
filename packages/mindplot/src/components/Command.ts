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
import { $defined } from './util/assert';
import CommandContext from './CommandContext';

abstract class Command {
  private _id: number;

  static _uuid: number;

  private _discardDuplicated: string | undefined;

  constructor() {
    this._id = Command._nextUUID();
    this._discardDuplicated = undefined;
  }

  abstract execute(commandContext: CommandContext): void;

  abstract undoExecute(commandContext: CommandContext): void;

  getId(): number {
    return this._id;
  }

  static _nextUUID() {
    if (!$defined(this._uuid)) {
      this._uuid = 1;
    }
    this._uuid += 1;
    return this._uuid;
  }

  getDiscardDuplicated(): string | undefined {
    return this._discardDuplicated;
  }

  setDiscardDuplicated(value: string) {
    this._discardDuplicated = value;
  }
}

export default Command;
