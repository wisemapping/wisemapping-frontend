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
 * True when nothing -- no topic and no relationship -- is currently selected.
 *
 * Designer fires 'onblur' when this holds and 'onfocus' when it does not, so
 * the two events stay exact complements. Keeping the predicate in one pure
 * function is what makes that guarantee checkable: the four call sites in
 * Designer.ts previously spelled it out by hand and had drifted into firing
 * 'onblur' whenever *either* collection was empty (almost always, since a
 * topic and a relationship are rarely selected together) while firing
 * 'onfocus' only when exactly one item was selected (so extending a selection
 * to two or more topics never fired it at all).
 */
export default function isSelectionEmpty(topicCount: number, relationshipCount: number): boolean {
  return topicCount === 0 && relationshipCount === 0;
}
