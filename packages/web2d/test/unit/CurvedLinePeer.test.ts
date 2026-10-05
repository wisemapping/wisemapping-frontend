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
import CurvedLinePeer from '../../src/components/peer/svg/CurvedLinePeer';
import CurvedLine from '../../src/components/CurvedLine';
import { extent, parsePathPoints, pathCommands } from '../helpers/geometry';

const line = (x1: number, y1: number, x2: number, y2: number): CurvedLinePeer => {
  const peer = new CurvedLinePeer();
  peer.setFrom(x1, y1);
  peer.setTo(x2, y2);
  return peer;
};

const d = (peer: CurvedLinePeer) => peer._native.getAttribute('d');

describe('CurvedLinePeer default control points', () => {
  it('horizontal line, width 1: tapered, closed and symmetric about the centre', () => {
    const peer = line(0, 0, 90, 0);
    expect(d(peer)).toBe('M0.0,-0.5 C30.0,-0.3 60.0,-0.2 90.0,0.0 C60.0,0.2 30.0,0.3 0.0,0.5 Z');
  });

  it('puts the control points at a third of the chord (horizontal)', () => {
    const [c1, c2] = line(0, 0, 90, 0).getControlPoints();
    expect(c1).toEqual({ x: 30, y: 0 });
    expect(c2).toEqual({ x: -30, y: 0 });
  });

  it('puts the control points at a third of the chord (diagonal)', () => {
    const [c1, c2] = line(0, 0, 90, 90).getControlPoints();
    expect(c1.x).toBeCloseTo(30);
    expect(c1.y).toBeCloseTo(30);
    expect(c2.x).toBeCloseTo(-30);
    expect(c2.y).toBeCloseTo(-30);
  });

  it('puts the control points at a third of the chord (right to left)', () => {
    const [c1, c2] = line(90, 0, 0, 0).getControlPoints();
    expect(c1).toEqual({ x: -30, y: 0 });
    expect(c2).toEqual({ x: 30, y: 0 });
  });

  // W-DEFCP: when |dx| <= 0.1 the old `div = 0.1` fallback flipped the sign, so the control points
  // pointed away from the target and the curve overshot both ends.
  it('W-DEFCP: vertical line control points point towards the target', () => {
    const [c1, c2] = line(0, 0, 0, 100).getControlPoints();
    expect(c1.x).toBeCloseTo(0);
    expect(c1.y).toBeCloseTo(33.33, 1);
    expect(c2.x).toBeCloseTo(0);
    expect(c2.y).toBeCloseTo(-33.33, 1);
  });

  it('W-DEFCP: near-vertical line stays inside the ends', () => {
    const peer = line(0, 0, 0.05, 100);
    peer.setWidth(0);
    const { minY, maxY } = extent(parsePathPoints(d(peer)));
    expect(minY).toBeGreaterThanOrEqual(0);
    expect(maxY).toBeLessThanOrEqual(100);
  });

  it('recomputes default control points when an end moves', () => {
    const peer = line(0, 0, 90, 0);
    peer.setTo(0, 90);
    const [c1] = peer.getControlPoints();
    expect(c1.y).not.toBe(0);
  });
});

describe('CurvedLinePeer control points (W-CTRLFLAG, BL-69)', () => {
  it('setting a control point does not mark it as custom', () => {
    const peer = line(0, 0, 100, 0);
    peer.setSrcControlPoint({ x: 10, y: 20 });
    peer.setDestControlPoint({ x: -10, y: 20 });
    expect(peer.isSrcControlPointCustom()).toBe(false);
    expect(peer.isDestControlPointCustom()).toBe(false);
  });

  it('the custom flag is set apart', () => {
    const peer = line(0, 0, 100, 0);
    peer.setIsSrcControlPointCustom(true);
    expect(peer.isSrcControlPointCustom()).toBe(true);
    expect(peer.isDestControlPointCustom()).toBe(false);
    peer.setIsDestControlPointCustom(true);
    expect(peer.isDestControlPointCustom()).toBe(true);
  });

  it('a given control point stays relative to its end when the line moves', () => {
    const peer = line(0, 0, 100, 0);
    peer.setSrcControlPoint({ x: 10, y: 20 });
    peer.setDestControlPoint({ x: -10, y: 20 });
    peer.setTo(200, 50);
    expect(peer.getControlPoints()).toEqual([
      { x: 10, y: 20 },
      { x: -10, y: 20 },
    ]);
    peer.setWidth(0);
    expect(d(peer)).toBe('M0.0,0.0 C10.0,20.0 190.0,70.0 200.0,50.0');
  });

  it('copies the control points in and out', () => {
    const peer = line(0, 0, 100, 0);
    const control = { x: 1, y: 2 };
    peer.setSrcControlPoint(control);
    control.x = 99;
    const [c1] = peer.getControlPoints();
    c1.x = 42;
    expect(peer.getControlPoints()[0]).toEqual({ x: 1, y: 2 });
  });

  it('updateLine(true) keeps the current control points', () => {
    const peer = line(0, 0, 90, 0);
    const before = peer.getControlPoints();
    peer.updateLine(true);
    expect(peer.getControlPoints()).toEqual(before);
  });

  it('updateLine(false) re-applies default control points when none were given', () => {
    const peer = line(0, 0, 90, 0);
    peer.updateLine(false);
    expect(peer.getControlPoints()).toEqual([
      { x: 30, y: 0 },
      { x: -30, y: 0 },
    ]);
  });

  // Section 3.3: setSrcControlPoint(null) used to dereference control.x before its own guard.
  it('setSrcControlPoint(null) does not throw', () => {
    const peer = line(0, 0, 90, 0);
    expect(() =>
      peer.setSrcControlPoint(null as unknown as { x: number; y: number }),
    ).not.toThrow();
  });

  it('a null control point is ignored, and keeps the default point', () => {
    const peer = line(0, 0, 90, 0);
    const before = d(peer);
    peer.setSrcControlPoint(null);
    peer.setDestControlPoint(null);
    expect(d(peer)).toBe(before);
    peer.setTo(0, 90);
    expect(peer.getControlPoints()).toEqual([
      { x: 0, y: 30 },
      { x: 0, y: -30 },
    ]);
  });
});

