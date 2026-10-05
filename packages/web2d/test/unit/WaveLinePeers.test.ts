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
import HeartbeatLinePeer from '../../src/components/peer/svg/HeartbeatLinePeer';
import NeuronLinePeer from '../../src/components/peer/svg/NeuronLinePeer';
import HeartbeatLine from '../../src/components/HeartbeatLine';
import NeuronLine from '../../src/components/NeuronLine';
import { hasNaN, parsePathPoints, pathCommands } from '../helpers/geometry';
import type { StrokeStyle } from '../../src/components/types';

type WavePeer = HeartbeatLinePeer | NeuronLinePeer;

const KINDS: [string, () => WavePeer][] = [
  ['HeartbeatLinePeer', () => new HeartbeatLinePeer()],
  ['NeuronLinePeer', () => new NeuronLinePeer()],
];

const draw = (create: () => WavePeer, x1: number, y1: number, x2: number, y2: number) => {
  const peer = create();
  peer.setFrom(x1, y1);
  peer.setTo(x2, y2);
  return peer;
};

const d = (peer: WavePeer) => peer._native.getAttribute('d');

describe.each(KINDS)('%s', (_name, create) => {
  it('is deterministic', () => {
    expect(d(draw(create, 10, 20, 210, 120))).toBe(d(draw(create, 10, 20, 210, 120)));
  });

  it('starts exactly at the source', () => {
    expect(parsePathPoints(d(draw(create, 10, 20, 210, 120)))[0]).toEqual([10, 20]);
  });

  it.each([
    [1, 0],
    [0, 1],
    [3, 4],
    [0.2, 0.1],
  ])('has no NaN for a short line (%d,%d)', (x2, y2) => {
    const value = d(draw(create, 0, 0, x2, y2));
    expect(value).not.toBeNull();
    expect(hasNaN(value)).toBe(false);
  });

  it('draws nothing while both ends coincide', () => {
    expect(d(draw(create, 0, 0, 0, 0))).toBeNull();
  });

  // W-STALEPATH: when the ends coincided, the method returned early and the previous path stayed.
  it('W-STALEPATH: clears the path when the ends collapse', () => {
    const peer = draw(create, 0, 0, 100, 0);
    peer.setTo(0, 0);
    expect(d(peer) ?? '').toBe('');
  });

  it('keeps its shape when the whole line moves (seeded from the length)', () => {
    const shape = (x: number, y: number) =>
      parsePathPoints(d(draw(create, x, y, x + 200, y + 50))).map(([px, py]) => [
        Number((px - x).toFixed(1)),
        Number((py - y).toFixed(1)),
      ]);
    expect(shape(37, -11)).toEqual(shape(0, 0));
  });

  it('ends exactly at the target', () => {
    const pts = parsePathPoints(d(draw(create, 10, 20, 210, 120)));
    expect(pts[pts.length - 1]).toEqual([210, 120]);
  });

  it('applies the stroke: width at least 1, colour, opacity', () => {
    const peer = create();
    peer.setStroke(0.5, 'solid', 'red', 0.5);
    expect(peer._native.getAttribute('stroke-width')).toBe('1.0');
    expect(peer._native.getAttribute('stroke')).toBe('red');
    expect(peer._native.getAttribute('stroke-opacity')).toBe('0.5');
    peer.setStroke(4);
    expect(peer._native.getAttribute('stroke-width')).toBe('4.0');
  });

  it.each([
    ['dash', '5 5'],
    ['dot', '1 8'],
    ['longdash', '10 5'],
    ['dashdot', '10 5 1 5'],
  ])('style %s uses the shared dash array "%s" at width 1 (W-DASH)', (style, expected) => {
    const peer = create();
    peer.setStroke(1, style as StrokeStyle);
    expect(peer._native.getAttribute('stroke-dasharray')).toBe(expected);
  });

  // BL5-77: the dash lengths are for width 1 and scale with the drawn width.
  it.each([
    ['dash', 2, '10 10'],
    ['dash', 4, '20 20'],
    ['dot', 2, '2 16'],
    ['dot', 4, '4 32'],
    ['longdash', 2, '20 10'],
    ['longdash', 4, '40 20'],
    ['dashdot', 2, '20 10 2 10'],
    ['dashdot', 4, '40 20 4 20'],
  ])('BL5-77: style %s at width %d draws "%s"', (style, width, expected) => {
    const peer = create();
    peer.setStroke(width, style as StrokeStyle);
    expect(peer._native.getAttribute('stroke-dasharray')).toBe(expected);
  });

  it('BL5-77: a width set after the style rescales the dash; below 1 it draws at 1', () => {
    const peer = create();
    peer.setStroke(1, 'dash');
    peer.setStroke(4);
    expect(peer._native.getAttribute('stroke-dasharray')).toBe('20 20');
    peer.setStroke(0.5);
    expect(peer._native.getAttribute('stroke-dasharray')).toBe('5 5');
  });

  it('a dash pattern applies when the style is solid, and solid clears it', () => {
    const peer = create();
    peer.setDashPattern(6, 2);
    expect(peer._native.getAttribute('stroke-dasharray')).toBe('6,2');
    peer.setStroke(null, 'solid');
    expect(peer._native.getAttribute('stroke-dasharray')).toBeNull();
    peer.setDashPattern(undefined as unknown as number, 2);
    expect(peer._native.getAttribute('stroke-dasharray')).toBeNull();
  });

  it('is not filled and has round joins', () => {
    const peer = create();
    expect(peer._native.getAttribute('fill')).toBe('none');
    expect(peer._native.getAttribute('stroke-linejoin')).toBe('round');
    expect(peer._native.getAttribute('stroke-linecap')).toBe('round');
  });

  it('keeps its ends and skips unchanged updates', () => {
    const peer = draw(create, 1, 2, 300, 4);
    expect(peer.getFrom()).toEqual({ x: 1, y: 2 });
    expect(peer.getTo()).toEqual({ x: 300, y: 4 });
    const spy = jest.spyOn(peer._native, 'setAttribute');
    peer.setFrom(1, 2);
    peer.setTo(300, 4);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('HeartbeatLinePeer', () => {
  it('characterization: horizontal (0,0)->(200,0)', () => {
    expect(d(draw(() => new HeartbeatLinePeer(), 0, 0, 200, 0))).toBe(
      'M0.0,0.0 L20.0,0.0 L36.0,4.3 L48.0,-7.2 L60.0,0.0 L72.0,0.0 L88.0,28.7 L96.0,-17.2 ' +
        'L104.0,5.7 L112.0,-2.9 L120.0,0.0 L132.0,3.4 L144.0,-5.2 L156.0,0.0 L168.0,2.3 ' +
        'L180.0,-2.3 L192.0,0.0 L200.0,0.0',
    );
  });

  it('ends exactly at the target', () => {
    const pts = parsePathPoints(d(draw(() => new HeartbeatLinePeer(), 10, 20, 210, 120)));
    expect(pts[pts.length - 1]).toEqual([210, 120]);
  });

  it.each([1, 5, 20])('the spike of a %d unit line stays within its length', (length) => {
    const pts = parsePathPoints(d(draw(() => new HeartbeatLinePeer(), 0, 0, length, 0)));
    pts.forEach(([, y]) => expect(Math.abs(y)).toBeLessThanOrEqual(length));
  });

  it('a stroke update without a new width does not re-path', () => {
    const peer = draw(() => new HeartbeatLinePeer(), 0, 0, 200, 0);
    const before = d(peer);
    peer.setStroke(3, 'dash');
    peer.setStroke(null, null, 'red');
    expect(d(peer)).toBe(before);
  });

  it('the spike is perpendicular to the line (vertical line spikes along x)', () => {
    const pts = parsePathPoints(d(draw(() => new HeartbeatLinePeer(), 0, 0, 0, 200)));
    expect(Math.max(...pts.map(([x]) => Math.abs(x)))).toBeGreaterThan(10);
  });

  // W-STALEPATH: setStroke(width) changed the amplitude, but did not re-path.
  it('W-STALEPATH: re-paths when the stroke width changes', () => {
    const peer = draw(() => new HeartbeatLinePeer(), 0, 0, 200, 0);
    const before = d(peer);
    peer.setStroke(10);
    expect(d(peer)).not.toBe(before);
  });
});

describe('NeuronLinePeer', () => {
  it('horizontal (0,0)->(200,0)', () => {
    expect(d(draw(() => new NeuronLinePeer(), 0, 0, 200, 0))).toBe(
      'M0.0,0.0 C11.1,-3.2 15.7,19.7 26.8,21.9 C37.9,24.2 55.8,-1.8 66.9,0.1 C78.0,-1.8 ' +
        '85.8,-1.2 96.9,-2.3 C108.0,-4.7 115.2,-4.6 126.3,0.4 C137.4,0.3 158.0,-13.3 ' +
        '169.1,-17.3 C180.2,-21.7 188.9,-3.2 200.0,0.0',
    );
  });

  it('uses between 6 and 18 cubic segments', () => {
    const count = (x2: number) =>
      (d(draw(() => new NeuronLinePeer(), 0, 0, x2, 0))!.match(/C/g) ?? []).length;
    expect(count(10)).toBe(6);
    expect(count(350)).toBe(10);
    expect(count(5000)).toBe(18);
  });

  // W-NEURONEND: the last segment used to end at the lateral/forward/spike offset of t = 1, not
  // at the target, so the line stopped short of (or past) the topic.
  it('W-NEURONEND: ends exactly at the target', () => {
    const pts = parsePathPoints(d(draw(() => new NeuronLinePeer(), 0, 0, 200, 0)));
    expect(pts[pts.length - 1]).toEqual([200, 0]);
  });

  // BL5-74: the seed came from the length, so dragging one end reshuffled the whole shape. The
  // seed is now fixed once both ends are set: the same lateral offsets, stretched.
  it('BL5-74: keeps its shape when one end moves (drag)', () => {
    // The segment ends (every third point after M) of a horizontal line are its lateral offsets.
    const offsets = (peer: WavePeer) =>
      parsePathPoints(d(peer))
        .filter((_p, i) => i % 3 === 0)
        .slice(1, -1)
        .map(([, y]) => y);
    // 200 and 210 units both draw 6 segments with the maximum amplitude.
    const peer = draw(() => new NeuronLinePeer(), 0, 0, 200, 0);
    const before = offsets(peer);
    peer.setTo(210, 0);
    expect(offsets(peer)).toEqual(before);
  });

  // BL5-119: the segment count came from the current length, round(distance / 35), so a drag
  // across a rounding boundary added or dropped a segment and the whole line jumped. The count is
  // now fixed with the seed, and the same segments stretch.
  it('BL5-119: keeps its segment count when one end moves (drag)', () => {
    const peer = draw(() => new NeuronLinePeer(), 0, 0, 200, 0);
    const segments = pathCommands(d(peer)).filter((c) => c === 'C').length;
    expect(segments).toBe(6);
    peer.setTo(400, 0);
    expect(pathCommands(d(peer)).filter((c) => c === 'C').length).toBe(segments);
  });

  it('BL5-119: a one-unit drag across a rounding boundary moves the line by about a unit', () => {
    // 227 units draw round(6.49) = 6 segments, 228 units round(6.51) = 7.
    const peer = draw(() => new NeuronLinePeer(), 0, 0, 227, 0);
    const before = parsePathPoints(d(peer));
    peer.setTo(228, 0);
    const after = parsePathPoints(d(peer));
    expect(after).toHaveLength(before.length);
    const jump = Math.max(
      ...after.map(([x, y], i) => Math.hypot(x - before[i]![0], y - before[i]![1])),
    );
    expect(jump).toBeLessThan(2);
  });

  it('BL5-74: a static render does not depend on how its ends were set', () => {
    const direct = d(draw(() => new NeuronLinePeer(), 10, 20, 210, 120));
    const peer = new NeuronLinePeer();
    peer.setTo(210, 120);
    peer.setFrom(10, 20);
    expect(d(peer)).toBe(direct);
  });

  it('a draw with coinciding ends does not fix the seed', () => {
    const collapsed = new NeuronLinePeer();
    collapsed.setTo(100, 0);
    collapsed.setFrom(100, 0);
    collapsed.setFrom(0, 50);
    collapsed.setTo(300, 20);
    const direct = draw(() => new NeuronLinePeer(), 0, 50, 100, 0);
    direct.setTo(300, 20);
    expect(d(collapsed)).toBe(d(direct));
  });
});

describe.each([
  ['HeartbeatLine', () => new HeartbeatLine(), '#ff3366'],
  ['NeuronLine', () => new NeuronLine(), '#9cf7ff'],
] as [string, () => HeartbeatLine | NeuronLine, string][])('%s', (type, create, color) => {
  it('delegates to its peer', () => {
    const line = create();
    expect(line.getType()).toBe(type);
    expect(line.getElementClass()).toBe(line);
    line.setFrom(0, 0);
    line.setTo(100, 50);
    expect(line.getFrom()).toEqual({ x: 0, y: 0 });
    expect(line.getTo()).toEqual({ x: 100, y: 50 });
    line.setDashed(3, 3);
    expect(line.peer._native.getAttribute('stroke-dasharray')).toBe('3,3');
    expect(line.isSrcControlPointCustom()).toBe(false);
    expect(line.isDestControlPointCustom()).toBe(false);
    expect(line.peer._native.getAttribute('stroke')).toBe(color);
    expect(line.peer._native.getAttribute('stroke-width')).toBe('3.0');
  });

  it('rejects NaN ends', () => {
    const line = create();
    expect(() => line.setFrom(Number.NaN, 0)).toThrow();
    expect(() => line.setTo(0, Number.NaN)).toThrow();
  });

  it('characterization: control point methods are throwing Line stubs (typing step T5)', () => {
    const line = create();
    expect(() => line.setIsSrcControlPointCustom(true)).toThrow();
    expect(() => line.setIsDestControlPointCustom(true)).toThrow();
    expect(() => line.setSrcControlPoint({ x: 0, y: 0 })).toThrow();
    expect(() => line.setDestControlPoint({ x: 0, y: 0 })).toThrow();
    expect(() => line.getControlPoints()).toThrow();
  });
});
