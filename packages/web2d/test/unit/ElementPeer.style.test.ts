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
    ['dash', '5 5', ''],
    ['dot', '1 8', 'round'],
    ['dashdot', '10 5 2', 'round'],
    ['longdash', '10 5 2', 'round'],
  ])('characterization: style %s uses dash array "%s"', (style, dash, cap) => {
    const p = peer();
    p.setStroke(1, style);
    expect(attr(p, 'stroke-dasharray')).toBe(dash);
    expect(attr(p, 'stroke-linecap')).toBe(cap);
  });

  it('characterization: solid writes empty dash array and line cap', () => {
    const p = peer();
    p.setStroke(1, 'dash');
    p.setStroke(1, 'solid');
    expect(attr(p, 'stroke-dasharray')).toBe('');
    expect(attr(p, 'stroke-linecap')).toBe('');
  });

  // Section 3.4: 'solid' writes invalid empty values instead of removing the attributes.
  it.failing('solid removes the dash array and line cap', () => {
    const p = peer();
    p.setStroke(1, 'dash');
    p.setStroke(1, 'solid');
    expect(p._native.hasAttribute('stroke-dasharray')).toBe(false);
    expect(p._native.hasAttribute('stroke-linecap')).toBe(false);
  });

  // W-DASH: dashdot and longdash are both "10 5 2".
  it.failing('W-DASH: dashdot and longdash differ', () => {
    const a = peer();
    const b = peer();
    a.setStroke(1, 'dashdot');
    b.setStroke(1, 'longdash');
    expect(attr(a, 'stroke-dasharray')).not.toBe(attr(b, 'stroke-dasharray'));
  });

  // W-DASH: there are two dash tables, so the same style renders differently per line type.
  it.failing('W-DASH: the same style gives the same dash array on every element type', () => {
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

  it('characterization: getStroke returns strings', () => {
    const p = peer();
    p.setStroke(2, 'dot', 'red', 0.5);
    expect(p.getStroke()).toEqual({ color: 'red', style: 'dot', opacity: '0.5', width: '2' });
  });

  it('updateStrokeStyle re-applies a non-solid style once attached', () => {
    const parent = peer();
    const p = peer();
    p.setStroke(1, 'dash');
    p._native.removeAttribute('stroke-dasharray');
    p.updateStrokeStyle();
    expect(attr(p, 'stroke-dasharray')).toBeNull();
    parent.append(p);
    p.updateStrokeStyle();
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

  // Section 3.4: getFill reports opacity 0 when fill-opacity is unset.
  it.failing('getFill defaults the opacity to 1', () => {
    const p = peer();
    p.setFill('green');
    expect(p.getFill()).toEqual({ color: 'green', opacity: 1 });
  });
});

describe('ElementPeer size', () => {
  it('writes rounded width and height, keeps the exact cache', () => {
    const p = peer();
    p.setSize(10.6, 20.2);
    expect(attr(p, 'width')).toBe('11');
    expect(attr(p, 'height')).toBe('20');
    expect(p.getSize()).toEqual({ width: 10.6, height: 20.2 });
  });
});

describe('opacity and visibility', () => {
  it('WorkspaceElement.setOpacity writes fill-opacity and stroke-opacity', () => {
    const rect = new Rect(0);
    rect.setOpacity(0.25);
    expect(attr(rect.peer, 'fill-opacity')).toBe('0.25');
    expect(attr(rect.peer, 'stroke-opacity')).toBe('0.25');
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

  // W-OPACITY: setVisibility writes inline style.opacity, which overrides Group.setOpacity.
  it.failing('W-OPACITY: setVisibility(true) keeps the opacity set before', () => {
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
