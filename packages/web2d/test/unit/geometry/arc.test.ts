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
import { arcControlPoints, arcPathData } from '../../../src/components/geometry/arc';
import { parsePathPoints, pathCommands } from '../../helpers/geometry';

const O = { x: 0, y: 0 };

describe('geometry/arc arcControlPoints', () => {
  it('horizontal: bends an eighth of the way along y, then arrives level with the target', () => {
    expect(arcControlPoints(O, { x: 100, y: 80 }, 'horizontal')).toEqual([
      { x: 0, y: 10 },
      { x: 0, y: 80 },
    ]);
  });

  it('vertical: bends an eighth of the way along x, then arrives level with the target', () => {
    expect(arcControlPoints(O, { x: 80, y: 100 }, 'vertical')).toEqual([
      { x: 10, y: 0 },
      { x: 80, y: 0 },
    ]);
  });

  it.each(['horizontal', 'vertical'] as const)('handles negative directions (%s)', (o) => {
    const [c1, c2] = arcControlPoints({ x: 10, y: 10 }, { x: -70, y: -150 }, o);
    if (o === 'horizontal') {
      expect([c1, c2]).toEqual([
        { x: 10, y: -10 },
        { x: 10, y: -150 },
      ]);
    } else {
      expect([c1, c2]).toEqual([
        { x: 0, y: 10 },
        { x: -70, y: 10 },
      ]);
    }
  });

  it.each(['horizontal', 'vertical'] as const)(
    'collapses onto the ends for a zero-length arc (%s)',
    (o) => {
      const p = { x: 4, y: 5 };
      expect(arcControlPoints(p, p, o)).toEqual([p, p]);
    },
  );

  it('a straight horizontal (or vertical) arc stays on its line', () => {
    const [h1, h2] = arcControlPoints(O, { x: 100, y: 0 }, 'horizontal');
    expect([h1.y, h2.y]).toEqual([0, 0]);
    const [v1, v2] = arcControlPoints(O, { x: 0, y: 100 }, 'vertical');
    expect([v1.x, v2.x]).toEqual([0, 0]);
  });

  it('propagates NaN and Infinity', () => {
    const [c1, c2] = arcControlPoints(O, { x: Infinity, y: NaN }, 'horizontal');
    expect(Number.isNaN(c1.y)).toBe(true);
    expect(Number.isNaN(c2.x)).toBe(true);
  });
});

describe('geometry/arc arcPathData', () => {
  it('keeps the legacy spacing byte for byte', () => {
    expect(arcPathData(O, { x: 100, y: 100 }, 'horizontal')).toBe(
      'M0.0,0.0  C0.0,12.5 ,0.0,100.0  100.0,100.0 ',
    );
  });

  it('is one cubic curve from the source to the target', () => {
    const d = arcPathData({ x: 1.25, y: -3 }, { x: 50, y: 20 }, 'vertical');
    expect(pathCommands(d)).toEqual(['M', 'C']);
    const pts = parsePathPoints(d);
    expect(pts[0]).toEqual([1.3, -3]);
    expect(pts[3]).toEqual([50, 20]);
  });

  it('writes 1 decimal, keeping a negative zero', () => {
    expect(arcPathData({ x: -0.04, y: 0 }, O, 'horizontal')).toBe(
      'M-0.0,0.0  C-0.0,0.0 ,-0.0,0.0  0.0,0.0 ',
    );
  });

  it('writes NaN through, rather than throwing', () => {
    expect(arcPathData(O, { x: NaN, y: 8 }, 'vertical')).toBe(
      'M0.0,0.0  CNaN,0.0 ,NaN,0.0  NaN,8.0 ',
    );
  });
});
