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

/*
 * The touches that start on a topic or a relationship. The canvas pans on every touch, so that a
 * swipe pans the map wherever it starts, but the release of a tap is a click on the background
 * only when the tap was on the background: on a topic or a relationship the mousedown the browser
 * emulates for the tap selects it, and a background click sent first would unselect everything.
 */
const objectTouches = new WeakSet<Event>();

/** Marks a touchstart as one on a topic or a relationship, before it bubbles to the canvas. */
export function markObjectTouch(event: Event): void {
  objectTouches.add(event);
}

/** True if the touchstart started on a topic or a relationship (see markObjectTouch). */
export function isObjectTouch(event: Event): boolean {
  return objectTouches.has(event);
}
