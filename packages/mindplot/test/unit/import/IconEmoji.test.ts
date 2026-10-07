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
  LETTER_EMOJIS,
  NUMBER_EMOJIS,
  ownEntry,
} from '../../../src/components/import/support/IconEmoji';

describe('ownEntry', () => {
  test('finds the own entries only', () => {
    expect(ownEntry({ smile: '😊' }, 'smile')).toBe('😊');
    expect(ownEntry({ smile: '😊' }, 'constructor')).toBeUndefined();
    expect(ownEntry({ smile: '😊' }, 'sad')).toBeUndefined();
  });
});

describe('icon emoji tables', () => {
  test('1 to 9 are keycaps and 10 is 🔟', () => {
    expect(Object.values(NUMBER_EMOJIS).join(' ')).toBe('1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟');
  });

  test('a to z are the squared letters, A, B, O and P with the emoji variation selector', () => {
    expect(Object.values(LETTER_EMOJIS).join('')).toBe('🅰️🅱️🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾️🅿️🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉');
  });
});
