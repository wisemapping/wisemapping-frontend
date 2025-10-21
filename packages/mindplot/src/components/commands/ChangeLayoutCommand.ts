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
import type { LayoutType } from '../layout/LayoutType';

class ChangeLayoutCommand extends Command {
  private _newLayout: LayoutType;

  private _oldLayout: LayoutType | null | undefined;

  private _applied: boolean;

  constructor(newLayout: LayoutType) {
    super();
    this._newLayout = newLayout;
    this._oldLayout = undefined;
    this._applied = false;
  }

  execute(commandContext: CommandContext): void {
    if (!this._applied) {
      const { designer } = commandContext;
      const mindmap = designer.getMindmap();

      // Store the old layout for undo
      this._oldLayout = mindmap.getLayout();

      console.log(
        `[ChangeLayoutCommand] Executing layout change: ${this._oldLayout} -> ${this._newLayout}`,
      );

      // Track tree/org layout selection
      if (this._newLayout === 'tree') {
        console.log('[ChangeLayoutCommand] TREE (org) layout is being applied');
      }

      // Apply the new layout
      designer.applyLayout(this._newLayout);

      this._applied = true;
    } else {
      throw new Error('ChangeLayoutCommand can not be applied two times in a row.');
    }
  }

  undoExecute(commandContext: CommandContext): void {
    if (this._applied) {
      const { designer } = commandContext;

      console.log(
        `[ChangeLayoutCommand] Undoing layout change: ${this._newLayout} -> ${this._oldLayout}`,
      );

      // Restore the old layout
      if (this._oldLayout) {
        designer.applyLayout(this._oldLayout);
      }

      this._applied = false;
      this._oldLayout = undefined;
    } else {
      throw new Error('ChangeLayoutCommand undo can not be applied.');
    }
  }
}

export default ChangeLayoutCommand;
