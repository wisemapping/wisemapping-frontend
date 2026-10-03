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
import isSelectionEmpty from '../../../src/components/util/selectionState';

describe('isSelectionEmpty', () => {
  it('is true only when both collections are empty', () => {
    expect(isSelectionEmpty(0, 0)).toBe(true);
  });

  it('is false when a topic is selected, regardless of relationships', () => {
    expect(isSelectionEmpty(1, 0)).toBe(false);
    expect(isSelectionEmpty(1, 1)).toBe(false);
  });

  it('is false when a relationship is selected, regardless of topics', () => {
    expect(isSelectionEmpty(0, 1)).toBe(false);
    expect(isSelectionEmpty(0, 3)).toBe(false);
  });

  it('is false for a multi-topic selection', () => {
    // Regression: the old 'ontfocus' predicate was `topics.length === 1`, so
    // extending a selection past one topic stopped reporting a selection.
    expect(isSelectionEmpty(2, 0)).toBe(false);
    expect(isSelectionEmpty(7, 0)).toBe(false);
    expect(isSelectionEmpty(2, 2)).toBe(false);
  });

  it('never reports empty and non-empty for the same selection', () => {
    // 'onblur' fires on isSelectionEmpty, 'onfocus' on its negation, so the
    // two Designer events must be exact complements for every selection size.
    for (let topics = 0; topics <= 4; topics++) {
      for (let rels = 0; rels <= 4; rels++) {
        const empty = isSelectionEmpty(topics, rels);
        expect(empty).toBe(topics + rels === 0);
        expect(!empty).toBe(topics + rels > 0);
      }
    }
  });

  it('would have been wrong under the previous hand-written predicates', () => {
    // Documents exactly what regressed, so a revert cannot pass silently.
    const oldBlur = (t: number, r: number) => t === 0 || r === 0;
    const oldFocus = (t: number, r: number) => t === 1 || r === 1;

    // One topic selected, no relationship: old code fired BOTH onblur and onfocus.
    expect(oldBlur(1, 0)).toBe(true);
    expect(oldFocus(1, 0)).toBe(true);
    expect(isSelectionEmpty(1, 0)).toBe(false);

    // Two topics selected: old code fired onblur and never onfocus.
    expect(oldBlur(2, 0)).toBe(true);
    expect(oldFocus(2, 0)).toBe(false);
    expect(isSelectionEmpty(2, 0)).toBe(false);
  });
});
