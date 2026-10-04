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
import { addReferencePoints, createCenteredWorkspace } from './Reference';

// Eight arrows pointing outwards around the centre, plus the horizontal (y = 0) case on the
// bottom row, which ArrowPeer draws as y = 1.
export const createArrow = ({ strokeColor, strokeWidth, dashed }) => {
  const divElem = document.createElement('div');
  const workspace = createCenteredWorkspace();

  const tips = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const tip = [Math.round(Math.cos(angle) * 120), Math.round(Math.sin(angle) * 120)];
    const arrow = new Arrow();
    arrow.setFrom(tip[0], tip[1]);
    arrow.setControlPoint({
      x: Math.round(Math.cos(angle) * 30),
      y: Math.round(Math.sin(angle) * 30),
    });
    arrow.setStrokeColor(strokeColor);
    arrow.setStrokeWidth(strokeWidth);
    arrow.setDashed(dashed, 3, 3);
    workspace.append(arrow);
    tips.push(tip);
  }

  [-1, 1].forEach((sign) => {
    const arrow = new Arrow();
    arrow.setFrom(sign * 60, 170);
    arrow.setControlPoint({ x: sign * 30, y: 0 });
    arrow.setStrokeColor(strokeColor);
    arrow.setStrokeWidth(strokeWidth);
    workspace.append(arrow);
    tips.push([sign * 60, 170]);
  });

  addReferencePoints(workspace, tips);
  workspace.addItAsChildTo(divElem);
  return divElem;
};
