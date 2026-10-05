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
 * Topic.setPosition redraws only the topic's outgoing line, not the lines to its children
 * (BL5-126). A line to a child would be stale if a parent moved and the child did not, but the
 * layout places children relative to their parent, so it moves them too, collapsed ones included,
 * and each child redraws its own line. This pins that every line is up to date after the edits
 * that move or resize a parent.
 */
import { buildDesigner, Harness } from '../commands/designer-harness';
import Topic from '../../../src/components/Topic';
import { TopicShapeType } from '../../../src/components/model/INodeModel';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  // Text as wide as its characters, so that a text change resizes the topic.
  (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = function getBBox(
    this: SVGElement,
  ) {
    if (this.tagName.toLowerCase() !== 'text') {
      return { x: 0, y: 0, width: 60, height: 14 } as DOMRect;
    }
    return { x: 0, y: 0, width: (this.textContent || '').length * 7, height: 12 } as DOMRect;
  };
});

afterAll(() => {
  jest.restoreAllMocks();
});

type Ends = { getFrom: () => object; getTo: () => object };

/** The topics whose line to their parent changes when it is drawn again: stale ones. */
const staleLines = (harness: Harness): number[] =>
  harness.designer
    .getModel()
    .getTopics()
    .filter((topic: Topic) => {
      const connection = topic.getOutgoingLine();
      if (!connection) {
        return false;
      }
      const line = (connection as unknown as { _line: Ends })._line;
      const before = JSON.stringify([line.getFrom(), line.getTo()]);
      connection.redraw();
      return JSON.stringify([line.getFrom(), line.getTo()]) !== before;
    })
    .map((topic) => topic.getId());

describe('connection lines after a parent moves or resizes (BL5-126)', () => {
  it.each(['mindmap', 'tree'] as const)('are all up to date (%s layout)', async (layout) => {
    const harness = await buildDesigner();
    const { designer } = harness;
    const dispatcher = designer.getActionDispatcher();
    designer.applyLayout(layout);
    expect(staleLines(harness)).toEqual([]);

    // A parent (A, 1) and the central topic get wider: their children move.
    dispatcher.changeTextToTopic([1], 'A with a much longer text');
    expect(staleLines(harness)).toEqual([]);

    // A collapsed parent moves; its hidden child moves with it and is shown again.
    dispatcher.shrinkBranch([1], true);
    const hiddenChild = harness.topic(2).getPosition();
    dispatcher.changeTextToTopic([0], 'Central with a much longer text');
    expect(staleLines(harness)).toEqual([]);
    dispatcher.shrinkBranch([1], false);
    expect(staleLines(harness)).toEqual([]);
    if (layout === 'mindmap') {
      expect(harness.topic(2).getPosition()).not.toEqual(hiddenChild);
    }

    // Parents change shape, which moves the point their children connect to.
    (['line', 'none', 'elipse', 'rectangle'] as TopicShapeType[]).forEach((shape) => {
      dispatcher.changeShapeTypeToTopic([0, 1, 3], shape);
      expect(staleLines(harness)).toEqual([]);
    });

    // A parent gets a gallery icon, which makes it taller.
    dispatcher.changeImageGalleryIconNameToTopic([3], 'star');
    expect(staleLines(harness)).toEqual([]);

    // Undoing all of it.
    for (let i = 0; i < 9; i++) {
      designer.undo();
      expect(staleLines(harness)).toEqual([]);
    }
  });

  // The check above can fail: a parent moved alone, which the layout never does, leaves the line
  // to its child stale.
  it('sees a stale line: a parent moved without its children', async () => {
    const harness = await buildDesigner();
    const parent = harness.topic(1);
    const position = parent.getPosition();
    parent.setPosition({ x: position.x + 40, y: position.y + 30 });
    expect(staleLines(harness)).toEqual([2]);
  });
});
