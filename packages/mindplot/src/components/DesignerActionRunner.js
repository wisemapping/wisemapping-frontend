/*
 *    Copyright [2015] [wisemapping]
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
import DesignerUndoManager from './DesignerUndoManager';
import EventBus from './layout/EventBus';

class DesignerActionRunner {
  constructor(commandContext, notifier) {
    $assert(commandContext, 'commandContext can not be null');

    this._undoManager = new DesignerUndoManager();
    this._context = commandContext;
    this._notifier = notifier;
  }

  execute(command) {
    $assert(command, 'command can not be null');
    command.execute(this._context);
    this._undoManager.enqueue(command);
    this.fireChangeEvent();
    EventBus.instance.fireEvent(EventBus.events.DoLayout);
  }

  undo() {
    this._undoManager.execUndo(this._context);
    this.fireChangeEvent();
    EventBus.instance.fireEvent(EventBus.events.DoLayout);
  }

  redo() {
    this._undoManager.execRedo(this._context);
    this.fireChangeEvent();
    EventBus.instance.fireEvent(EventBus.events.DoLayout);
  }

  fireChangeEvent() {
    const event = this._undoManager.buildEvent();
    this._notifier.fireEvent('modelUpdate', event);
  }
}

export default DesignerActionRunner;
