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
import { CurvedLine } from '@wisemapping/web2d';
import { LineType } from '../../../src/components/ConnectionLine';
import TopicConnection from '../../../src/components/TopicConnection';
import { buildDesigner, Harness } from '../commands/designer-harness';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

/**
 * The line from a topic to its parent, for every connection style, on a mind
 * map and on a tree. The children sit well off the line of their parent, so
 * the curves are drawn as curves and not straightened.
 */
const map = (style: LineType, layout: 'mindmap' | 'tree') =>
  `<map name="m" version="tango" layout="${layout}">
    <topic central="true" text="C" id="0" connStyle="${style}">
      <topic id="1" text="A" order="0">
        <topic id="2" text="A1" order="0"/>
        <topic id="3" text="A2" order="1"/>
        <topic id="4" text="A3" order="2"/>
      </topic>
      <topic id="5" text="B" order="1"/>
      <topic id="6" text="D" order="2"/>
    </topic>
  </map>`;

const harnesses: Harness[] = [];
const open = async (style: LineType, layout: 'mindmap' | 'tree') => {
  const harness = await buildDesigner(map(style, layout));
  harnesses.push(harness);
  return harness;
};

afterEach(() => {
  harnesses.splice(0).forEach((harness) => harness.designer.dispose());
});

const connectionOf = (harness: Harness, id: number): TopicConnection =>
  harness.topic(id).getOutgoingLine() as TopicConnection;

const strokeWidth = (connection: TopicConnection): number =>
  Number(
    (
      connection.getLine() as unknown as { peer: { _native: SVGElement } }
    ).peer._native.getAttribute('stroke-width'),
  );

const styles = Object.values(LineType).filter((value) => typeof value === 'number') as LineType[];

describe('TopicConnection line types', () => {
  it.each(styles.flatMap((style) => [[style, 'mindmap'] as const, [style, 'tree'] as const]))(
    'draws style %s on a %s from every topic to its parent',
    async (style, layout) => {
      const harness = await open(style, layout);
      [1, 2, 3, 4, 5, 6].forEach((id) => {
        const connection = connectionOf(harness, id);
        expect(connection.getLineType()).toBe(style);
        expect(connection.getParentTopic()).toBe(harness.topic(id).getParent());
        expect(connection.getChildTopic()).toBe(harness.topic(id));
        expect(connection.getType()).toBe('TopicConnection');
        expect(connection.getStrokeColor()).toBe(
          harness.topic(id).getConnectionColor(harness.topic(id).getThemeVariant()),
        );
      });
    },
  );

  it.each([
    [LineType.HEARTBEAT, 4.5, 3],
    [LineType.NEURON, 4, 3],
  ])('draws style %s thicker from the central topic', async (style, fromCentral, fromOther) => {
    const harness = await open(style, 'mindmap');
    expect(strokeWidth(connectionOf(harness, 1))).toBe(fromCentral);
    expect(strokeWidth(connectionOf(harness, 2))).toBe(fromOther);
  });

  it('curves a tree connection straight down, or as an organic S on the organic style', async () => {
    const plain = await open(LineType.THICK_CURVED, 'tree');
    const [src, dest] = (connectionOf(plain, 2).getLine() as CurvedLine).getControlPoints();
    expect(src.x).toBe(0);
    expect(dest.x).toBe(0);
    expect(src.y).toBe(-dest.y);

    const organic = await open(LineType.THICK_CURVED_ORGANIC, 'tree');
    const points = (connectionOf(organic, 2).getLine() as CurvedLine).getControlPoints();
    expect(points[0].x).not.toBe(0);
    expect(points[1].x).not.toBe(0);
  });

  it('changes the stroke of the line', async () => {
    const harness = await open(LineType.POLYLINE_MIDDLE, 'mindmap');
    const connection = connectionOf(harness, 1);
    connection.setStroke('#ff0000', 'dash', 0.5);
    expect(connection.getStrokeColor()).toBe('#ff0000');
    expect(strokeWidth(connection)).toBe(1);
  });
});
