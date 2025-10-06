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

export type CanvasStyle = {
  backgroundColor?: string;
  backgroundPattern?: 'solid' | 'grid' | 'dots' | 'none';
  gridSize?: number;
  gridColor?: string;
};

class ChangeCanvasStyleCommand extends Command {
  private _newStyle: CanvasStyle | undefined;

  private _oldStyle: CanvasStyle | null | undefined;

  private _applied: boolean;

  constructor(newStyle: CanvasStyle | undefined) {
    super();
    this._newStyle = newStyle;
    this._oldStyle = undefined;
    this._applied = false;
  }

  execute(commandContext: CommandContext): void {
    if (!this._applied) {
      const { designer } = commandContext;
      const mindmap = designer.getMindmap();

      // Store the old style for undo
      this._oldStyle = mindmap.getCanvasStyle();

      // Apply the new style
      designer.applyCanvasStyle(this._newStyle);

      this._applied = true;
    } else {
      throw new Error('ChangeCanvasStyleCommand can not be applied two times in a row.');
    }
  }

  undoExecute(commandContext: CommandContext): void {
    if (this._applied) {
      const { designer } = commandContext;

      // Restore the old style (can be undefined for theme default)
      designer.applyCanvasStyle(this._oldStyle || undefined);

      this._applied = false;
      this._oldStyle = undefined;
    } else {
      throw new Error('ChangeCanvasStyleCommand undo can not be applied.');
    }
  }
}

export default ChangeCanvasStyleCommand;
