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
import CurvedLine from '../../../src/components/CurvedLine';
import Ellipse from '../../../src/components/Ellipse';
import Workspace from '../../../src/components/Workspace';
import Point from '../../../src/components/Point';
import type { StrokeStyle } from '../../../src/components/types';

export type CurvedLineArgs = {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth: number;
  strokeStyle?: StrokeStyle;
  width: number;
};

export type VerticalCurvedLineArgs = CurvedLineArgs & {
  /** Horizontal distance between the ends. */
  dx: number;
};

export type DefaultControlPointsCurvedLineArgs = Omit<CurvedLineArgs, 'fillColor' | 'width'>;

export const createCurvedLine = ({
  fillColor,
  strokeColor,
  strokeWidth,
  strokeStyle,
  width,
}: CurvedLineArgs): HTMLDivElement => {
  const divElem = document.createElement('div');

  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(400, 400);
  workspace.setCoordOrigin(-200, -200);

  // Line 1 ...
  const line1 = new CurvedLine();
  line1.setFrom(0, 0);
  line1.setTo(100, 100);
  line1.setSrcControlPoint(new Point(100 / 2, 0));
  line1.setDestControlPoint(new Point(-100 / 2, 0));
  line1.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  line1.setFill(fillColor, 1);
  line1.setWidth(width);
  workspace.append(line1);

  const line2 = new CurvedLine();
  line2.setFrom(0, 0);
  line2.setTo(-100, -100);
  line2.setSrcControlPoint(new Point(-100 / 2, 0));
  line2.setDestControlPoint(new Point(100 / 2, 0));
  line2.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  line2.setFill(fillColor, 1);
  line2.setWidth(width);
  workspace.append(line2);

  const line3 = new CurvedLine();
  line3.setFrom(0, 0);
  line3.setTo(100, -100);
  line3.setSrcControlPoint(new Point(100 / 2, 0));
  line3.setDestControlPoint(new Point(-100 / 2, 0));
  line3.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  line3.setFill(fillColor, 1);
  line3.setWidth(width);
  workspace.append(line3);

  const line4 = new CurvedLine();
  line4.setFrom(0, 0);
  line4.setTo(-100, 100);
  line4.setSrcControlPoint(new Point(-100 / 2, 0));
  line4.setDestControlPoint(new Point(100 / 2, 0));
  line4.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
  line4.setFill(fillColor, 1);
  line4.setWidth(width);
  workspace.append(line4);

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

// Vertical connections, as in the tree and org layouts: the ends are `dx` apart horizontally and
// 100 apart vertically, with the control points along y. dx = 0 is a straight vertical line.
// W-TAPER (fixed): with width >= 1 the taper is offset along the curve's normal, symmetrically,
// so vertical lines keep their thickness.
export const createVerticalCurvedLine = ({
  fillColor,
  strokeColor,
  strokeWidth,
  strokeStyle,
  width,
  dx,
}: VerticalCurvedLineArgs): HTMLDivElement => {
  const divElem = document.createElement('div');
  const workspace = createCenteredWorkspaceForCurves();

  (
    [
      [0, -150, dx, -50],
      [0, 50, -dx, 150],
      [-100, -100, -100 + dx, 0],
      [100, 0, 100 - dx, 100],
    ] as [number, number, number, number][]
  ).forEach(([x1, y1, x2, y2]) => {
    const line = new CurvedLine();
    line.setFrom(x1, y1);
    line.setTo(x2, y2);
    line.setSrcControlPoint(new Point(0, (y2 - y1) / 2));
    line.setDestControlPoint(new Point(0, -(y2 - y1) / 2));
    line.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
    line.setFill(fillColor, 1);
    line.setWidth(width);
    workspace.append(line);
    addEnd(workspace, x1, y1);
    addEnd(workspace, x2, y2);
  });

  workspace.addItAsChildTo(divElem);
  return divElem;
};

// No control points given: CurvedLinePeer works them out from the ends, a third of the way along
// the chord (W-DEFCP, fixed: vertical and near-vertical lines no longer overshoot their ends).
export const createDefaultControlPointsCurvedLine = ({
  strokeColor,
  strokeWidth,
  strokeStyle,
}: DefaultControlPointsCurvedLineArgs): HTMLDivElement => {
  const divElem = document.createElement('div');
  const workspace = createCenteredWorkspaceForCurves();

  (
    [
      [-150, -150, 150, -100],
      [150, -50, -150, -50],
      [-150, 0, -150, 150],
      [-50, 0, -49.95, 150],
      [50, 150, 50, 0],
      [150, 0, 120, 150],
    ] as [number, number, number, number][]
  ).forEach(([x1, y1, x2, y2]) => {
    const line = new CurvedLine();
    line.setFrom(x1, y1);
    line.setTo(x2, y2);
    line.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
    line.setWidth(0);
    workspace.append(line);
    addEnd(workspace, x1, y1);
    addEnd(workspace, x2, y2);
  });

  workspace.addItAsChildTo(divElem);
  return divElem;
};

function createCenteredWorkspaceForCurves(): Workspace {
  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(400, 400);
  workspace.setCoordOrigin(-200, -200);
  return workspace;
}

function addEnd(workspace: Workspace, x: number, y: number): void {
  const e = new Ellipse();
  e.setSize(6, 6);
  e.setPosition(x, y);
  e.setFill('red');
  workspace.append(e);
}
