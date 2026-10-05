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

import Command from '../../../src/components/Command';
import CommandContext from '../../../src/components/CommandContext';
import DesignerUndoManager from '../../../src/components/DesignerUndoManager';

/** Records the order in which it is executed and undone. */
class RecordingCommand extends Command {
  constructor(
    readonly name: string,
    private readonly log: string[],
    private readonly merges = false,
  ) {
    super();
  }

  execute(): void {
    this.log.push(`do ${this.name}`);
  }

  undoExecute(): void {
    this.log.push(`undo ${this.name}`);
  }

  mergeWith(): boolean {
    return this.merges;
  }
}

const context = {} as CommandContext;

describe('DesignerUndoManager', () => {
  it('undoes and redoes in LIFO order, and reports the queue sizes', () => {
    const log: string[] = [];
    const manager = new DesignerUndoManager();
    expect(manager.canUndo()).toBe(false);
    expect(manager.canRedo()).toBe(false);

    manager.enqueue(new RecordingCommand('a', log));
    manager.enqueue(new RecordingCommand('b', log));
    expect(manager.buildEvent()).toEqual({ undoSteps: 2, redoSteps: 0 });

    manager.execUndo(context);
    manager.execUndo(context);
    expect(log).toEqual(['undo b', 'undo a']);
    expect(manager.buildEvent()).toEqual({ undoSteps: 0, redoSteps: 2 });
    expect(manager.canUndo()).toBe(false);

    manager.execRedo(context);
    expect(log).toEqual(['undo b', 'undo a', 'do a']);
    expect(manager.buildEvent()).toEqual({ undoSteps: 1, redoSteps: 1 });
  });

  it('ignores an undo or a redo with nothing queued', () => {
    const manager = new DesignerUndoManager();
    manager.execUndo(context);
    manager.execRedo(context);
    expect(manager.buildEvent()).toEqual({ undoSteps: 0, redoSteps: 0 });
  });

  it('drops the redo queue when a new command is enqueued', () => {
    const log: string[] = [];
    const manager = new DesignerUndoManager();
    manager.enqueue(new RecordingCommand('a', log));
    manager.execUndo(context);
    expect(manager.canRedo()).toBe(true);

    manager.enqueue(new RecordingCommand('b', log));
    expect(manager.canRedo()).toBe(false);
    expect(manager.buildEvent()).toEqual({ undoSteps: 1, redoSteps: 0 });
  });

  it('merges a duplicated command into the previous one only when it accepts the merge', () => {
    const log: string[] = [];
    const manager = new DesignerUndoManager();
    const first = new RecordingCommand('first', log);
    first.setDiscardDuplicated('color');
    const refused = new RecordingCommand('refused', log, false);
    refused.setDiscardDuplicated('color');
    const merged = new RecordingCommand('merged', log, true);
    merged.setDiscardDuplicated('color');
    const otherKind = new RecordingCommand('other', log, true);
    otherKind.setDiscardDuplicated('style');

    manager.enqueue(first);
    manager.enqueue(refused);
    expect(manager.buildEvent().undoSteps).toBe(2);

    manager.enqueue(merged);
    expect(manager.buildEvent().undoSteps).toBe(2);

    // A different discard key never merges, even when the command would accept it.
    manager.enqueue(otherKind);
    expect(manager.buildEvent().undoSteps).toBe(3);

    manager.execUndo(context);
    manager.execUndo(context);
    manager.execUndo(context);
    expect(log).toEqual(['undo other', 'undo merged', 'undo first']);
  });

  it('does not merge a duplicated command after a plain one', () => {
    const log: string[] = [];
    const manager = new DesignerUndoManager();
    manager.enqueue(new RecordingCommand('plain', log, true));
    const color = new RecordingCommand('color', log, true);
    color.setDiscardDuplicated('color');
    manager.enqueue(color);
    expect(manager.buildEvent().undoSteps).toBe(2);
  });

  describe('change tracking', () => {
    it('reports no change on a new manager, and a change once a command is enqueued', () => {
      const manager = new DesignerUndoManager();
      expect(manager.hasBeenChanged()).toBe(false);

      manager.enqueue(new RecordingCommand('a', []));
      expect(manager.hasBeenChanged()).toBe(true);
    });

    it('reports no change at the marked base, and a change on either side of it', () => {
      const manager = new DesignerUndoManager();
      manager.enqueue(new RecordingCommand('a', []));
      manager.enqueue(new RecordingCommand('b', []));
      manager.markAsChangeBase();
      expect(manager.hasBeenChanged()).toBe(false);

      manager.execUndo(context);
      expect(manager.hasBeenChanged()).toBe(true);
      manager.execRedo(context);
      expect(manager.hasBeenChanged()).toBe(false);

      manager.enqueue(new RecordingCommand('c', []));
      expect(manager.hasBeenChanged()).toBe(true);
    });

    it('treats an empty queue as the base when marked empty', () => {
      const manager = new DesignerUndoManager();
      manager.markAsChangeBase();
      manager.enqueue(new RecordingCommand('a', []));
      expect(manager.hasBeenChanged()).toBe(true);

      manager.execUndo(context);
      expect(manager.hasBeenChanged()).toBe(false);
    });

    it('reports a change after undoing everything past a non-empty base', () => {
      const manager = new DesignerUndoManager();
      manager.enqueue(new RecordingCommand('a', []));
      manager.markAsChangeBase();
      manager.execUndo(context);
      expect(manager.hasBeenChanged()).toBe(true);
    });
  });
});
