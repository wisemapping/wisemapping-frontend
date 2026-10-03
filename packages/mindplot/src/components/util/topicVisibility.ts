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
import type Topic from '../Topic';

/**
 * Walks a topic's ancestor chain and returns the ids of every ancestor
 * whose children are currently shrunken (collapsed), nearest first.
 *
 * Pure and dependency-free (a type-only import of Topic) so it is
 * independently unit-testable without constructing a Designer or Topic --
 * unlike Designer.ts, this file has no transitive import that pulls in
 * DOM/Vite-only code (e.g. WidgetBuilder -> SvgImageIcon's `import.meta.glob`),
 * so it loads cleanly under Jest.
 */
export default function getCollapsedAncestorIds(topic: Topic): number[] {
  const ids: number[] = [];
  let current: Topic | null = topic.getParent();
  while (current) {
    if (current.areChildrenShrunken()) {
      ids.push(current.getId());
    }
    current = current.getParent();
  }
  return ids;
}
