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
import StraightLine from '../../../src/components/StraightLine';
import Workspace from '../../../src/components/Workspace';

export const createStraightLine = ({ strokeColor, strokeWidth, strokeStyle }) => {
  const divElem = document.createElement('div');

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(300, 300);
  workspace.setCoordOrigin(-150, -150);

  const line = new StraightLine();
  line.setFrom(100, 100);
  line.setTo(-100, -100);

  line.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  workspace.append(line);

  workspace.addItAsChildTo(divElem);
  return divElem;
};
