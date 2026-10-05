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
  neuronPathData,
  neuronRand,
  neuronSeed,
  neuronSegments,
} from '../../../src/components/geometry/neuron';
import { pathCommands } from '../../helpers/geometry';

const O = { x: 0, y: 0 };
const SEED = neuronSeed(200);

describe('geometry/neuron neuronSeed', () => {
  it('is in [0, 1] and depends only on the length', () => {
    [0, 1, 17.5, 200, 1e6].forEach((length) => {
      const seed = neuronSeed(length);
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThanOrEqual(1);
    });
    expect(neuronSeed(0)).toBe(0.5);
    expect(neuronSeed(200)).toBe(neuronSeed(200));
  });

  it('is NaN for NaN or infinite lengths', () => {
    expect(neuronSeed(NaN)).toBeNaN();
    expect(neuronSeed(Infinity)).toBeNaN();
  });
});

describe('geometry/neuron neuronRand', () => {
  it('stays within [-amplitude, amplitude)', () => {
    for (let i = 0; i < 200; i += 1) {
      const value = neuronRand(SEED, i, 0.4);
      expect(value).toBeGreaterThanOrEqual(-0.4);
      expect(value).toBeLessThan(0.4);
    }
  });

  it('is deterministic, and changes with the iteration and the seed', () => {
    expect(neuronRand(0.3, 5, 1)).toBe(neuronRand(0.3, 5, 1));
    expect(neuronRand(0.3, 5, 1)).not.toBe(neuronRand(0.3, 6, 1));
    expect(neuronRand(0.3, 5, 1)).not.toBe(neuronRand(0.31, 5, 1));
  });

  it('is 0 for a zero amplitude, and NaN for a NaN seed', () => {
    expect(Math.abs(neuronRand(0.3, 5, 0))).toBe(0);
    expect(neuronRand(NaN, 5, 1)).toBeNaN();
  });
});

describe('geometry/neuron neuronSegments', () => {
  it('is null when the ends coincide', () => {
    expect(neuronSegments(O, O, SEED)).toBeNull();
    expect(neuronSegments({ x: 3, y: 4 }, { x: 3, y: 4 }, SEED)).toBeNull();
  });

  it.each([
    [1, 6],
    [10, 6],
    [350, 10],
    [5000, 18],
  ])('a line of %d units has %d segments', (length, count) => {
    expect(neuronSegments(O, { x: length, y: 0 }, SEED)).toHaveLength(count);
  });

  it.each([
    ['right', { x: 200, y: 0 }],
    ['left', { x: -200, y: 0 }],
    ['down', { x: 0, y: 200 }],
    ['up', { x: 0, y: -200 }],
    ['diagonal', { x: -120, y: 90 }],
  ])('ends exactly at the target (%s)', (_n, to) => {
    const segments = neuronSegments({ x: 7, y: -3 }, to, SEED)!;
    expect(segments[segments.length - 1]!.to).toEqual(to);
  });

  it('chains the segments: each starts a third of a step past the previous end', () => {
    // Horizontal, so the jitter (across the chord) leaves x alone.
    const segments = neuronSegments(O, { x: 200, y: 0 }, SEED)!;
    const third = 200 / segments.length / 3;
    segments.slice(1).forEach((s, i) => {
      expect(s.c1.x - segments[i]!.to.x).toBeCloseTo(third);
      expect(s.to.x - s.c2.x).toBeCloseTo(third);
    });
  });

  it('stays within the amplitude of the chord', () => {
    neuronSegments(O, { x: 200, y: 0 }, SEED)!.forEach((s) => {
      expect(Math.abs(s.to.y)).toBeLessThan(200 * 0.35 + 5);
    });
  });

  it('is translation invariant for a given seed', () => {
    const shift = (dx: number, dy: number) =>
      neuronSegments({ x: dx, y: dy }, { x: dx + 150, y: dy + 40 }, SEED)!.map((s) => ({
        x: Number((s.to.x - dx).toFixed(6)),
        y: Number((s.to.y - dy).toFixed(6)),
      }));
    expect(shift(37, -11)).toEqual(shift(0, 0));
  });

  it('has no NaN for a very short line', () => {
    neuronSegments(O, { x: 0.2, y: 0.1 }, SEED)!.forEach((s) => {
      [s.c1, s.c2, s.to].forEach((p) => {
        expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
      });
    });
  });

  it('takes a length that underflows to 0 as 1, so it has no NaN', () => {
    const segments = neuronSegments(O, { x: 1e-200, y: 0 }, SEED)!;
    expect(segments).toHaveLength(6);
    segments.forEach((s) => expect(Number.isFinite(s.c1.x) && Number.isFinite(s.to.y)).toBe(true));
  });

  it('is NaN, rather than throwing, for a NaN seed or an infinite end', () => {
    expect(neuronSegments(O, { x: 100, y: 0 }, NaN)![0]!.c1.y).toBeNaN();
    expect(neuronSegments(O, { x: Infinity, y: 0 }, SEED)![0]!.to.y).toBeNaN();
  });
});

describe('geometry/neuron neuronPathData', () => {
  it('is null when the ends coincide', () => {
    expect(neuronPathData(O, O, SEED)).toBeNull();
  });

  it('matches the characterized horizontal line', () => {
    expect(neuronPathData(O, { x: 200, y: 0 }, SEED)).toBe(
      'M0.0,0.0 C11.1,-3.2 15.7,19.7 26.8,21.9 C37.9,24.2 55.8,-1.8 66.9,0.1 C78.0,-1.8 ' +
        '85.8,-1.2 96.9,-2.3 C108.0,-4.7 115.2,-4.6 126.3,0.4 C137.4,0.3 158.0,-13.3 ' +
        '169.1,-17.3 C180.2,-21.7 188.9,-3.2 200.0,0.0',
    );
  });

  it('is one move and a cubic per segment', () => {
    const d = neuronPathData({ x: 1, y: 2 }, { x: 351, y: 2 }, SEED)!;
    expect(pathCommands(d)).toEqual(['M', ...Array(10).fill('C')]);
    expect(d.startsWith('M1.0,2.0 C')).toBe(true);
    expect(d.endsWith(' 351.0,2.0')).toBe(true);
  });
});
