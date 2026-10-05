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
 * The parents DragConnector offers a dragged topic, on a medium map (bug3.wxml, 279 topics):
 * the same candidates in the same order as the algorithm it replaced, which, on every mousemove,
 * walked the dragged branch for every topic of the map before looking at where they are.
 */
import fs from 'fs';
import path from 'path';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { buildDesigner, Harness } from './commands/designer-harness';
import DragConnector from '../../src/components/DragConnector';
import DragTopic from '../../src/components/DragTopic';
import Topic from '../../src/components/Topic';
import Canvas from '../../src/components/Canvas';
import PositionType from '../../src/components/PositionType';
import SizeType from '../../src/components/SizeType';
import { sideOf } from '../../src/components/util/side';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

const TOLERANCE = DragConnector.MAX_VERTICAL_CONNECTION_TOLERANCE;

/** DragConnector._searchConnectionCandidates as it was, to compare with. */
const reference = (
  allTopics: Topic[],
  draggedNode: Topic,
  sPos: PositionType,
  currentConnection: Topic | null,
): Topic[] => {
  const orientation = draggedNode.getOrientation();
  let topics = allTopics.filter((topic) => {
    let result = draggedNode !== topic;
    result = result && !topic.areChildrenShrunken() && !topic.isCollapsed();
    result = result && !draggedNode.isChildTopic(topic);
    return result;
  });
  if (orientation === 'vertical') {
    topics = topics.filter((topic) => {
      const distance = sPos.y - (topic.getPosition().y - topic.getSize().height / 2);
      return distance > 0 && distance < TOLERANCE;
    });
  } else {
    const side = sideOf(sPos.x);
    topics = topics.filter((topic) => {
      const txborder = topic.getPosition().x + (topic.getSize().width / 2) * side;
      const distance = (sPos.x - txborder) * side;
      return distance > 0 && distance < TOLERANCE;
    });
  }
  const isAligned = (size: SizeType, tPos: PositionType) =>
    orientation === 'vertical'
      ? Math.abs(sPos.x - tPos.x) < size.width / 2
      : Math.abs(sPos.y - tPos.y) < size.height / 2;
  const weight = (topic: Topic) => {
    const tPos = topic.getPosition();
    return (
      (isAligned(topic.getSize(), tPos) ? 0 : 200) +
      Math.abs(tPos.x - sPos.x) +
      Math.abs(tPos.y - sPos.y) +
      (currentConnection === topic ? 0 : 100)
    );
  };
  return topics.sort((a, b) => weight(a) - weight(b));
};

const load = (): Promise<Harness> =>
  buildDesigner(fs.readFileSync(path.resolve(__dirname, './export/input/bug3.wxml'), 'utf8'));

type Searcher = { _searchConnectionCandidates(dragTopic: DragTopic): Topic[] };

const dragTopicFor = (
  dragged: Topic,
  at: () => PositionType,
  connectedTo: () => Topic | null,
): DragTopic =>
  ({
    getPosition: at,
    getDraggedTopic: () => dragged,
    getConnectedToTopic: connectedTo,
  }) as unknown as DragTopic;

/**
 * Mouse positions where a drop is likely: beside every other topic, on both sides, in line with
 * it, a bit above and a bit below, and under it (for the tree).
 */
const positionsAround = (topics: Topic[]): PositionType[] =>
  topics
    .filter((_, index) => index % 6 === 0)
    .flatMap((topic) => {
      const { x, y } = topic.getPosition();
      const { width, height } = topic.getSize();
      return [-1, 1]
        .flatMap((side) =>
          [-12, 0, 12].map((dy) => ({ x: x + side * (width / 2 + 25), y: y + dy })),
        )
        .concat([{ x: x + 7, y: y + height / 2 + 30 }]);
    });

const branchSize = (topic: Topic): number =>
  1 + topic.getChildren().reduce((sum, child) => sum + branchSize(child), 0);

afterEach(() => {
  jest.restoreAllMocks();
});

