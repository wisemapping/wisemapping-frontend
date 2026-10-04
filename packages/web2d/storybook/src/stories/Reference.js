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

// A 400x400 workspace centred on (0, 0), like the CurvedLine and Polyline stories.
export const createCenteredWorkspace = () => {
  const workspace = new Workspace();
  workspace.setSize('400px', '400px');
  workspace.setCoordSize(400, 400);
  workspace.setCoordOrigin(-200, -200);
  return workspace;
};

// Small reference dots at the given points, so the ends of a line are visible.
export const addReferencePoints = (workspace, points, color = 'red') => {
  points.forEach(([x, y]) => {
    const dot = new Ellipse();
    dot.setSize(6, 6);
    dot.setPosition(x, y);
    dot.setStroke(0, 'solid', color, 1);
    dot.setFill(color);
    workspace.append(dot);
  });
};
