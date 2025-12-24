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
/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line import/prefer-default-export
import Text from '../../../src/components/Text';
import Workspace from '../../../src/components/Workspace';

export const createText = ({ text, fontFamily, color, weight, style }) => {
  const divElem = document.createElement('div');

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize('400', '400');
  workspace.setCoordOrigin(0, 0);

  [6, 8, 10, 15, 20].forEach((size, i) => {
    const wText = new Text();
    workspace.append(wText);

    wText.setText(text);
    wText.setFont(fontFamily, size, style, weight);
    wText.setPosition(30, 70 * i);
    wText.setColor(color);
  });

  workspace.addItAsChildTo(divElem);
  return divElem;
};
