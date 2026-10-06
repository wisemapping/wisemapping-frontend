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

import getCollapsedAncestorIds from '../../../src/components/util/topicVisibility';
import type Topic from '../../../src/components/Topic';

type TopicStub = Pick<Topic, 'getId' | 'getParent' | 'areChildrenShrunken'>;

const createTopicStub = (
  id: number,
  options: { parent?: TopicStub; shrunken?: boolean } = {},
): TopicStub => ({
  getId: () => id,
  getParent: () => (options.parent ?? null) as Topic | null,
  areChildrenShrunken: () => options.shrunken ?? false,
});

describe('getCollapsedAncestorIds', () => {
  it('returns an empty array when no ancestor is collapsed', () => {
    const grandparent = createTopicStub(1, { shrunken: false });
    const parent = createTopicStub(2, { parent: grandparent, shrunken: false });
    const topic = createTopicStub(3, { parent });

    expect(getCollapsedAncestorIds(topic as Topic)).toEqual([]);
  });

  it('returns the direct parent id when only the parent is collapsed', () => {
    const parent = createTopicStub(2, { shrunken: true });
    const topic = createTopicStub(3, { parent });

    expect(getCollapsedAncestorIds(topic as Topic)).toEqual([2]);
  });

  it('returns a collapsed grandparent even when the direct parent is expanded', () => {
    const grandparent = createTopicStub(1, { shrunken: true });
    const parent = createTopicStub(2, { parent: grandparent, shrunken: false });
    const topic = createTopicStub(3, { parent });

    expect(getCollapsedAncestorIds(topic as Topic)).toEqual([1]);
  });

  it('returns every collapsed ancestor up the chain, nearest first', () => {
    const grandparent = createTopicStub(1, { shrunken: true });
    const parent = createTopicStub(2, { parent: grandparent, shrunken: true });
    const topic = createTopicStub(3, { parent });

    expect(getCollapsedAncestorIds(topic as Topic)).toEqual([2, 1]);
  });

  it('returns an empty array for a root topic with no parent', () => {
    const root = createTopicStub(1);

    expect(getCollapsedAncestorIds(root as Topic)).toEqual([]);
  });
});
