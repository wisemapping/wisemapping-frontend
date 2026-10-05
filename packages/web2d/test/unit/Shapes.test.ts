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
import Group from '../../src/components/Group';
import Text from '../../src/components/Text';
import Rect from '../../src/components/Rect';
import Ellipse from '../../src/components/Ellipse';
import Image from '../../src/components/Image';
import ImagePeer from '../../src/components/peer/svg/ImagePeer';

const XLINK = 'http://www.w3.org/1999/xlink';

describe('Rect', () => {
  it('keeps 2 decimals for the position and size, like lines; rx/ry from the arc', () => {
    const rect = new Rect(0.5, { width: 100, height: 41 });
    rect.setPosition(1.4, 2.666);
    const node = rect.peer._native;
    expect(rect.getType()).toBe('Rect');
    expect(rect.getPosition()).toEqual({ x: 1.4, y: 2.666 });
    expect(node.getAttribute('x')).toBe('1.4');
    expect(node.getAttribute('y')).toBe('2.67');
    expect(rect.getSize()).toEqual({ width: 100, height: 41 });
    expect(node.getAttribute('rx')).toBe('10.25');
    expect(node.getAttribute('ry')).toBe('10.25');
  });

  it('rejects an arc above 1', () => {
    expect(() => new Rect(2)).toThrow('Arc must be 0<=arc<=1');
  });

  // Section 3.4: RectPeer.getPosition parsed the attribute and returned NaN when it was unset.
  it('getPosition of a rect without a position is a number', () => {
    const rect = new Rect(0, {});
    rect.peer._native.removeAttribute('x');
    rect.peer._native.removeAttribute('y');
    expect(Number.isNaN(rect.getPosition().x)).toBe(false);
  });

  it('getPosition of a new rect peer is the origin, and a copy', () => {
    const rect = new Rect(0, { x: 7, y: 8 });
    (rect.getPosition() as { x: number }).x = 99;
    expect(rect.getPosition()).toEqual({ x: 7, y: 8 });
  });
});

describe('Ellipse', () => {
  it('writes centre and radii with 2 decimals', () => {
    const ellipse = new Ellipse();
    ellipse.setPosition(10.4, 20.6);
    ellipse.setSize(30, 11);
    const node = ellipse.peer._native;
    expect(ellipse.getType()).toBe('Ellipse');
    expect(node.getAttribute('cx')).toBe('10.4');
    expect(node.getAttribute('cy')).toBe('20.6');
    expect(node.getAttribute('rx')).toBe('15');
    expect(node.getAttribute('ry')).toBe('5.5');
    expect(ellipse.getPosition()).toEqual({ x: 10.4, y: 20.6 });
    expect(ellipse.getSize()).toEqual({ width: 30, height: 11 });
  });

  it('characterization: defaults', () => {
    const node = new Ellipse().peer._native;
    expect(node.getAttribute('fill')).toBe('blue');
    expect(node.getAttribute('stroke')).toBe('black');
    expect(node.getAttribute('rx')).toBe('20');
  });
});

describe('Image', () => {
  it('writes href (xlink), position and size', () => {
    const image = new Image();
    image.setHref('https://example.com/a.png');
    image.setPosition(5, 6);
    image.setSize(16, 24);
    const node = image.peer._native;
    expect(image.getType()).toBe('Image');
    expect(node.getAttributeNS(XLINK, 'href')).toBe('https://example.com/a.png');
    expect(image.getHref()).toBe('https://example.com/a.png');
    expect(node.getAttribute('x')).toBe('5');
    expect(node.getAttribute('y')).toBe('6');
    expect(node.getAttribute('width')).toBe('16');
    expect(node.getAttribute('height')).toBe('24');
    expect(node.getAttribute('preserveAspectRatio')).toBe('none');
    expect(image.getPosition()).toEqual({ x: 5, y: 6 });
    expect(image.getSize()).toEqual({ width: 16, height: 24 });
  });

  it('accepts attributes', () => {
    const image = new Image({ width: 10, height: 12, x: 1, y: 2 });
    expect(image.getSize()).toEqual({ width: 10, height: 12 });
    expect(image.getPosition()).toEqual({ x: 1, y: 2 });
  });

  it('starts at the origin, with no href', () => {
    const peer = new ImagePeer();
    expect(peer.getPosition()).toEqual({ x: 0, y: 0 });
    expect(peer.getHref()).toBe('');
  });
});

// Typing T7: getPosition() hands out a copy, so a caller cannot change the element through it.
describe.each([
  ['Text', () => new Text()],
  ['Image', () => new Image()],
  ['Ellipse', () => new Ellipse()],
] as [string, () => Text | Image | Ellipse][])('%s getPosition (typing T7)', (_name, create) => {
  it('returns a copy', () => {
    const element = create();
    element.setPosition(7, 8);
    (element.getPosition() as { x: number }).x = 99;
    expect(element.getPosition()).toEqual({ x: 7, y: 8 });
  });
});

// W4: element methods for what mindplot read from the peers (WEB2D_REVIEW_PLAN 3.7).
describe('element APIs instead of peer reach-ins (W4)', () => {
  it('getNode returns the SVG node of the element', () => {
    const rect = new Rect(0);
    expect(rect.getNode()).toBe(rect.peer._native);
    expect(rect.getNode().tagName).toBe('rect');
  });

  it('Group.contains tells whether an element was appended and not removed', () => {
    const group = new Group();
    const text = new Text();
    expect(group.contains(text)).toBe(false);
    group.append(text);
    expect(group.contains(text)).toBe(true);
    group.removeChild(text);
    expect(group.contains(text)).toBe(false);
  });

  it('Group.isLastChild tells whether an element is the front child', () => {
    const group = new Group();
    const back = new Rect(0);
    const front = new Text();
    group.append(back);
    group.append(front);
    expect(group.isLastChild(front)).toBe(true);
    expect(group.isLastChild(back)).toBe(false);
    // A node appended around web2d is in front in the DOM: the element is no longer the last.
    group.appendDomChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
    expect(group.isLastChild(front)).toBe(false);
  });

  it('Text.getLineCount counts the lines', () => {
    const text = new Text();
    expect(text.getLineCount()).toBe(0);
    text.setText('a\nb\r\nc');
    expect(text.getLineCount()).toBe(3);
  });
});
