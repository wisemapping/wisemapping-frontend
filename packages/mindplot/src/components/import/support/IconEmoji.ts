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

/** The value of an own entry of an icon table: a table also inherits constructor, toString... */
export const ownEntry = (
  table: Readonly<Record<string, string>>,
  key: string,
): string | undefined =>
  Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;

/** 1 to 9 as keycap emoji (the digit, the emoji variation selector and U+20E3), 10 as 🔟. */
export const NUMBER_EMOJIS: Readonly<Record<string, string>> = Object.fromEntries(
  Array.from({ length: 10 }, (_, index) => {
    const number = index + 1;
    return [String(number), number === 10 ? '🔟' : `${number}\uFE0F\u20E3`];
  }),
);

/**
 * a to z as the negative squared Latin capital letters, 🅰 (U+1F170) to 🆉. A, B, O and P are
 * emoji written with the emoji variation selector, the others are symbols.
 */
export const LETTER_EMOJIS: Readonly<Record<string, string>> = Object.fromEntries(
  Array.from('abcdefghijklmnopqrstuvwxyz', (letter, index) => [
    letter,
    String.fromCodePoint(0x1f170 + index) + ('abop'.includes(letter) ? '\uFE0F' : ''),
  ]),
);

/** priority-1 to priority-5, from the highest. */
export const PRIORITY_EMOJIS: Readonly<Record<string, string>> = {
  'priority-1': '🔴',
  'priority-2': '🟡',
  'priority-3': '🟢',
  'priority-4': '🔵',
  'priority-5': '🟣',
};
