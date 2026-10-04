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

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

import { buildDesigner } from '../commands/designer-harness';
import Topic from '../../../src/components/Topic';
import { LineType } from '../../../src/components/BaseConnectionLine';

/**
 * The map below, as MindManager draws it (mmap2json `test.mmap`):
 *
 *            ┌── B ──┬── D
 *   A ───────┤       ├── E ── G
 *            │       └── F
 *            └── C
 *
 * B and C are on the same side, at the same distance from A and centred on it.
 * D, E and F are centred on B, so E sits at B's height and the B → E connection
 * is a straight line; G sits at E's height. B and C start at the same position,
 * as the MindManager offsets of both are identical: the layout must place them.
 */
const mapWith = (connStyle?: LineType): string => {
  const style = connStyle === undefined ? '' : ` connStyle="${connStyle}"`;
  return [
    '<map name="sibling-centering" version="tango">',
    '  <topic id="0" central="true" text="A">',
    `    <topic id="1" text="B" position="200,0" order="0"${style}>`,
    `      <topic id="3" text="D" position="350,0" order="0"${style}/>`,
    `      <topic id="4" text="E" position="350,0" order="1"${style}>`,
    `        <topic id="6" text="G" position="500,0" order="0"${style}/>`,
    '      </topic>',
    `      <topic id="5" text="F" position="350,0" order="2"${style}/>`,
    '    </topic>',
    `    <topic id="2" text="C" position="200,0" order="2"${style}/>`,
    '  </topic>',
    '</map>',
  ].join('\n');
};

const pos = (topic: Topic) => topic.getPosition();

/** Every point of the SVG line between a topic and its parent. */
const connectionPoints = (topic: Topic): { x: number; y: number }[] => {
  const line = (
    topic as unknown as {
      _outgoingLine: { _line: { peer: { _native: SVGElement } } } | null;
    }
  )._outgoingLine?._line;
  if (!line) {
    throw new Error(`Topic ${topic.getId()} has no connection`);
  }
  const native = line.peer._native;
  const raw =
    native.getAttribute('d') ??
    native.getAttribute('points') ??
    [
      native.getAttribute('x1'),
      native.getAttribute('y1'),
      native.getAttribute('x2'),
      native.getAttribute('y2'),
    ].join(' ');
  const numbers = (raw.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    points.push({ x: numbers[i], y: numbers[i + 1] });
  }
  return points;
};

/**
 * The y of the line's centre at each sampled point. Polylines are their own centre line. The
 * curved styles are drawn as a filled, tapered shape: the first half of the path is one edge
 * and the second half comes back along the other, so the centre is halfway between them.
 */
const centerLineYs = (topic: Topic): number[] => {
  const points = connectionPoints(topic);
  const native = (
    topic as unknown as { _outgoingLine: { _line: { peer: { _native: SVGElement } } } }
  )._outgoingLine._line.peer._native;
  if (native.tagName.toLowerCase() !== 'path') {
    return points.map((point) => point.y);
  }
  const half = points.length / 2;
  const there = points.slice(0, half);
  const back = points.slice(half).reverse();
  return there.map((point, index) => (point.y + back[index].y) / 2);
};

describe('Layout of a map with centred siblings (MindManager mmap2json sample)', () => {
  it('places B and C on the same side, at the same distance in x, B above C', async () => {
    const { topic } = await buildDesigner(mapWith());
    const [a, b, c] = [topic(0), topic(1), topic(2)];

    expect(pos(b).x).toBeGreaterThan(pos(a).x);
    expect(pos(c).x).toBe(pos(b).x);
    expect(pos(b).y).toBeLessThan(pos(a).y);
    expect(pos(c).y).toBeGreaterThan(pos(a).y);
  });

  // Pending a layout decision: today the block of B (with D, E, F) and C is centred on A, so B,
  // which has the taller subtree, ends up closer to A than C (23.5 vs 70.5 here).
  it.failing('places B and C at the same vertical distance from A', async () => {
    const { topic } = await buildDesigner(mapWith());
    const [a, b, c] = [topic(0), topic(1), topic(2)];

    expect(pos(a).y - pos(b).y).toBeCloseTo(pos(c).y - pos(a).y, 5);
  });

  it('centres D, E and F on B, with E at the height of B', async () => {
    const { topic } = await buildDesigner(mapWith());
    const [b, d, e, f] = [topic(1), topic(3), topic(4), topic(5)];

    expect(pos(d).x).toBe(pos(e).x);
    expect(pos(f).x).toBe(pos(e).x);
    expect(pos(e).x).toBeGreaterThan(pos(b).x);
    expect(pos(d).y).toBeLessThan(pos(e).y);
    expect(pos(e).y).toBeLessThan(pos(f).y);
    expect(pos(e).y).toBeCloseTo(pos(b).y, 5);
    expect(pos(b).y - pos(d).y).toBeCloseTo(pos(f).y - pos(b).y, 5);
  });

  it('places G at the height of E, further out', async () => {
    const { topic } = await buildDesigner(mapWith());
    const [e, g] = [topic(4), topic(6)];

    expect(pos(g).x).toBeGreaterThan(pos(e).x);
    expect(pos(g).y).toBeCloseTo(pos(e).y, 5);
  });

  it.each([
    ['POLYLINE_MIDDLE', LineType.POLYLINE_MIDDLE],
    ['POLYLINE_CURVED', LineType.POLYLINE_CURVED],
    ['POLYLINE_STRAIGHT', LineType.POLYLINE_STRAIGHT],
  ])('draws the B → E connection as a straight line with %s', async (_name, lineType) => {
    const { topic } = await buildDesigner(mapWith(lineType));
    const ys = centerLineYs(topic(4));

    expect(ys.length).toBeGreaterThanOrEqual(2);
    ys.forEach((y) => expect(y).toBeCloseTo(ys[0], 5));
  });

  // W-TAPER (WEB2D_REVIEW_PLAN.md): the tapered curve is offset along y only and not
  // symmetrically, so its centre sags below the ends even when both are at the same height.
  // W1-B flips these.
  it.failing.each([
    ['the theme default style', undefined],
    ['THIN_CURVED', LineType.THIN_CURVED],
    ['THICK_CURVED', LineType.THICK_CURVED],
    ['THICK_CURVED_ORGANIC', LineType.THICK_CURVED_ORGANIC],
  ])('draws the B → E connection as a straight line with %s (W-TAPER)', async (_name, lineType) => {
    const { topic } = await buildDesigner(mapWith(lineType));
    const ys = centerLineYs(topic(4));

    expect(ys.length).toBeGreaterThanOrEqual(2);
    ys.forEach((y) => expect(y).toBeCloseTo(ys[0], 1));
  });
});
