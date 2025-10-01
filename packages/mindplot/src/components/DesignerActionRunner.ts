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
import { $assert } from '@wisemapping/core-js';
import ActionDispatcher from './ActionDispatcher';
import Command from './Command';
import CommandContext from './CommandContext';
import DesignerUndoManager from './DesignerUndoManager';
import LayoutEventBus from './layout/LayoutEventBus';

class DesignerActionRunner {
  private _undoManager: DesignerUndoManager;

  private _context: CommandContext;

  private _actionDisplatcher: ActionDispatcher;

  constructor(commandContext: CommandContext, notifier: ActionDispatcher) {
    $assert(commandContext, 'commandContext can not be null');

    this._undoManager = new DesignerUndoManager();
    this._context = commandContext;
    this._actionDisplatcher = notifier;
  }

  getCommandContext(): CommandContext {
    return this._context;
  }

  execute(command: Command): void {
    $assert(command, 'command can not be null');
    command.execute(this._context);
    this._undoManager.enqueue(command);
    this.fireChangeEvent();
    LayoutEventBus.fireEvent('forceLayout');
  }

  undo(): void {
    this._undoManager.execUndo(this._context);
    this.fireChangeEvent();
    LayoutEventBus.fireEvent('forceLayout');
  }

  redo(): void {
    this._undoManager.execRedo(this._context);
    this.fireChangeEvent();
    LayoutEventBus.fireEvent('forceLayout');
  }

  fireChangeEvent(): void {
    const event = this._undoManager.buildEvent();
    this._actionDisplatcher.fireEvent('modelUpdate', event);
  }
}

export default DesignerActionRunner;
