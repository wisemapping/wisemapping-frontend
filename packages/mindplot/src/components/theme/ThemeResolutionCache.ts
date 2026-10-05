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
 * Caches the theme resolutions of a redraw pass.
 *
 * A topic style (shape, fonts, colours) is resolved from the topic model, its ancestors
 * and the theme: each resolution walks up the ancestors, and the border and connection
 * colours ask the parent for its own, which walks up again. Redrawing a map resolved the
 * same values over and over. During a pass (the outermost Topic.redraw call and the
 * redraws it makes), nothing a resolution reads changes: the model is not modified, the
 * topics are not connected or moved in the tree, and their order and theme variant are
 * not changed. So each value is resolved once per pass and topic.
 *
 * Outside a pass, nothing is cached: every call resolves the value as before.
 */
class ThemeResolutionCache {
  private static _depth = 0;

  private static _entries: Map<object, Map<string, unknown>> | null = null;

  /** Runs fn as a redraw pass, or as part of the pass in progress. */
  static run<T>(fn: () => T): T {
    ThemeResolutionCache._depth += 1;
    if (ThemeResolutionCache._depth === 1) {
      ThemeResolutionCache._entries = new Map();
    }
    try {
      return fn();
    } finally {
      ThemeResolutionCache._depth -= 1;
      if (ThemeResolutionCache._depth === 0) {
        ThemeResolutionCache._entries = null;
      }
    }
  }

  /** The value of key for owner, computed once per pass. */
  static memo<T>(owner: object, key: string, compute: () => T): T {
    const entries = ThemeResolutionCache._entries;
    if (!entries) {
      return compute();
    }
    let ownerEntries = entries.get(owner);
    if (!ownerEntries) {
      ownerEntries = new Map();
      entries.set(owner, ownerEntries);
    }
    if (ownerEntries.has(key)) {
      return ownerEntries.get(key) as T;
    }
    const result = compute();
    ownerEntries.set(key, result);
    return result;
  }
}

export default ThemeResolutionCache;
