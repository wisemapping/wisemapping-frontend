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
 * When the layout moves a topic, the relationships attached to it follow (BL5-40, BL5-86):
 * their ends are where a fresh redraw puts them.
 */
import { buildDesigner, Harness } from './commands/designer-harness';
import Relationship from '../../src/components/Relationship';
import Topic from '../../src/components/Topic';
import { stubTextMeasurement } from './topic/RenderFixture';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {},
}));

/**
 * Central (0)
 * ├── A (1)
 * └── B (3)
 *     └── B1 (4)
 * Floating (5). Relationships: B -> Floating, B1 -> Floating, A -> B1 (custom control points).
 */
const MAP = [
  '<map name="follow" version="tango">',
  '  <topic id="0" central="true" text="Central">',
  '    <topic id="1" text="A" position="200,-50" order="0"/>',
  '    <topic id="3" text="B" position="-200,50" order="1">',
  '      <topic id="4" text="B1" position="-350,50" order="0"/>',
  '    </topic>',
  '  </topic>',
  '  <topic id="5" text="Floating" position="400,400"/>',
  '  <relationship id="10" srcTopicId="3" destTopicId="5" lineType="3" endArrow="true"/>',
  '  <relationship id="11" srcTopicId="4" destTopicId="5" lineType="3" endArrow="true"/>',
  '  <relationship id="12" srcTopicId="1" destTopicId="4" lineType="3" endArrow="true" srcCtrlPoint="40,-60" destCtrlPoint="-30,80"/>',
  '</map>',
].join('\n');

/** Where a relationship is drawn: its line, its ends and control points. */
const drawn = (relationship: Relationship) => {
  const line = relationship.getLine();
  const element = line.getNode();
  return {
    from: line.getFrom(),
    to: line.getTo(),
    controlPoints: line.getControlPoints(),
    path: element.getAttribute('d'),
  };
};

const relationships = (harness: Harness): Relationship[] =>
  harness.designer
    .getModel()
    .getRelationships()
    .slice()
    .sort((a, b) => a.getId() - b.getId());

let harness: Harness;

beforeAll(() => {
  stubTextMeasurement();
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(async () => {
  harness = await buildDesigner(MAP);
});

describe('relationships follow the layout', () => {
  it('redraws the relationships of every topic the layout moves', () => {
    const before = new Map<Topic, { x: number; y: number }>(
      harness.designer
        .getModel()
        .getTopics()
        .map((topic) => [topic, { ...topic.getPosition() }]),
    );

    // A longer text widens B: the layout moves B and B1 ...
    harness.topic(3).setText('B, with a much longer text than before');
    harness.designer.getLayoutEventBus().fireEvent('forceLayout');

    const moved = [3, 4].map((id) => harness.topic(id));
    moved.forEach((topic) => expect(topic.getPosition()).not.toEqual(before.get(topic)));

    const live = relationships(harness).map(drawn);
    const fresh = relationships(harness).map((relationship) => {
      relationship.redraw();
      return drawn(relationship);
    });
    expect(live).toEqual(fresh);
  });

  it('does not redraw the relationships of a topic set to the position it has', () => {
    const topic = harness.topic(4);
    const redraws = relationships(harness).map((relationship) =>
      jest.spyOn(relationship, 'redraw'),
    );

    topic.setPosition({ ...topic.getPosition() });

    redraws.forEach((redraw) => expect(redraw).not.toHaveBeenCalled());
  });

  it('redraws only the relationships attached to the moved topic', () => {
    const topic = harness.topic(4);
    const all = relationships(harness);
    const redraws = all.map((relationship) => jest.spyOn(relationship, 'redraw'));

    const position = topic.getPosition();
    topic.setPosition({ x: position.x - 40, y: position.y + 30 });

    const redrawn = all.filter((_relationship, i) => redraws[i]!.mock.calls.length > 0);
    expect(redrawn.map((r) => r.getId())).toEqual(
      all
        .filter((r) => r.getModel().getFromNode() === 4 || r.getModel().getToNode() === 4)
        .map((r) => r.getId()),
    );
    redraws.forEach((redraw) => expect(redraw.mock.calls.length).toBeLessThanOrEqual(1));
  });
});
