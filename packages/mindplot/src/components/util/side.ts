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

/**
 * The side of a horizontal map an x coordinate falls on, relative to a reference x
 * (the root, by default at the origin): 1 for the right, -1 for the left.
 *
 * x === reference counts as the right, the side the layout starts placing children
 * on. Never use `Math.sign` for this: it returns 0 there, which reads as neither
 * side and collapses any offset multiplied by it.
 */
export const sideOf = (x: number, reference = 0): 1 | -1 => (x >= reference ? 1 : -1);

export default sideOf;
