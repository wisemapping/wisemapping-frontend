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

export enum SwitchValueDirection {
  'up',
  'down',
}

export const fontSizes = [6, 8, 10, 15];

/**
 * Given an array and the current value it return the next posible value
 * @param values posible  values
 * @param current the current vaule
 * @returns the next vaule in the array or same if is the last
 */
export function getNextValue(
  values: (string | number)[],
  current: string | number,
): string | number {
  const nextIndex = values.indexOf(current) + 1;
  if (nextIndex === values.length) return current;
  return values[nextIndex];
}

/**
 * Given an array and the current value it return the previous value
 * @param values posible  values
 * @param current the current vaule
 * @returns the previous vaule in the array or same if is the first
 */
export function getPreviousValue(
  values: (string | number)[],
  current: string | number,
): string | number {
  const currentIndex = values.indexOf(current);
  if (currentIndex === 0) return current;
  if (currentIndex === -1) return values[values.length - 1];
  return values[currentIndex - 1];
}
