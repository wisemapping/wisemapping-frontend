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
  HEARTBEAT_PATTERN,
  heartbeatAmplitude,
  heartbeatPathData,
  heartbeatPoints,
} from '../../../src/components/geometry/heartbeat';
import { pathCommands } from '../../helpers/geometry';

const O = { x: 0, y: 0 };

describe('geometry/heartbeat HEARTBEAT_PATTERN', () => {
  it('runs forward inside the chord and is frozen', () => {
    const positions = HEARTBEAT_PATTERN.map((n) => n.pos);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(Math.min(...positions)).toBeGreaterThan(0);
    expect(Math.max(...positions)).toBeLessThan(1);
    expect(Object.isFrozen(HEARTBEAT_PATTERN)).toBe(true);
  });

  it('has its spike at full amplitude', () => {
    expect(Math.max(...HEARTBEAT_PATTERN.map((n) => Math.abs(n.amp)))).toBe(1);
  });
});

describe('geometry/heartbeat heartbeatAmplitude', () => {
  it('is 35 % of the length, scaled by the stroke width', () => {
    expect(heartbeatAmplitude(100, 0)).toBe(Math.max(10, 35 * 0.4));
    expect(heartbeatAmplitude(100, 15)).toBeCloseTo(35);
  });

  it('caps the base at 60', () => {
    expect(heartbeatAmplitude(1000, 15)).toBeCloseTo(60);
  });

  it('has a floor of 10 that never exceeds the base amplitude', () => {
    expect(heartbeatAmplitude(40, 0)).toBe(10);
    expect(heartbeatAmplitude(1, 0)).toBeCloseTo(0.35);
    expect(heartbeatAmplitude(0, 3)).toBe(0);
  });

  it('is NaN for NaN inputs', () => {
    expect(heartbeatAmplitude(NaN, 3)).toBeNaN();
    expect(heartbeatAmplitude(100, NaN)).toBeNaN();
  });
});

describe('geometry/heartbeat heartbeatPoints', () => {
  it('is null when the ends coincide', () => {
    expect(heartbeatPoints(O, O, 3)).toBeNull();
    expect(heartbeatPoints({ x: 5, y: -5 }, { x: 5, y: -5 }, 3)).toBeNull();
  });

  it('starts and ends exactly at the ends, with one point per pattern node between', () => {
    const pts = heartbeatPoints({ x: 10, y: 20 }, { x: 210, y: 120 }, 3)!;
    expect(pts).toHaveLength(HEARTBEAT_PATTERN.length + 2);
    expect(pts[0]).toEqual({ x: 10, y: 20 });
    expect(pts[pts.length - 1]).toEqual({ x: 210, y: 120 });
  });

  it('offsets a horizontal line only along y', () => {
    const pts = heartbeatPoints(O, { x: 200, y: 0 }, 3)!;
    HEARTBEAT_PATTERN.forEach((node, i) => expect(pts[i + 1]!.x).toBeCloseTo(200 * node.pos));
    expect(pts.some((p) => Math.abs(p.y) > 1)).toBe(true);
  });

  it('offsets a vertical line only along x', () => {
    const pts = heartbeatPoints(O, { x: 0, y: 200 }, 3)!;
    HEARTBEAT_PATTERN.forEach((node, i) => expect(pts[i + 1]!.y).toBeCloseTo(200 * node.pos));
    expect(pts.some((p) => Math.abs(p.x) > 1)).toBe(true);
  });

  it('mirrors when the direction is reversed', () => {
    const forward = heartbeatPoints(O, { x: 200, y: 0 }, 3)!;
    const backward = heartbeatPoints(O, { x: -200, y: 0 }, 3)!;
    forward.forEach((p, i) => {
      expect(backward[i]!.x).toBeCloseTo(-p.x);
      expect(backward[i]!.y).toBeCloseTo(-p.y);
    });
  });

  it('keeps its shape when the whole line moves', () => {
    const at = (x: number, y: number) =>
      heartbeatPoints({ x, y }, { x: x + 120, y: y - 40 }, 3)!.map((p) => ({
        x: Number((p.x - x).toFixed(6)),
        y: Number((p.y - y).toFixed(6)),
      }));
    expect(at(37, -11)).toEqual(at(0, 0));
  });

  it('stays close to the chord for a very short line', () => {
    heartbeatPoints(O, { x: 0.2, y: 0.1 }, 3)!.forEach((p) => {
      expect(Math.abs(p.x)).toBeLessThan(1);
      expect(Math.abs(p.y)).toBeLessThan(1);
    });
  });

  it('is NaN for a NaN end, and for an infinite one', () => {
    expect(heartbeatPoints(O, { x: NaN, y: 0 }, 3)!.some((p) => Number.isNaN(p.x))).toBe(true);
    expect(heartbeatPoints(O, { x: Infinity, y: 0 }, 3)!.some((p) => Number.isNaN(p.y))).toBe(true);
  });
});

describe('geometry/heartbeat heartbeatPathData', () => {
  it('is null when the ends coincide', () => {
    expect(heartbeatPathData(O, O, 3)).toBeNull();
  });

  it('is one move and a line per point, with 1 decimal', () => {
    const d = heartbeatPathData({ x: 10, y: 20 }, { x: 210, y: 120 }, 3)!;
    expect(pathCommands(d)).toEqual(['M', ...HEARTBEAT_PATTERN.map(() => 'L'), 'L']);
    expect(d.startsWith('M10.0,20.0 L')).toBe(true);
    expect(d.endsWith(' L210.0,120.0')).toBe(true);
  });
});
