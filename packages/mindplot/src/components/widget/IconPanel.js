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
import ToolbarPaneItem from './ToolbarPaneItem';
import ImageIcon from '../ImageIcon';

class IconPanel extends ToolbarPaneItem {
  _updateSelectedItem() {
    return this.getPanelElem();
  }

  buildPanel() {
    const content = $('<div class="toolbarPanel" id="IconsPanel"></div>').css({ width: 245, height: 230 });
    content.on('click', (event) => {
      event.stopPropagation();
    });

    let count = 0;
    let familyContent;
    for (let i = 0; i < ImageIcon.prototype.ICON_FAMILIES.length; i += 1) {
      const familyIcons = ImageIcon.prototype.ICON_FAMILIES[i].icons;
      for (let j = 0; j < familyIcons.length; j += 1) {
        if ((count % 12) === 0) {
          familyContent = $('<div></div>');
          content.append(familyContent);
        }

        const iconId = familyIcons[j];
        const img = $('<img>')
          .attr('id', iconId)
          .attr('src', ImageIcon._getImageUrl(iconId))
          .attr('class', 'panelIcon');

        familyContent.append(img);

        const panel = this;
        const model = this.getModel();
        img.on('click', ((event) => {
          model.setValue($(event.target).attr('id'));
          panel.hide();
        }));

        count += 1;
      }
    }
    return content;
  }
}

export default IconPanel;
