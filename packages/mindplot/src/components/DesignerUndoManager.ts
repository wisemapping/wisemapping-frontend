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
import Command from './Command';
import CommandContext from './CommandContext';

class DesignerUndoManager {
  private _undoQueue: Command[];

  private _redoQueue: Command[];

  private _baseId: number;

  constructor() {
    this._undoQueue = [];
    this._redoQueue = [];
    this._baseId = 0;
  }

  enqueue(command: Command): void {
    $assert(command, 'Command can  not be null');

    const { length } = this._undoQueue;
    if (command.getDiscardDuplicated() && length > 0) {
      // Skip duplicated events only if they are truly identical
      const lastItem = this._undoQueue[length - 1];
      if (lastItem.getDiscardDuplicated() === command.getDiscardDuplicated()) {
        // Replace the last command with the new one instead of discarding
        this._undoQueue[length - 1] = command;
      } else {
        this._undoQueue.push(command);
      }
    } else {
      this._undoQueue.push(command);
    }
    this._redoQueue = [];
  }

  execUndo(commandContext: CommandContext): void {
    if (this._undoQueue.length > 0) {
      const command = this._undoQueue.pop();
      if (command) {
        this._redoQueue.push(command);
        command.undoExecute(commandContext);
      }
    }
  }

  execRedo(commandContext: CommandContext): void {
    if (this._redoQueue.length > 0) {
      const command = this._redoQueue.pop();
      if (command) {
        this._undoQueue.push(command);
        command.execute(commandContext);
      }
    }
  }

  buildEvent() {
    return { undoSteps: this._undoQueue.length, redoSteps: this._redoQueue.length };
  }

  markAsChangeBase(): void {
    const undoLength = this._undoQueue.length;
    if (undoLength > 0) {
      const command = this._undoQueue[undoLength - 1];
      this._baseId = command.getId();
    } else {
      this._baseId = 0;
    }
  }

  hasBeenChanged(): boolean {
    let result = true;
    const undoLength = this._undoQueue.length;
    if (undoLength === 0 && this._baseId === 0) {
      result = false;
    } else if (undoLength > 0) {
      const command = this._undoQueue[undoLength - 1];
      result = this._baseId !== command.getId();
    }
    return result;
  }
}

export default DesignerUndoManager;
