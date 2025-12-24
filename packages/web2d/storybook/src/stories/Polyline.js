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
import PolyLine from '../../../src/components/PolyLine';
import Ellipse from '../../../src/components/Ellipse';
import Workspace from '../../../src/components/Workspace';

export const createPolyline = ({
  backgroundColor: fillColor,
  strokeColor,
  strokeWidth,
  strokeStyle,
  style,
}) => {
  const divElem = document.createElement('div');

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(400, 400);
  workspace.setCoordOrigin(-200, -200);

  // Add referene point ...
  const e1 = new Ellipse();
  e1.setSize(10, 10);
  e1.setPosition(0, 0);
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

  // Line 1 ...
  const line1 = new PolyLine();
  line1.setFrom(0, 0);
  line1.setTo(100, 100);
  line1.setStyle(style);
  line1.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  line1.setFill(fillColor, 1);
  workspace.append(line1);

  const line2 = new PolyLine();
  line2.setFrom(0, 0);
  line2.setTo(-100, -100);
  line2.setStyle(style);
  line2.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  line2.setFill(fillColor, 1);
  workspace.append(line2);

  const line3 = new PolyLine();
  line3.setFrom(0, 0);
  line3.setTo(100, -100);
  line3.setStyle(style);
  line3.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  line3.setFill(fillColor, 1);
  workspace.append(line3);

  const line4 = new PolyLine();
  line4.setFrom(0, 0);
  line4.setTo(-100, 100);
  line4.setStyle(style);
  line4.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  line4.setFill(fillColor, 1);
  workspace.append(line4);

  workspace.addItAsChildTo(divElem);

  return divElem;
};
