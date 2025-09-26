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
import Command from '../Command';
import CommandContext from '../CommandContext';
import ThemeType from '../model/ThemeType';

class ChangeThemeCommand extends Command {
  private _newTheme: ThemeType;

  private _oldTheme: ThemeType | null | undefined;

  private _applied: boolean;

  constructor(newTheme: ThemeType) {
    super();
    this._newTheme = newTheme;
    this._oldTheme = undefined;
    this._applied = false;
  }

  execute(commandContext: CommandContext): void {
    if (!this._applied) {
      const { designer } = commandContext;
      const mindmap = designer.getMindmap();

      // Store the old theme for undo
      this._oldTheme = mindmap.getTheme();

      // Apply the new theme
      designer.applyTheme(this._newTheme);

      this._applied = true;
    } else {
      throw new Error('ChangeThemeCommand can not be applied two times in a row.');
    }
  }

  undoExecute(commandContext: CommandContext): void {
    if (this._applied) {
      const { designer } = commandContext;

      // Restore the old theme
      if (this._oldTheme) {
        designer.applyTheme(this._oldTheme);
      }

      this._applied = false;
      this._oldTheme = undefined;
    } else {
      throw new Error('ChangeThemeCommand undo can not be applied.');
    }
  }
}

export default ChangeThemeCommand;
