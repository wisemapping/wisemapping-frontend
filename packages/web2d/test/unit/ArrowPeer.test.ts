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
import ArrowPeer from '../../src/components/peer/svg/ArrowPeer';
import Arrow from '../../src/components/Arrow';
import { parsePathPoints, pathCommands } from '../helpers/geometry';

const arrow = (from: [number, number], cp: { x: number; y: number }) => {
  const peer = new ArrowPeer();
  peer.setFrom(from[0], from[1]);
  peer.setControlPoint(cp);
  return peer;
};

/** The two wing vectors, relative to the arrow tip. */
const wings = (peer: ArrowPeer) => {
  const pts = parsePathPoints(peer._native.getAttribute('d'));
  const [tip, w1, , w2] = pts as [[number, number], [number, number], unknown, [number, number]];
  return [
    [w1[0] - tip[0], w1[1] - tip[1]],
    [w2[0] - tip[0], w2[1] - tip[1]],
  ] as [number, number][];
};

const angleBetween = (a: [number, number], b: [number, number]) => {
  const dot = a[0] * b[0] + a[1] * b[1];
  return (Math.acos(dot / (Math.hypot(...a) * Math.hypot(...b))) * 180) / Math.PI;
};

describe('ArrowPeer', () => {
  it('draws nothing until it has a control point', () => {
    const peer = new ArrowPeer();
    peer.setFrom(10, 10);
    expect(peer._native.getAttribute('d')).toBeNull();
  });

  it('characterization: two wings from the tip', () => {
    const peer = arrow([0, 0], { x: 10, y: 5 });
    const d = peer._native.getAttribute('d');
    expect(pathCommands(d)).toEqual(['M', 'L', 'M', 'L']);
    const pts = parsePathPoints(d);
    expect(pts[0]).toEqual([0, 0]);
    expect(pts[2]).toEqual([0, 0]);
  });

  it.each([
    [10, 5],
    [-10, 5],
    [10, -5],
    [-10, -5],
    [0, 10],
    [0, -10],
    [10, 10],
    [10, -10],
    [-10, 10],
    [-10, -10],
  ])('wings are 6 long and at ±45° from the control direction (%d,%d)', (x, y) => {
    const peer = arrow([50, 50], { x, y });
    const [w1, w2] = wings(peer);
    expect(Math.hypot(...w1!)).toBeCloseTo(6);
    expect(Math.hypot(...w2!)).toBeCloseTo(6);
    expect(angleBetween(w1!, [x, y])).toBeCloseTo(45);
    expect(angleBetween(w2!, [x, y])).toBeCloseTo(45);
    expect(angleBetween(w1!, w2!)).toBeCloseTo(90);
  });

  it.each([
    [10, 0],
    [-10, 0],
  ])('the y = 0 case has wings at ±45° (%d,%d)', (x, y) => {
    const peer = arrow([0, 0], { x, y });
    const [w1, w2] = wings(peer);
    expect(angleBetween(w1!, w2!)).toBeCloseTo(90);
    expect(angleBetween(w1!, [x, y])).toBeCloseTo(45);
    expect(angleBetween(w2!, [x, y])).toBeCloseTo(45);
  });

  it('a zero control point points down', () => {
    const [w1, w2] = wings(arrow([0, 0], { x: 0, y: 0 }));
    expect(angleBetween(w1!, [0, 1])).toBeCloseTo(45);
    expect(angleBetween(w2!, [0, 1])).toBeCloseTo(45);
  });

  // Section 3.3: the y = 0 case used to write y = 1 into the caller's object.
  it('does not mutate the caller control point (y = 0 case)', () => {
    const cp = { x: 10, y: 0 };
    arrow([0, 0], cp);
    expect(cp).toEqual({ x: 10, y: 0 });
  });

  it('characterization: the wing length does not scale with the stroke width', () => {
    const peer = arrow([0, 0], { x: 10, y: 5 });
    peer.setStrokeWidth(5);
    peer.setFrom(0, 0);
    const [w1] = wings(peer);
    expect(Math.hypot(...w1!)).toBeCloseTo(6);
  });

  it('moves with the tip', () => {
    const peer = arrow([0, 0], { x: 10, y: 5 });
    const before = wings(peer);
    peer.setFrom(100, -20);
    expect(wings(peer)[0]![0]).toBeCloseTo(before[0]![0]);
    expect(parsePathPoints(peer._native.getAttribute('d'))[0]).toEqual([100, -20]);
  });

  it('writes stroke colour and width', () => {
    const peer = arrow([0, 0], { x: 10, y: 5 });
    peer.setStrokeColor('red');
    peer.setStrokeWidth(3);
    expect(peer._native.getAttribute('stroke')).toBe('red');
    expect(peer._native.getAttribute('stroke-width')).toBe('3');
  });

  it('setDashed writes length and spacing, and clears them', () => {
    const peer = arrow([0, 0], { x: 10, y: 5 });
    peer.setDashed(true, 5, 3);
    expect(peer._native.getAttribute('stroke-dasharray')).toBe('5,3');
    peer.setDashed(false, 5, 5);
    expect(peer._native.getAttribute('stroke-dasharray')).toBeNull();
  });

  // W-ARROWDASH: `${length}${spacing}` used to give "55".
  it('W-ARROWDASH: setDashed separates length and spacing', () => {
    const peer = arrow([0, 0], { x: 10, y: 5 });
    peer.setDashed(true, 5, 5);
    expect(peer._native.getAttribute('stroke-dasharray')).toMatch(/^5[ ,]5$/);
  });
});

describe('Arrow', () => {
  it('delegates to its peer', () => {
    const a = new Arrow();
    expect(a.getType()).toBe('Arrow');
    a.setFrom(0, 0);
    a.setControlPoint({ x: 10, y: 10 });
    a.setStrokeColor('green');
    a.setStrokeWidth(2);
    a.setDashed(false, 1, 1);
    expect(a.peer._native.getAttribute('d')).not.toBeNull();
    expect(a.peer._native.getAttribute('stroke')).toBe('green');
  });

  it('applies its default stroke', () => {
    const a = new Arrow();
    expect(a.peer._native.getAttribute('stroke')).toBe('black');
    expect(a.peer._native.getAttribute('stroke-width')).toBe('1');
  });
});
