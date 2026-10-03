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
import {
  collectSearchableNodes,
  filterSearchableNodes,
} from '../../../src/components/action-widget/pane/find-in-map/findInMapUtils';

/**
 * `plainText` is what the model stores; `renderedText` is what the canvas shows
 * (the theme's default label when the topic was never edited). They differ only
 * for an untouched topic.
 */
const createMockTopic = (
  id: number,
  plainText: string,
  { children = [], renderedText = plainText }: { children?: Topic[]; renderedText?: string } = {},
): Topic =>
  ({
    getId: () => id,
    getText: () => renderedText,
    getModel: () => ({ getPlainText: () => plainText }),
    getChildren: () => children,
  }) as unknown as Topic;

describe('collectSearchableNodes', () => {
  it('includes the root topic itself, not just its children', () => {
    const root = createMockTopic(1, 'Central Topic');
    expect(collectSearchableNodes(root)).toEqual([{ id: 1, text: 'Central Topic' }]);
  });

  it('flattens nested children in depth-first order', () => {
    const grandchild = createMockTopic(3, 'Grandchild');
    const child1 = createMockTopic(2, 'Child One', { children: [grandchild] });
    const child2 = createMockTopic(4, 'Child Two');
    const root = createMockTopic(1, 'Root', { children: [child1, child2] });

    expect(collectSearchableNodes(root)).toEqual([
      { id: 1, text: 'Root' },
      { id: 2, text: 'Child One' },
      { id: 3, text: 'Grandchild' },
      { id: 4, text: 'Child Two' },
    ]);
  });

  it('falls back to the rendered text for a topic that was never edited', () => {
    const untouched = createMockTopic(2, '', { renderedText: 'Main Topic' });
    const root = createMockTopic(1, 'Root', { children: [untouched] });

    expect(collectSearchableNodes(root)).toEqual([
      { id: 1, text: 'Root' },
      { id: 2, text: 'Main Topic' },
    ]);
  });

  it('skips a topic with neither stored nor rendered text, such as one mid-edit', () => {
    const blank = createMockTopic(2, '', { renderedText: '' });
    const root = createMockTopic(1, 'Root', { children: [blank] });

    expect(collectSearchableNodes(root)).toEqual([{ id: 1, text: 'Root' }]);
  });

  it('prefers the stored plain text over the rendered text, as it has markup stripped', () => {
    const edited = createMockTopic(1, 'Edited', { renderedText: 'Main Topic' });
    expect(collectSearchableNodes(edited)).toEqual([{ id: 1, text: 'Edited' }]);
  });
});

describe('filterSearchableNodes', () => {
  const nodes = [
    { id: 1, text: 'AI-driven Development' },
    { id: 2, text: 'Backend services' },
    { id: 3, text: 'Frontend AI Copilot' },
  ];

  it('matches case-insensitively', () => {
    expect(filterSearchableNodes(nodes, 'ai')).toEqual([nodes[0], nodes[2]]);
  });

  it('matches on substrings, not just whole words', () => {
    expect(filterSearchableNodes(nodes, 'end')).toEqual([nodes[1], nodes[2]]);
  });

  it('ignores leading and trailing whitespace in the query', () => {
    expect(filterSearchableNodes(nodes, '  backend  ')).toEqual([nodes[1]]);
  });

  it('returns nothing for a blank query, so the panel starts empty rather than listing everything', () => {
    expect(filterSearchableNodes(nodes, '')).toEqual([]);
    expect(filterSearchableNodes(nodes, '   ')).toEqual([]);
  });

  it('returns nothing when no node matches', () => {
    expect(filterSearchableNodes(nodes, 'zzz-nonexistent')).toEqual([]);
  });
});
