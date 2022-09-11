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

class FontFamilyPanel extends ListToolbarPanel {
  // eslint-disable-next-line class-methods-use-this
  buildPanel() {
    const content = $("<div class='toolbarPanel' id='fontFamilyPanel'></div>");
    const list = [
      'Arial',
      'Baskerville',
      'Tahoma',
      'Limunari',
      'Brush Script MT',
      'Verdana',
      'Times',
      'Cursive',
      'Fantasy',
      'Perpetua',
      'Brush Script',
      'Copperplate',
    ]
      .sort()
      .map((f) => `<div model="${f}" class="toolbarPanelLink" style="font-family:${f};">${f}</div>`)
      .join('\n');

    content.html(list);
    return content;
  }
}

export default FontFamilyPanel;
