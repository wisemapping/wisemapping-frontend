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

import { buildDesigner } from '../commands/designer-harness';
import Topic from '../../../src/components/Topic';
import { LineType } from '../../../src/components/BaseConnectionLine';
import { STRAIGHT_TOLERANCE_PX } from '../../../src/components/TopicConnection';

jest.mock('../../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class MockPDFExporter {},
}));

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

  // Decided: the whole block (B with its subtree, then C) is centred on A, not B and C
  // themselves. Centring the topics would unbalance maps where one sibling has a much taller
  // subtree, so B, which has one, sits closer to A than C does.
  it('centres the block of B (with its subtree) and C on A, so B sits closer to A', async () => {
    const { topic } = await buildDesigner(mapWith());
    const [a, b, c, d] = [topic(0), topic(1), topic(2), topic(3)];

    expect(pos(a).y - pos(b).y).toBeLessThan(pos(c).y - pos(a).y);
    // D is the top of the block and C its bottom.
    expect((pos(d).y + pos(c).y) / 2).toBeCloseTo(pos(a).y, 5);
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

  // W-TAPER (WEB2D_REVIEW_PLAN.md): the tapered curve used to be offset along y only and not
  // symmetrically, so its centre sagged below the ends even when both were at the same height.
  it.each([
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

  type Point = { x: number; y: number };

  /**
   * The centre line's control polygon (start, two control points, end) of a curved connection.
   * The path is one edge there (M p0 C p1 p2 p3) and the other edge back (C p4 p5 p6 Z), each
   * offset by the same amount to either side of the centre.
   */
  const centreControlPolygon = (topic: Topic): Point[] => {
    const pts = connectionPoints(topic);
    expect(pts).toHaveLength(7);
    const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    return [mid(pts[0], pts[6]), mid(pts[1], pts[5]), mid(pts[2], pts[4]), pts[3]];
  };

  /** Distance from `p` to the line through `a` and `b`. */
  const distanceToChord = (p: Point, a: Point, b: Point): number =>
    Math.abs((p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x)) /
    Math.hypot(b.x - a.x, b.y - a.y);

  /** Moves G (a child of E, at E's height) by dy, which redraws the E → G connection. */
  const connectionWithDy = async (lineType: LineType | undefined, dy: number) => {
    const { topic } = await buildDesigner(mapWith(lineType));
    const [e, g] = [topic(4), topic(6)];
    g.setPosition({ x: pos(g).x, y: pos(e).y + dy });
    return centreControlPolygon(g);
  };

  const CURVED_STYLES: [string, LineType | undefined][] = [
    ['the theme default style', undefined],
    ['THIN_CURVED', LineType.THIN_CURVED],
    ['THICK_CURVED', LineType.THICK_CURVED],
    ['THICK_CURVED_ORGANIC', LineType.THICK_CURVED_ORGANIC],
  ];

  it('uses a straight-line tolerance of 5 px', () => {
    expect(STRAIGHT_TOLERANCE_PX).toBe(5);
  });

  describe.each(CURVED_STYLES)('with %s', (_name, lineType) => {
    it.each([0, 1, -3, 4.5, 5, -5])(
      'draws the connection straight, on the chord, when dy = %d (within the tolerance)',
      async (dy) => {
        const [start, c1, c2, end] = await connectionWithDy(lineType, dy);
        expect(end.y - start.y).toBeCloseTo(dy, 0);
        // The path is rounded to 0.1 px.
        expect(distanceToChord(c1, start, end)).toBeLessThanOrEqual(0.15);
        expect(distanceToChord(c2, start, end)).toBeLessThanOrEqual(0.15);
      },
    );

    it.each([6, -6, 40])('draws an S-curve when dy = %d (beyond the tolerance)', async (dy) => {
      const [start, c1, c2, end] = await connectionWithDy(lineType, dy);
      expect(end.y - start.y).toBeCloseTo(dy, 0);
      expect(
        Math.max(distanceToChord(c1, start, end), distanceToChord(c2, start, end)),
      ).toBeGreaterThan(1);
    });
  });

  // The symmetric S-curve has its control points at the heights of its ends, so (by the convex
  // hull of a Bézier curve) the centre line stays in the band between them. The organic style is
  // hand-drawn on purpose and does bulge out of it.
  describe.each(CURVED_STYLES.filter(([, type]) => type !== LineType.THICK_CURVED_ORGANIC))(
    'with %s',
    (_name, lineType) => {
      it.each([6, -6, 40, -40])(
        'keeps the S-curve within the band between the end heights when dy = %d',
        async (dy) => {
          const [start, c1, c2, end] = await connectionWithDy(lineType, dy);
          const low = Math.min(start.y, end.y) - 0.15;
          const high = Math.max(start.y, end.y) + 0.15;
          [c1, c2].forEach((p) => {
            expect(p.y).toBeGreaterThanOrEqual(low);
            expect(p.y).toBeLessThanOrEqual(high);
          });
        },
      );
    },
  );
});
