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
import ArcLinePeer from '../../src/components/peer/svg/ArcLinePeer';
import ArcLine from '../../src/components/ArcLine';
import { parsePathPoints, pathCommands } from '../helpers/geometry';

const arc = (orientation: 'horizontal' | 'vertical', x2: number, y2: number): string | null => {
  const peer = new ArcLinePeer();
  peer.setOrientation(orientation);
  peer.setFrom(0, 0);
  peer.setTo(x2, y2);
  return peer._native.getAttribute('d');
};

describe('ArcLinePeer', () => {
  it('characterization: horizontal (0,0)->(100,100)', () => {
    expect(arc('horizontal', 100, 100)).toBe('M0.0,0.0  C0.0,12.5 ,0.0,100.0  100.0,100.0 ');
  });

  it('characterization: vertical (0,0)->(100,100)', () => {
    expect(arc('vertical', 100, 100)).toBe('M0.0,0.0  C12.5,0.0 ,100.0,0.0  100.0,100.0 ');
  });

  it.each([
    [100, 100],
    [-100, -100],
    [100, -100],
    [-100, 100],
    [100, 0],
    [0, 100],
  ])('is one cubic from the start to the end (%d,%d), both orientations', (x2, y2) => {
    (['horizontal', 'vertical'] as const).forEach((o) => {
      const d = arc(o, x2, y2);
      expect(pathCommands(d)).toEqual(['M', 'C']);
      const pts = parsePathPoints(d);
      expect(pts).toHaveLength(4);
      expect(pts[0]).toEqual([0, 0]);
      expect(pts[3]).toEqual([x2, y2]);
    });
  });

  it('horizontal arcs bend vertically first: the second control point sits at x1', () => {
    const pts = parsePathPoints(arc('horizontal', 80, -40));
    expect(pts[1]).toEqual([0, -5]);
    expect(pts[2]).toEqual([0, -40]);
  });

  it('vertical arcs bend horizontally first: the second control point sits at y1', () => {
    const pts = parsePathPoints(arc('vertical', 80, -40));
    expect(pts[1]).toEqual([10, 0]);
    expect(pts[2]).toEqual([80, 0]);
  });

  it('does not re-render when an end is unchanged', () => {
    const peer = new ArcLinePeer();
    peer.setTo(10, 10);
    const spy = jest.spyOn(peer._native, 'setAttribute');
    peer.setFrom(0, 0);
    peer.setTo(10, 10);
    expect(spy).not.toHaveBeenCalled();
  });

  it('keeps the ends, orientation and stroke width', () => {
    const peer = new ArcLinePeer();
    peer.setFrom(1, 2);
    peer.setTo(3, 4);
    peer.setStrokeWidth(2);
    expect(peer.getFrom()).toEqual({ x: 1, y: 2 });
    expect(peer.getTo()).toEqual({ x: 3, y: 4 });
    expect(peer.getOrientation()).toBe('horizontal');
    expect(peer._native.getAttribute('stroke-width')).toBe('2');
  });
});

describe('ArcLine', () => {
  it('delegates to its peer', () => {
    const line = new ArcLine();
    expect(line.getType()).toBe('ArcLine');
    expect(line.getElementClass()).toBe(line);
    line.setOrientation('vertical');
    expect(line.getOrientation()).toBe('vertical');
    line.setFrom(0, 0);
    line.setTo(100, 100);
    expect(line.getFrom()).toEqual({ x: 0, y: 0 });
    expect(line.getTo()).toEqual({ x: 100, y: 100 });
    expect(line.peer._native.getAttribute('fill')).toBe('none');
    expect(line.peer._native.getAttribute('stroke')).toBe('blue');
  });

  it('rejects NaN ends', () => {
    const line = new ArcLine();
    expect(() => line.setFrom(Number.NaN, 0)).toThrow();
    expect(() => line.setTo(0, Number.NaN)).toThrow();
  });

  it.each([
    'setIsSrcControlPointCustom',
    'setIsDestControlPointCustom',
    'setDashed',
    'setSrcControlPoint',
    'setDestControlPoint',
    'isDestControlPointCustom',
    'isSrcControlPointCustom',
    'getControlPoints',
  ])('characterization: %s is a throwing Line stub (typing step T5)', (method) => {
    const line = new ArcLine() as unknown as Record<string, () => unknown>;
    expect(() => line[method]!()).toThrow('Method not implemented.');
  });
});
