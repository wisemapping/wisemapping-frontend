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
import type Command from './Command';
import type CommandContext from './CommandContext';

/** The 'modelUpdate' payload: how many steps can be undone and redone. */
export type ModelUpdateEvent = { undoSteps: number; redoSteps: number };

class DesignerUndoManager {
  private _undoQueue: Command[];

  private _redoQueue: Command[];

  constructor() {
    this._undoQueue = [];
    this._redoQueue = [];
  }

  enqueue(command: Command): void {
    $assert(command, 'Command can  not be null');

    const { length } = this._undoQueue;
    const lastItem = this._undoQueue[length - 1];
    if (command.getDiscardDuplicated() && lastItem) {
      // Successive changes of the same kind (e.g. picking colors) collapse into one undo step,
      // but only when the new command can take over the previous one (same targets) ...
      if (
        lastItem.getDiscardDuplicated() === command.getDiscardDuplicated() &&
        command.mergeWith(lastItem)
      ) {
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

  canUndo(): boolean {
    return this._undoQueue.length > 0;
  }

  canRedo(): boolean {
    return this._redoQueue.length > 0;
  }

  buildEvent(): ModelUpdateEvent {
    return { undoSteps: this._undoQueue.length, redoSteps: this._redoQueue.length };
  }
}

export default DesignerUndoManager;
