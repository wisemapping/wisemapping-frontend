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
import TopicIdSequence from '../../../src/components/import/support/TopicIdSequence';

describe('TopicIdSequence', () => {
  test('hands out 1, 2, 3... and peek does not take an id', () => {
    const ids = new TopicIdSequence();

    expect(ids.peek()).toBe(1);
    expect([ids.next(), ids.next(), ids.peek(), ids.next()]).toEqual([1, 2, 3, 3]);
  });

  test('reset starts again from 1', () => {
    const ids = new TopicIdSequence();
    ids.next();
    ids.next();

    ids.reset();

    expect(ids.next()).toBe(1);
  });
});
