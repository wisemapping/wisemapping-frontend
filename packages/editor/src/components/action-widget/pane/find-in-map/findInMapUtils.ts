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
import { Topic } from '@wisemapping/mindplot';

/** A topic reduced to what "Find in map" needs: its id and its searchable text. */
export interface SearchableNode {
  id: number;
  text: string;
}

/**
 * A topic whose text was never edited stores nothing, yet renders the theme's
 * default label -- "Main Topic" and friends. Search has to match what is on
 * screen, so fall back to the rendered text in that case. The model's plain
 * text is preferred because it has HTML markup stripped.
 *
 * Mirrors DesignerModel.findTopicsByText's own text resolution.
 */
const searchableText = (topic: Topic): string => {
  const plainText = topic.getModel().getPlainText();
  return plainText !== '' ? plainText : topic.getText();
};

/**
 * Flattens the rendered topic tree (starting at, and including, the central
 * topic) into a searchable list, in tree order. Children of a collapsed branch
 * are included -- jumping to one expands its ancestors.
 */
export function collectSearchableNodes(root: Topic): SearchableNode[] {
  const result: SearchableNode[] = [];

  const visit = (topic: Topic): void => {
    const text = searchableText(topic);
    if (text) {
      result.push({ id: topic.getId(), text });
    }
    topic.getChildren().forEach(visit);
  };

  visit(root);
  return result;
}

/**
 * Case-insensitive substring match, in tree order. Matching order (rather than,
 * say, best-match-first) keeps "next/previous" navigation predictable, which is
 * why this walks the tree instead of reusing DesignerModel.findTopicsByText --
 * that method filters the designer's topic list, which is in creation order.
 */
export function filterSearchableNodes(nodes: SearchableNode[], query: string): SearchableNode[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [];
  }
  return nodes.filter((node) => node.text.toLowerCase().includes(trimmed));
}
