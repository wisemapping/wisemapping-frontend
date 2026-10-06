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

import { describe, expect, test } from '@jest/globals';
import {
  alternatingSidePosition,
  sidePosition,
} from '../../../src/components/import/support/MainTopicPosition';

describe('sidePosition', () => {
  test.each([
    [0, 1, { x: 200, y: 0 }],
    [2, 1, { x: 400, y: 150 }],
    [0, -1, { x: -200, y: 0 }],
    [3, -1, { x: -500, y: 225 }],
  ])('topic %p on side %p', (sideIndex, side, expected) => {
    expect(sidePosition(sideIndex, side)).toEqual(expected);
  });
});

describe('alternatingSidePosition', () => {
  test('even orders go right, odd orders left, a row further every two topics', () => {
    expect([0, 1, 2, 3, 4].map(alternatingSidePosition)).toEqual([
      { x: 200, y: 0 },
      { x: -200, y: 0 },
      { x: 300, y: 75 },
      { x: -300, y: 75 },
      { x: 400, y: 150 },
    ]);
  });
});
