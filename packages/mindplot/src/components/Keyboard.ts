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
import $ from 'jquery';
import initHotKeyPluggin from '../../libraries/jquery.hotkeys';

// Provides dispatcher of keyevents by key...
initHotKeyPluggin($);

class Keyboard {
  private _disabled = false;

  addShortcut(shortcuts: string[] | string, callback: () => void) {
    const shortcutsArray = Array.isArray(shortcuts) ? shortcuts : [shortcuts];
    shortcutsArray.forEach((shortcut) => {
      $(document).bind('keydown', shortcut, (e) => {
        if (this.isDisabled()) return;

        e.stopPropagation();
        e.preventDefault();
        callback();
      });
    });
  }

  pause() {
    this._disabled = true;
  }

  resume() {
    this._disabled = false;
  }

  isDisabled() {
    return this._disabled;
  }
}

export default Keyboard;
