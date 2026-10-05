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
import ElementPeer from '../../src/components/peer/svg/ElementPeer';
import HeartbeatLinePeer from '../../src/components/peer/svg/HeartbeatLinePeer';
import Rect from '../../src/components/Rect';
import Group from '../../src/components/Group';
import Workspace from '../../src/components/Workspace';

const peer = () => new ElementPeer(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
const attr = (p: ElementPeer, name: string) => p._native.getAttribute(name);

describe('ElementPeer stroke', () => {
  it('writes width, colour and opacity', () => {
    const p = peer();
    p.setStroke(2, 'solid', 'red', 0.5);
    expect(attr(p, 'stroke-width')).toBe('2');
    expect(attr(p, 'stroke')).toBe('red');
    expect(attr(p, 'stroke-opacity')).toBe('0.5');
  });

  it.each([
    ['dash', '5 5', null],
    ['dot', '1 8', 'round'],
    ['dashdot', '10 5 1 5', 'round'],
    ['longdash', '10 5', 'round'],
  ])('style %s uses dash array "%s"', (style, dash, cap) => {
    const p = peer();
    p.setStroke(1, 'dot');
    p.setStroke(1, style);
    expect(attr(p, 'stroke-dasharray')).toBe(dash);
    expect(attr(p, 'stroke-linecap')).toBe(cap);
  });

  // Section 3.4: 'solid' wrote invalid empty values instead of removing the attributes.
  it('solid removes the dash array and line cap', () => {
    const p = peer();
    p.setStroke(1, 'dash');
    p.setStroke(1, 'solid');
    expect(p._native.hasAttribute('stroke-dasharray')).toBe(false);
    expect(p._native.hasAttribute('stroke-linecap')).toBe(false);
  });

  // W-DASH: dashdot and longdash were both "10 5 2".
  it('W-DASH: dashdot and longdash differ', () => {
    const a = peer();
    const b = peer();
    a.setStroke(1, 'dashdot');
    b.setStroke(1, 'longdash');
    expect(attr(a, 'stroke-dasharray')).not.toBe(attr(b, 'stroke-dasharray'));
  });

  // W-DASH: there were two dash tables, so the same style rendered differently per line type.
  it('W-DASH: the same style gives the same dash array on every element type', () => {
    ['dash', 'dot', 'dashdot', 'longdash'].forEach((style) => {
      const rect = peer();
      const heartbeat = new HeartbeatLinePeer();
      rect.setStroke(1, style);
      heartbeat.setStroke(1, style);
      expect(attr(rect, 'stroke-dasharray')).toBe(attr(heartbeat, 'stroke-dasharray'));
    });
  });

  it('rejects unknown styles', () => {
    expect(() => peer().setStroke(1, 'wavy')).toThrow('Unsupported style: wavy');
    expect(() => new Rect(0).setStroke(1, 'wavy')).toThrow("Unsupported stroke style: 'wavy'");
  });

  it('getStroke returns numbers, like getFill', () => {
    const p = peer();
    p.setStroke(2, 'dot', 'red', 0.5);
    expect(p.getStroke()).toEqual({ color: 'red', style: 'dot', opacity: 0.5, width: 2 });
  });

  it('getStroke defaults: no width, opacity 1', () => {
    expect(peer().getStroke()).toEqual({ color: null, style: null, opacity: 1, width: null });
  });

  it('the dash table getter returns a copy', () => {
    const table = ElementPeer.stokeStyleToStrokDasharray();
    table.dash.push(99);
    expect(ElementPeer.stokeStyleToStrokDasharray().dash).toEqual([5, 5]);
  });

  // The VML-era broadcast re-applied dash strokes after a reparent. SVG keeps its attributes.
  it('a dash style survives being appended and reparented', () => {
    const a = peer();
    const b = peer();
    const p = peer();
    p.setStroke(1, 'dash');
    a.append(p);
    a.removeChild(p);
    b.append(p);
    expect(attr(p, 'stroke-dasharray')).toBe('5 5');
  });
});

describe('ElementPeer fill', () => {
  it('writes colour and opacity', () => {
    const p = peer();
    p.setFill('green', 0.3);
    expect(p.getFill()).toEqual({ color: 'green', opacity: 0.3 });
  });

  it('a null colour keeps the previous colour', () => {
    const p = peer();
    p.setFill('green');
    p.setFill(null, 1);
    expect(attr(p, 'fill')).toBe('green');
  });

  // Section 3.4: getFill reported opacity 0 when fill-opacity was unset.
  it('getFill defaults the opacity to 1', () => {
    const p = peer();
    p.setFill('green');
    expect(p.getFill()).toEqual({ color: 'green', opacity: 1 });
  });
});

describe('ElementPeer size', () => {
  it('writes width and height with at most 2 decimals, keeps the exact cache', () => {
    const p = peer();
    p.setSize(10.6, 20.256);
    expect(attr(p, 'width')).toBe('10.6');
    expect(attr(p, 'height')).toBe('20.26');
    expect(p.getSize()).toEqual({ width: 10.6, height: 20.256 });
    p.setSize(-0.001, 40);
    expect(attr(p, 'width')).toBe('0');
    expect(attr(p, 'height')).toBe('40');
  });
});

describe('opacity and visibility', () => {
  it('WorkspaceElement.setOpacity sets the element opacity, not the fill and stroke ones', () => {
    const rect = new Rect(0);
    rect.setOpacity(0.25);
    expect(rect.peer._native.style.opacity).toBe('0.25');
    expect(rect.peer.getOpacity()).toBe(0.25);
    expect(attr(rect.peer, 'fill-opacity')).toBeNull();
    expect(attr(rect.peer, 'stroke-opacity')).toBeNull();
    // A later stroke opacity does not undo it.
    rect.setStroke(1, 'solid', 'red', 1);
    expect(rect.peer._native.style.opacity).toBe('0.25');
  });

  it('setOpacity on a hidden element is applied when it is shown', () => {
    const rect = new Rect(0);
    rect.setVisibility(false);
    rect.setOpacity(0.4);
    expect(rect.peer._native.style.opacity).toBe('0');
    rect.setVisibility(true);
    expect(rect.peer._native.style.opacity).toBe('0.4');
  });

  it('setVisibility(false) hides through the attribute and style opacity', () => {
    const rect = new Rect(0);
    rect.setVisibility(false);
    expect(rect.isVisible()).toBe(false);
    expect(attr(rect.peer, 'visibility')).toBe('hidden');
    expect(rect.peer._native.style.opacity).toBe('0');
    expect(rect.peer._native.style.transition).toBe('');
    rect.setVisibility(true);
    expect(rect.isVisible()).toBe(true);
    expect(rect.peer._native.style.opacity).toBe('1');
  });

  it('setVisibility with a fade sets a transition', () => {
    const rect = new Rect(0);
    rect.setVisibility(false, 300);
    expect(rect.peer._native.style.transition).toBe('visibility 300ms, opacity 300ms');
  });

  it('an element is visible by default', () => {
    expect(new Rect(0).isVisible()).toBe(true);
  });

  // W-OPACITY: setVisibility wrote inline style.opacity 1, which overrode Group.setOpacity.
  it('W-OPACITY: setVisibility(true) keeps the opacity set before', () => {
    const workspace = new Workspace();
    const group = new Group();
    workspace.append(group);
    group.setOpacity(0.5);
    group.setVisibility(true);
    const node = group.peer._native;
    const effective = node.style.opacity !== '' ? node.style.opacity : node.getAttribute('opacity');
    expect(effective).toBe('0.5');
  });
});
