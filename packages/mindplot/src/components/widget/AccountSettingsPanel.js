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
import ListToolbarPanel from './ListToolbarPanel';

class AccountSettingsPanel extends ListToolbarPanel {
  constructor(elemId) {
    const model = {
      getValue() {
        // Overwite default behaviour ...
      },
      setValue() {
        window.location = '/c/logout';
      },
    };
    super(elemId, model);
  }

  show() {
    if (!this.isVisible()) {
      this.fireEvent('show');
      this._tip.show();
    }
  }

  hide() {
    if (this.isVisible()) {
      this.fireEvent('hide');
      this._tip.hide();
    }
  }

  isTopicAction() {
    return false;
  }

  isRelAction() {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  buildPanel() {
    const content = $("<div class='toolbarPanel' id='accountSettingsPanel'></div>");
    content[0].innerHTML = `
        <p style='text-align:center;font-weight:bold;'>${global.accountName}</p>
        <p>pveiga@wisemapping.com</p>
        <div id="${global.accountMail}" model='logout' style='text-align:center'>
          Logout
        </div>
    `;
    return content;
  }
}

export default AccountSettingsPanel;