describe('CurvedLinePeer width (taper)', () => {
  it('width < 1 draws an open curve', () => {
    const peer = line(0, 0, 90, 0);
    peer.setWidth(0.5);
    expect(pathCommands(d(peer))).toEqual(['M', 'C']);
  });

  it('width >= 1 draws a closed, filled shape', () => {
    const peer = line(0, 0, 90, 0);
    peer.setWidth(10);
    expect(peer.getWidth()).toBe(10);
    expect(pathCommands(d(peer))).toEqual(['M', 'C', 'C', 'Z']);
  });

  it('the taper of a horizontal line is offset along y', () => {
    const peer = line(0, 0, 90, 0);
    peer.setWidth(10);
    const pts = parsePathPoints(d(peer));
    expect(pts[0]).toEqual([0, -5]);
    expect(pts[pts.length - 1]).toEqual([0, 5]);
    expect(extent(pts).maxY - extent(pts).minY).toBe(10);
  });

  // W-TAPER: the taper used to be offset only along y, so a vertical connection lost all thickness.
  it('W-TAPER: a vertical tapered line has thickness perpendicular to the chord', () => {
    const peer = line(0, 0, 0, 100);
    peer.setSrcControlPoint({ x: 0, y: 30 });
    peer.setDestControlPoint({ x: 0, y: -30 });
    peer.setWidth(10);
    const { minX, maxX } = extent(parsePathPoints(d(peer)));
    expect(maxX - minX).toBeGreaterThanOrEqual(5);
  });

  type P = [number, number];
  const bezier = ([p0, p1, p2, p3]: [P, P, P, P], t: number): P => {
    const u = 1 - t;
    const at = (i: 0 | 1) =>
      u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i];
    return [at(0), at(1)];
  };

  // W-TAPER: the two edges are offset by the same amount, to either side of the centre curve.
  it.each([
    ['a horizontal S-curve', [0, 0, 150, 60], [50, 0], [-50, 0]],
    ['a right-to-left S-curve', [0, 0, -150, 60], [-50, 0], [50, 0]],
    ['a vertical S-curve', [0, 0, 60, 150], [0, 50], [0, -50]],
    ['a straight inclined line', [0, 0, 150, 4], [50, 4 / 3], [-50, -4 / 3]],
  ] as [string, [number, number, number, number], P, P][])(
    'the edges of the taper are symmetric about the centre curve: %s',
    (_name, [x1, y1, x2, y2], src, dest) => {
      const peer = line(x1, y1, x2, y2);
      peer.setSrcControlPoint({ x: src[0], y: src[1] });
      peer.setDestControlPoint({ x: dest[0], y: dest[1] });
      peer.setWidth(10);
      const pts = parsePathPoints(d(peer));
      expect(pts).toHaveLength(7);
      const edgeA = [pts[0], pts[1], pts[2], pts[3]] as [P, P, P, P];
      const edgeB = [pts[6], pts[5], pts[4], pts[3]] as [P, P, P, P];
      const centre: [P, P, P, P] = [
        [x1, y1],
        [x1 + src[0], y1 + src[1]],
        [x2 + dest[0], y2 + dest[1]],
        [x2, y2],
      ];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const a = bezier(edgeA, t);
        const b = bezier(edgeB, t);
        const c = bezier(centre, t);
        // Rounded to one decimal in the path, hence the 0.1 tolerance.
        expect(Math.abs((a[0] + b[0]) / 2 - c[0])).toBeLessThanOrEqual(0.1);
        expect(Math.abs((a[1] + b[1]) / 2 - c[1])).toBeLessThanOrEqual(0.1);
        expect(
          Math.abs(Math.hypot(a[0] - c[0], a[1] - c[1]) - Math.hypot(b[0] - c[0], b[1] - c[1])),
        ).toBeLessThanOrEqual(0.15);
      }
      // Full width at the start, across the tangent there; a point at the end.
      expect(Math.hypot(pts[0]![0] - pts[6]![0], pts[0]![1] - pts[6]![1])).toBeCloseTo(10, 1);
    },
  );

  it('falls back to a vertical offset when every point coincides', () => {
    const peer = line(5, 5, 5, 5);
    peer.setWidth(10);
    const pts = parsePathPoints(d(peer));
    expect(pts[0]).toEqual([5, 0]);
    expect(pts[6]).toEqual([5, 10]);
  });

  it('uses the chord when a control point sits on its end', () => {
    const peer = line(0, 0, 0, 100);
    peer.setSrcControlPoint({ x: 0, y: 0 });
    peer.setDestControlPoint({ x: 0, y: 0 });
    peer.setWidth(10);
    const pts = parsePathPoints(d(peer));
    expect(pts[0]).toEqual([5, 0]);
    expect(pts[6]).toEqual([-5, 0]);
  });

  // The fill does not change the path: setFill used to rebuild and rewrite it anyway.
  it('setFill does not rebuild the path', () => {
    const peer = line(0, 0, 90, 0);
    peer.setWidth(10);
    const d = peer._native.getAttribute('d');
    const spy = jest.spyOn(peer._native, 'setAttribute');
    peer.setFill('red', 1);
    expect(peer._native.getAttribute('fill')).toBe('red');
    expect(spy).not.toHaveBeenCalledWith('d', expect.any(String));
    expect(peer._native.getAttribute('d')).toBe(d);
  });

  it('setWidth rebuilds the path only when the width changes', () => {
    const peer = line(0, 0, 90, 0);
    peer.setWidth(10);
    const spy = jest.spyOn(peer._native, 'setAttribute');
    peer.setWidth(10);
    expect(spy).not.toHaveBeenCalled();
    peer.setWidth(0.5);
    expect(spy).toHaveBeenCalledWith('d', 'M0.0,0.0 C30.0,0.0 60.0,0.0 90.0,0.0');
  });
});

