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

import PositionType from '../../PositionType';

/**
 * The initial position of the topic at the given index among the main topics on its side, 1 for
 * the right of the central topic and -1 for its left. The layout places the topics by their order:
 * it only takes their side from it.
 */
export const sidePosition = (sideIndex: number, side: number): PositionType => ({
  x: side * (200 + sideIndex * 100),
  y: sideIndex * 75,
});

/** The initial position of a main topic that alternates sides: even orders right, odd left. */
export const alternatingSidePosition = (order: number): PositionType =>
  sidePosition(Math.floor(order / 2), order % 2 === 0 ? 1 : -1);
