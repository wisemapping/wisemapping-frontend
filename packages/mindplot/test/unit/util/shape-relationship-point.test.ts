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
import Topic from '../../../src/components/Topic';
import Shape from '../../../src/components/util/Shape';

/**
 * Where a relationship leaves a topic: on the side of the topic box facing the
 * control point, 5 px out, along the line from the topic centre to the control
 * point. A nearly horizontal, vertical or diagonal line leaves from the middle
 * of the side.
 */
describe('Shape.calculateRelationShipPointCoordinates', () => {
  // A 100 x 40 topic centred on (0, 0): its box spans x -50..50 and y -20..20.
  const topic = {
    getSize: () => ({ width: 100, height: 40 }),
    getPosition: () => ({ x: 0, y: 0 }),
  } as unknown as Topic;
  const point = (x: number, y: number) =>
    Shape.calculateRelationShipPointCoordinates(topic, { x, y });

  it('leaves from the bottom, along the line to a control point below', () => {
    const result = point(40, 100);
    expect(result.y).toBe(25);
    // On the line through (0, 0) and (40, 100).
    expect(result.x).toBeCloseTo(10);
  });

  it('leaves from the top, along the line to a control point above', () => {
    const result = point(-40, -100);
    expect(result.y).toBe(-25);
    expect(result.x).toBeCloseTo(-10);
  });

  it('clamps the exit point to the box width', () => {
    expect(point(400, 100)).toEqual({ x: 50, y: 25 });
    expect(point(-400, 100)).toEqual({ x: -50, y: 25 });
    expect(point(400, -100)).toEqual({ x: 50, y: -25 });
    expect(point(-400, -100)).toEqual({ x: -50, y: -25 });
  });

  it('leaves from the left or right side for a control point level with the box', () => {
    const left = point(-200, 10);
    expect(left.x).toBe(-55);
    expect(left.y).toBeCloseTo(10 * (55 / 200));

    const right = point(200, -10);
    expect(right.x).toBe(55);
    expect(right.y).toBeCloseTo(-10 * (55 / 200));
  });

  it('leaves from the middle of the side for an almost axis-aligned line', () => {
    // Nearly horizontal: |dy| < 5.
    expect(point(200, 3)).toEqual({ x: 55, y: 0 });
    expect(point(-200, -3)).toEqual({ x: -55, y: 0 });
    // Nearly vertical: |dx| < 5.
    expect(point(2, 100)).toEqual({ x: 0, y: 25 });
    expect(point(-2, -100)).toEqual({ x: 0, y: -25 });
  });

  it('leaves from the middle of the side for a diagonal line', () => {
    // dx and dy are within 5 px of each other.
    expect(point(100, 102)).toEqual({ x: 0, y: 25 });
  });

  it('works for a topic away from the origin', () => {
    const moved = {
      getSize: () => ({ width: 100, height: 40 }),
      getPosition: () => ({ x: 300, y: 200 }),
    } as unknown as Topic;
    const result = Shape.calculateRelationShipPointCoordinates(moved, { x: 340, y: 300 });
    expect(result.y).toBe(225);
    expect(result.x).toBeCloseTo(310);
  });
});
