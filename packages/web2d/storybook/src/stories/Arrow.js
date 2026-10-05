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
import Arrow from '../../../src/components/Arrow';
import StraightLine from '../../../src/components/StraightLine';
import Workspace from '../../../src/components/Workspace';

// Eight arrows around the centre, each at the end of a grey shaft that runs along its control
// point (as mindplot draws relationship ends), plus the horizontal (y = 0) case on the bottom row,
// whose wings are at ±45° too. The workspace is zoomed in 2x so the 6 unit wings are visible.
export const createArrow = ({ strokeColor, strokeWidth, dashed }) => {
  const divElem = document.createElement('div');
  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(200, 200);
  workspace.setCoordOrigin(-100, -100);

  const addArrow = (tip, control, isDashed) => {
    const shaft = new StraightLine();
    shaft.setFrom(tip[0], tip[1]);
    shaft.setTo(tip[0] + control.x, tip[1] + control.y);
    shaft.setStroke(1, 'solid', '#bbbbbb', 1);
    workspace.append(shaft);

    const arrow = new Arrow();
    arrow.setFrom(tip[0], tip[1]);
    arrow.setControlPoint(control);
    arrow.setStrokeColor(strokeColor);
    arrow.setStrokeWidth(strokeWidth);
    arrow.setDashed(isDashed, 3, 3);
    workspace.append(arrow);
  };

  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    addArrow(
      [Math.round(Math.cos(angle) * 25), Math.round(Math.sin(angle) * 25) - 10],
      { x: Math.round(Math.cos(angle) * 40), y: Math.round(Math.sin(angle) * 40) },
      dashed,
    );
  }
  addArrow([-30, 85], { x: -40, y: 0 }, false);
  addArrow([30, 85], { x: 40, y: 0 }, false);

  workspace.addItAsChildTo(divElem);
  return divElem;
};