describe('CurvedLinePeer misc', () => {
  it('does not re-render when an end is set to the same value', () => {
    const peer = line(0, 0, 90, 0);
    const spy = jest.spyOn(peer._native, 'setAttribute');
    peer.setFrom(0, 0);
    peer.setTo(90, 0);
    peer.setSrcControlPoint(peer.getControlPoints()[0]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('getFrom/getTo return the ends', () => {
    const peer = line(1, 2, 3, 4);
    expect(peer.getFrom()).toEqual({ x: 1, y: 2 });
    expect(peer.getTo()).toEqual({ x: 3, y: 4 });
  });

  it('setDashed writes a comma separated dash array, and clears it', () => {
    const peer = line(0, 0, 90, 0);
    peer.setDashed(5, 3);
    expect(peer._native.getAttribute('stroke-dasharray')).toBe('5,3');
    peer.setDashed(undefined as unknown as number, undefined as unknown as number);
    expect(peer._native.getAttribute('stroke-dasharray')).toBe('');
  });

  it('setStrokeWidth writes stroke-width', () => {
    const peer = line(0, 0, 90, 0);
    peer.setStrokeWidth(3);
    expect(peer._native.getAttribute('stroke-width')).toBe('3');
  });
});

describe('CurvedLine', () => {
  it('delegates to its peer', () => {
    const curve = new CurvedLine();
    expect(curve.getType()).toBe('CurvedLine');
    expect(curve.getElementClass()).toBe(curve);
    curve.setFrom(0, 0);
    curve.setTo(90, 0);
    expect(curve.getFrom()).toEqual({ x: 0, y: 0 });
    expect(curve.getTo()).toEqual({ x: 90, y: 0 });
    curve.setSrcControlPoint({ x: 5, y: 5 });
    curve.setDestControlPoint({ x: -5, y: 5 });
    expect(curve.getControlPoints()).toEqual([
      { x: 5, y: 5 },
      { x: -5, y: 5 },
    ]);
    curve.setIsSrcControlPointCustom(true);
    curve.setIsDestControlPointCustom(true);
    expect(curve.isSrcControlPointCustom()).toBe(true);
    expect(curve.isDestControlPointCustom()).toBe(true);
    curve.setWidth(4);
    expect(curve.getWidth()).toBe(4);
    curve.setDashed(2, 2);
    expect(curve.peer._native.getAttribute('stroke-dasharray')).toBe('2,2');
    curve.updateLine();
  });

  it('applies its default stroke', () => {
    const curve = new CurvedLine();
    expect(curve.peer._native.getAttribute('stroke')).toBe('blue');
    expect(curve.peer._native.getAttribute('stroke-width')).toBe('1');
  });

  it('rejects NaN ends', () => {
    const curve = new CurvedLine();
    expect(() => curve.setFrom(Number.NaN, 0)).toThrow();
    expect(() => curve.setTo(0, Number.NaN)).toThrow();
  });
});
