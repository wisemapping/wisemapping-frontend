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
import Ellipse from '../../../src/components/Ellipse';
import Workspace from '../../../src/components/Workspace';
import ArcLine from '../../../src/components/ArcLine';

export const createArcLine = ({ strokeColor, strokeWidth, strokeStyle }) => {
  const divElem = document.createElement('div');

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(400, 400);
  workspace.setCoordOrigin(-200, -200);

  // Line 1 ...
  const line1 = new ArcLine();
  line1.setFrom(0, 0);
  line1.setTo(100, 100);
  line1.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  workspace.append(line1);

  const line2 = new ArcLine();
  line2.setFrom(0, 0);
  line2.setTo(-100, -100);
  line2.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  workspace.append(line2);

  const line3 = new ArcLine();
  line3.setFrom(0, 0);
  line3.setTo(100, -100);
  line3.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  workspace.append(line3);

  const line4 = new ArcLine();
  line4.setFrom(0, 0);
  line4.setTo(-100, 100);
  line4.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  workspace.append(line4);

  const line5 = new ArcLine();
  line5.setFrom(0, 0);
  line5.setTo(-100, 0);
  line5.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  workspace.append(line5);

  const line6 = new ArcLine();
  line6.setFrom(0, 0);
  line6.setTo(100, 0);
  line6.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  workspace.append(line6);

  // Add referene point ...
  const e1 = new Ellipse();
  e1.setSize(5, 5);
  e1.setPosition(0, 0);
  e1.setFill('red');
  workspace.append(e1);

  const e2 = new Ellipse();
  e2.setPosition(-100, -100);
  e2.setSize(10, 10);
  workspace.append(e2);

  const e3 = new Ellipse();
  e3.setPosition(100, 100);
  e3.setSize(10, 10);
  workspace.append(e3);

  const e4 = new Ellipse();
  e4.setPosition(-100, 100);
  e4.setSize(10, 10);
  workspace.append(e4);

  const e5 = new Ellipse();
  e5.setPosition(100, -100);
  e5.setSize(10, 10);
  workspace.append(e5);

  workspace.addItAsChildTo(divElem);

  return divElem;
};
