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
import Point from '../../src/components/Point';
import {
  getOffset,
  getPosition,
  getPositionIn,
  getStyle,
} from '../../src/components/peer/utils/DomUtils';
import { $assert, $defined } from '../../src/components/peer/utils/assert';

describe('Point', () => {
  it('parses "x,y"', () => {
    const p = Point.fromString('3,4');
    expect(p).toBeInstanceOf(Point);
    expect([p.x, p.y]).toEqual([3, 4]);
  });

  it('characterization: parses integers only', () => {
    const p = Point.fromString('3.7,-4.2');
    expect([p.x, p.y]).toEqual([3, -4]);
  });

  it.each(['', '3', '3,4,5', 'a,b', '3,'])('rejects "%s"', (value) => {
    expect(() => Point.fromString(value)).toThrow('String could not be parsed as point');
  });

  it('clones and inspects', () => {
    const p = new Point(1, 2);
    const c = p.clone();
    expect(c).not.toBe(p);
    expect(c).toEqual(p);
    expect(p.inspect()).toBe('{x:1,y:2}');
  });

  it('rejects non-numbers', () => {
    expect(() => new Point('1' as unknown as number, 2)).toThrow('x is not a number');
  });

  // Point.ts:26-27: the assert message for y said "x is not a number".
  it('names y in the y assert message', () => {
    expect(() => new Point(1, '2' as unknown as number)).toThrow('y is not a number');
  });
});

describe('assert', () => {
  it('$defined', () => {
    expect($defined(0)).toBe(true);
    expect($defined(null)).toBe(false);
    expect($defined(undefined)).toBe(false);
  });

  it('$assert throws with the message', () => {
    expect(() => $assert(false, 'boom')).toThrow('boom');
    expect(() => $assert(null, 'boom')).toThrow('boom');
    expect(() => $assert(1, 'boom')).not.toThrow();
  });
});

describe('DomUtils', () => {
  const mockRect = (el: Element, top: number, left: number) => {
    el.getClientRects = () => [{}] as unknown as DOMRectList;
    el.getBoundingClientRect = () => ({ top, left }) as DOMRect;
  };

  it('getStyle parses px values, stringifies others', () => {
    const div = document.createElement('div');
    div.style.width = '12px';
    div.style.display = 'block';
    document.body.append(div);
    expect(getStyle(div, 'width')).toBe(12);
    expect(getStyle(div, 'display')).toBe('block');
    div.remove();
  });

  it('getOffset of a missing or unrendered element is 0,0', () => {
    expect(getOffset(null)).toEqual({ top: 0, left: 0 });
    expect(getOffset(document.createElement('div'))).toEqual({ top: 0, left: 0 });
  });

  it('getOffset adds the page scroll', () => {
    const div = document.createElement('div');
    mockRect(div, 10, 20);
    expect(getOffset(div)).toEqual({ top: 10 + window.pageYOffset, left: 20 + window.pageXOffset });
  });

  it('getPosition of a fixed element is its viewport position', () => {
    const div = document.createElement('div');
    div.style.position = 'fixed';
    document.body.append(div);
    mockRect(div, 7, 8);
    expect(getPosition(div)).toEqual({ top: 7, left: 8 });
    div.remove();
  });

  it('getPosition subtracts a positioned offset parent', () => {
    const parent = document.createElement('div');
    parent.style.position = 'relative';
    const child = document.createElement('div');
    child.style.marginTop = '2px';
    child.style.marginLeft = '3px';
    parent.append(child);
    document.body.append(parent);
    Object.defineProperty(child, 'offsetParent', { value: parent });
    mockRect(parent, 100, 50);
    mockRect(child, 130, 90);
    expect(getPosition(child)).toEqual({ top: 28, left: 37 });
    parent.remove();
  });

  // W-NATIVEPOS: an 'auto' margin or a non-length border gave NaN.
  it('getPosition treats non-length margins and borders as 0', () => {
    const parent = document.createElement('div');
    parent.style.position = 'relative';
    parent.style.borderTopWidth = 'medium';
    const child = document.createElement('div');
    child.style.marginTop = 'auto';
    parent.append(child);
    document.body.append(parent);
    Object.defineProperty(child, 'offsetParent', { value: parent });
    mockRect(parent, 100, 50);
    mockRect(child, 130, 90);
    const { top, left } = getPosition(child);
    expect(Number.isNaN(top)).toBe(false);
    expect(left).toBe(40);
    parent.remove();
  });

  // W-NATIVEPOS: an SVG element has no offsetParent, so getPosition gave document coordinates.
  it('getPosition of an SVG element is relative to the container passed in', () => {
    const container = document.createElement('div');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    container.append(svg);
    document.body.append(container);
    container.getBoundingClientRect = () => ({ top: 100, left: 50 }) as DOMRect;
    Object.defineProperty(container, 'clientTop', { value: 2 });
    Object.defineProperty(container, 'clientLeft', { value: 3 });
    Object.defineProperty(container, 'scrollTop', { value: 10 });
    Object.defineProperty(container, 'scrollLeft', { value: 0 });
    svg.getBoundingClientRect = () => ({ top: 130, left: 90 }) as DOMRect;
    expect(getPosition(svg, container)).toEqual({ top: 38, left: 37 });
    expect(getPositionIn(svg, container)).toEqual({ top: 38, left: 37 });
    container.remove();
  });
});
