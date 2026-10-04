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
import NeuronLine from '../../../src/components/NeuronLine';
import { addReferencePoints, createCenteredWorkspace } from './Reference';

// Lines in every direction, plus short ones (length 1, 5 and 20) and a zero-length one.
// W-STALEPATH: the zero-length line still shows the path drawn after setFrom (to the origin),
// because setTo with equal ends returns early without clearing it.
const LINES = [
  [-180, -150, 180, -150],
  [-150, -120, -150, 180],
  [-100, -100, 150, 150],
  [150, 100, -50, -50],
  [60, 170, 61, 170],
  [100, 170, 103, 174],
  [140, 170, 160, 170],
  [180, 120, 180, 120],
];

export const createNeuronLine = ({ strokeColor, strokeWidth, strokeStyle }) => {
  const divElem = document.createElement('div');
  const workspace = createCenteredWorkspace();

  LINES.forEach(([x1, y1, x2, y2]) => {
    const line = new NeuronLine();
    line.setFrom(x1, y1);
    line.setTo(x2, y2);
    line.setStroke(strokeWidth, strokeStyle, strokeColor, 1);
    workspace.append(line);
  });

  addReferencePoints(
    workspace,
    LINES.flatMap(([x1, y1, x2, y2]) => [
      [x1, y1],
      [x2, y2],
    ]),
    'black',
  );
  workspace.addItAsChildTo(divElem);
  return divElem;
};
