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
import {
  IDENTITY,
  applyMatrix,
  invertMatrix,
  viewBoxMatrix,
  type Matrix,
} from '../../../src/components/geometry/matrix';

const expectClose = (actual: Matrix, expected: Matrix) => {
  (['a', 'b', 'c', 'd', 'e', 'f'] as const).forEach((key) =>
    expect(actual[key]).toBeCloseTo(expected[key], 10),
  );
};

describe('geometry/matrix', () => {
  it('the identity maps a point to itself', () => {
    expect(applyMatrix(IDENTITY, { x: 3, y: -4 })).toEqual({ x: 3, y: -4 });
  });

  it('applyMatrix scales, skews and translates', () => {
    const m = { a: 2, b: 1, c: 3, d: 4, e: 5, f: 6 };
    // (2·1 + 3·2 + 5, 1·1 + 4·2 + 6)
    expect(applyMatrix(m, { x: 1, y: 2 })).toEqual({ x: 13, y: 15 });
  });

  it.each([
    ['a scale and a translation', { a: 2, b: 0, c: 0, d: 0.5, e: -10, f: 7 }],
    ['a rotation', { a: 0, b: 1, c: -1, d: 0, e: 3, f: 4 }],
    ['a general matrix', { a: 2, b: 1, c: 3, d: 4, e: 5, f: 6 }],
  ])('invertMatrix of %s undoes it', (_name, m) => {
    const inverse = invertMatrix(m);
    expect(inverse).not.toBeNull();
    const p = { x: 12.5, y: -3 };
    const back = applyMatrix(inverse!, applyMatrix(m, p));
    expect(back.x).toBeCloseTo(p.x, 10);
    expect(back.y).toBeCloseTo(p.y, 10);
  });

  it('invertMatrix of a scale and translation is the reverse scale and translation', () => {
    expectClose(invertMatrix({ a: 2, b: 0, c: 0, d: 4, e: 10, f: 20 })!, {
      a: 0.5,
      b: 0,
      c: 0,
      d: 0.25,
      e: -5,
      f: -5,
    });
  });

  it('invertMatrix of the identity is the identity', () => {
    expectClose(invertMatrix(IDENTITY)!, IDENTITY);
  });

  it.each([
    ['a zero scale', { a: 0, b: 0, c: 0, d: 1, e: 0, f: 0 }],
    ['parallel axes', { a: 1, b: 2, c: 2, d: 4, e: 0, f: 0 }],
  ])('invertMatrix of %s has no inverse', (_name, m) => {
    expect(invertMatrix(m)).toBeNull();
  });

  it('viewBoxMatrix maps the viewBox corners onto the viewport corners', () => {
    const viewBox = { x: -100, y: 50, width: 400, height: 200 };
    const viewport = { x: 10, y: 20, width: 800, height: 100 };
    const m = viewBoxMatrix(viewBox, viewport);
    expect(applyMatrix(m, { x: -100, y: 50 })).toEqual({ x: 10, y: 20 });
    expect(applyMatrix(m, { x: 300, y: 250 })).toEqual({ x: 810, y: 120 });
    // preserveAspectRatio="none": each axis has its own scale.
    expect(m).toMatchObject({ a: 2, b: 0, c: 0, d: 0.5 });
  });

  it('viewBoxMatrix of a zoomed-in viewBox magnifies', () => {
    // Zoom 2: a 200 × 200 viewBox in a 400 × 400 viewport.
    const m = viewBoxMatrix(
      { x: 0, y: 0, width: 200, height: 200 },
      {
        x: 0,
        y: 0,
        width: 400,
        height: 400,
      },
    );
    expect(applyMatrix(m, { x: 50, y: 25 })).toEqual({ x: 100, y: 50 });
  });

  it('viewBoxMatrix does not scale an empty viewBox axis', () => {
    const m = viewBoxMatrix(
      { x: 5, y: 6, width: 0, height: -1 },
      {
        x: 1,
        y: 2,
        width: 300,
        height: 300,
      },
    );
    expect(m).toEqual({ a: 1, b: 0, c: 0, d: 1, e: -4, f: -4 });
  });
});