describe('DragConnector candidates (bug3.wxml)', () => {
  it.each(['mindmap', 'tree'])(
    '%s: the same candidates, in the same order',
    async (layout) => {
      const { designer } = await load();
      if (layout === 'tree') {
        designer.changeLayout('tree');
      }
      const topics = designer.getModel().getTopics();
      const central = designer.getModel().getCentralTopic();
      // A main topic with a big branch, one deep in a branch, and a leaf.
      const main = central.getChildren().reduce((a, b) => (branchSize(a) >= branchSize(b) ? a : b));
      const deep = main.getChildren().find((child) => child.getChildren().length > 0)!;
      const leaf = topics.find((topic) => topic.getChildren().length === 0 && topic !== central)!;
      // Collapse a branch: its topics are no candidates.
      const collapsed = central
        .getChildren()
        .find((t) => t !== main && t.getChildren().length > 0)!;
      collapsed.getModel().setChildrenShrunken(true);

      const connector = new DragConnector(designer.getModel(), {} as Canvas) as unknown as Searcher;
      let compared = 0;
      let nonEmpty = 0;
      [main, deep, leaf].forEach((dragged) => {
        [null, main.getParent()].forEach((connectedTo) => {
          let mouse: PositionType = { x: 0, y: 0 };
          const dragTopic = dragTopicFor(
            dragged,
            () => mouse,
            () => connectedTo,
          );
          positionsAround(topics).forEach((position) => {
            mouse = position;
            const actual = connector._searchConnectionCandidates(dragTopic).map((t) => t.getId());
            const expected = reference(topics, dragged, position, connectedTo).map((t) =>
              t.getId(),
            );
            expect(actual).toEqual(expected);
            compared += 1;
            nonEmpty += expected.length > 0 ? 1 : 0;
          });
        });
      });
      expect(compared).toBeGreaterThan(1000);
      expect(nonEmpty).toBeGreaterThan(compared / 4);
      // The reference walks the dragged branch for every topic: it is the slow part.
    },
    60000,
  );

  it('walks the dragged branch once per drag, and only looks closer at topics in reach', async () => {
    const { designer } = await load();
    const topics = designer.getModel().getTopics();
    const central = designer.getModel().getCentralTopic();
    const main = central.getChildren().reduce((a, b) => (branchSize(a) >= branchSize(b) ? a : b));
    const size = branchSize(main);

    const connector = new DragConnector(designer.getModel(), {} as Canvas) as unknown as Searcher;
    const isChildTopic = jest.spyOn(Topic.prototype, 'isChildTopic');
    const getChildren = jest.spyOn(Topic.prototype, 'getChildren');
    const isCollapsed = jest.spyOn(Topic.prototype, 'isCollapsed');

    // 50 mousemoves of one drag, 40px right of the central topic, in reach of it.
    let mouse: PositionType = { x: 0, y: 0 };
    const dragTopic = dragTopicFor(
      main,
      () => mouse,
      () => null,
    );
    let candidates = 0;
    for (let i = 0; i < 50; i++) {
      mouse = {
        x: central.getPosition().x + central.getSize().width / 2 + 40,
        y: central.getPosition().y - 100 + i * 4,
      };
      candidates += connector._searchConnectionCandidates(dragTopic).length;
    }

    // Before: every move ran isChildTopic on every topic (about 279 * 50 calls, each walking the
    // dragged branch) and isCollapsed on every topic (about 279 * 50).
    expect(isChildTopic).not.toHaveBeenCalled();
    expect(getChildren.mock.calls.length).toBe(size);
    expect(candidates).toBeGreaterThan(0);
    expect(isCollapsed.mock.calls.length).toBeLessThan(50 * 10);
    expect(topics.length).toBeGreaterThan(250);
  });

  it('reads the topics once per drag, then only the ones within reach (BL5-84)', async () => {
    const { designer } = await load();
    const topics = designer.getModel().getTopics();
    const central = designer.getModel().getCentralTopic();
    const main = central.getChildren().reduce((a, b) => (branchSize(a) >= branchSize(b) ? a : b));
    const connector = new DragConnector(designer.getModel(), {} as Canvas) as unknown as Searcher;
    const getPosition = jest.spyOn(Topic.prototype, 'getPosition');
    const isCollapsed = jest.spyOn(Topic.prototype, 'isCollapsed');

    let mouse: PositionType = { x: 0, y: 0 };
    const dragTopic = dragTopicFor(
      main,
      () => mouse,
      () => null,
    );
    const MOVES = 50;
    let candidates = 0;
    for (let i = 0; i < MOVES; i++) {
      mouse = {
        x: central.getPosition().x + central.getSize().width / 2 + 40,
        y: central.getPosition().y - 100 + i * 4,
      };
      candidates += connector._searchConnectionCandidates(dragTopic).length;
    }

    expect(candidates).toBeGreaterThan(0);
    // Before: every move read the position of every topic, about 279 * 50 = 14,000 reads. Now
    // once per topic for the drag, then a few per move for the topics in reach.
    expect(getPosition.mock.calls.length).toBeLessThan(topics.length + MOVES * 20);
    expect(isCollapsed.mock.calls.length).toBeLessThanOrEqual(topics.length);
  });

  it('walks the branch again for a new drag', async () => {
    const { designer } = await load();
    const central = designer.getModel().getCentralTopic();
    const [first, second] = central.getChildren();
    const connector = new DragConnector(designer.getModel(), {} as Canvas) as unknown as Searcher;
    const getChildren = jest.spyOn(Topic.prototype, 'getChildren');

    const at = () => ({ x: 0, y: 0 });
    connector._searchConnectionCandidates(dragTopicFor(first, at, () => null));
    connector._searchConnectionCandidates(dragTopicFor(second, at, () => null));

    expect(getChildren.mock.calls.length).toBe(branchSize(first) + branchSize(second));
  });
});
