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
import PolyLinePeer from '../../src/components/peer/svg/PolyLinePeer';
import PolyLine from '../../src/components/PolyLine';
import { parsePoints } from '../helpers/geometry';

type Orientation = 'horizontal' | 'vertical';

const poly = (
  style: string,
  orientation: Orientation,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string | null => {
  const peer = new PolyLinePeer();
  peer.setStyle(style);
  peer.setOrientation(orientation);
  peer.setFrom(x1, y1);
  peer.setTo(x2, y2);
  return peer._native.getAttribute('points');
};

describe('PolyLinePeer points per style and orientation', () => {
  it.each([
    ['Straight', 'horizontal', '0, 0 50, 0 50, 100 100, 100'],
    ['Straight', 'vertical', '0, 0 0, 50 100, 50 100, 100'],
    ['MiddleStraight', 'horizontal', '0, 0 50, 0 50, 100 100, 100'],
    ['MiddleStraight', 'vertical', '0, 0 0, 50 100, 50 100, 100'],
    [
      'MiddleCurved',
      'horizontal',
      '0.0, 0.0 40.0, 0.0 50.0, 10.0 50.0, 90.0 60.0, 100.0 100.0, 100.0',
    ],
    [
      'MiddleCurved',
      'vertical',
      '0.0, 0.0 0.0, 40.0 10.0, 50.0 90.0, 50.0 100.0, 60.0 100.0, 100.0',
    ],
    ['Curved', 'horizontal', '0.0, 0.0 45.0, 0.0 50.0, 5.0 50.0, 95.0 55.0, 100.0 100.0, 100.0'],
    ['Curved', 'vertical', '0.0, 0.0 0.0, 45.0 5.0, 50.0 95.0, 50.0 100.0, 55.0 100.0, 100.0'],
  ] as [string, Orientation, string][])(
    '%s %s (0,0)->(100,100)',
    (style, orientation, expected) => {
      expect(poly(style, orientation, 0, 0, 100, 100)).toBe(expected);
    },
  );

  it.each(['Straight', 'MiddleStraight', 'MiddleCurved', 'Curved'])(
    '%s starts and ends at the given points in every quadrant and orientation',
    (style) => {
      (['horizontal', 'vertical'] as Orientation[]).forEach((o) => {
        [
          [100, 100],
          [-100, -100],
          [100, -100],
          [-100, 100],
        ].forEach(([x2, y2]) => {
          const pts = parsePoints(poly(style, o, 0, 0, x2!, y2!));
          expect(pts[0]).toEqual([0, 0]);
          expect(pts[pts.length - 1]).toEqual([x2, y2]);
        });
      });
    },
  );

  it('an empty style draws the curved path', () => {
    expect(poly('', 'horizontal', 0, 0, 100, 100)).toBe(
      poly('Curved', 'horizontal', 0, 0, 100, 100),
    );
  });

  it('an unknown style draws the curved path, as an empty one does', () => {
    expect(poly('Zigzag', 'horizontal', 0, 0, 100, 100)).toBe(
      poly('Curved', 'horizontal', 0, 0, 100, 100),
    );
  });

  it('MiddleStraight rounds the middle to whole units, and has no duplicated points', () => {
    expect(poly('MiddleStraight', 'horizontal', 0.5, 0, 100, 10.5)).toBe(
      '0.5, 0 50, 0 50, 10.5 100, 10.5',
    );
  });

  it('defaults to Straight, horizontal, with no fill', () => {
    const peer = new PolyLinePeer();
    expect(peer.getStyle()).toBe('Straight');
    expect(peer.getOrientation()).toBe('horizontal');
    expect(peer._native.getAttribute('fill')).toBe('none');
  });

  it('writes stroke width and colour', () => {
    const peer = new PolyLinePeer();
    peer.setStrokeWidth(2);
    peer.setColor('red');
    expect(peer._native.getAttribute('stroke-width')).toBe('2');
    expect(peer._native.getAttribute('stroke')).toBe('red');
  });

  // W-MIDCURVE: signx used to start at 0, so right-going lines got no horizontal chamfer, and
  // y1 == y2 drew a 20 unit vertical spike.
  it('W-MIDCURVE: a horizontal MiddleCurved line with y1 == y2 has no spike', () => {
    const pts = parsePoints(poly('MiddleCurved', 'horizontal', 0, 0, 100, 0));
    pts.forEach(([, y]) => expect(y).toBe(0));
  });

  it('W-MIDCURVE: a vertical MiddleCurved line with x1 == x2 has no spike', () => {
    const pts = parsePoints(poly('MiddleCurved', 'vertical', 0, 0, 0, 100));
    pts.forEach(([x]) => expect(x).toBe(0));
  });

  it('W-MIDCURVE: right-going MiddleCurved lines are chamfered horizontally', () => {
    const pts = parsePoints(poly('MiddleCurved', 'horizontal', 0, 0, 100, 100));
    // The point before the first vertical segment must sit before the middle.
    expect(pts[1]![0]).toBeLessThan(50);
  });
});

describe('PolyLine', () => {
  it('delegates to its peer', () => {
    const line = new PolyLine();
    expect(line.getType()).toBe('PolyLine');
    expect(line.getElementClass()).toBe(line);
    line.setStyle('Curved');
    line.setOrientation('vertical');
    expect(line.getStyle()).toBe('Curved');
    expect(line.getOrientation()).toBe('vertical');
    line.setFrom(0, 0);
    line.setTo(100, 100);
    expect(line.peer._native.getAttribute('points')).toBe(
      poly('Curved', 'vertical', 0, 0, 100, 100),
    );
    expect(line.buildCurvedPath(10, 0, 0, 100, 100)).toBe(
      poly('Curved', 'horizontal', 0, 0, 100, 100),
    );
    expect(line.buildStraightPath(10, 0, 0, 100, 100)).toBe('0, 0 50, 0 50, 100 100, 100');
  });

  it('applies its default stroke', () => {
    const line = new PolyLine();
    expect(line.peer._native.getAttribute('stroke')).toBe('blue');
    expect(line.peer._native.getAttribute('stroke-width')).toBe('1');
  });

  it.each([
    'getTo',
    'getFrom',
    'setIsSrcControlPointCustom',
    'setIsDestControlPointCustom',
    'setDashed',
    'setSrcControlPoint',
    'setDestControlPoint',
    'isDestControlPointCustom',
    'isSrcControlPointCustom',
    'getControlPoints',
  ])('characterization: %s is a throwing Line stub (typing step T5)', (method) => {
    const line = new PolyLine() as unknown as Record<string, () => unknown>;
    expect(() => line[method]!()).toThrow('Method not implemented.');
  });
});
