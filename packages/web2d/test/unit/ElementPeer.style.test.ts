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
import RectPeer from '../../src/components/peer/svg/RectPeer';
import WorkspacePeer from '../../src/components/peer/svg/WorkspacePeer';
import ImagePeer from '../../src/components/peer/svg/ImagePeer';
import GroupPeer from '../../src/components/peer/svg/GroupPeer';
import TextPeer from '../../src/components/peer/svg/TextPeer';
import FontPeer from '../../src/components/peer/svg/FontPeer';
import ElipsePeer from '../../src/components/peer/svg/ElipsePeer';
import StraightLinePeer from '../../src/components/peer/svg/StraightPeer';
import PolyLinePeer from '../../src/components/peer/svg/PolyLinePeer';
import CurvedLinePeer from '../../src/components/peer/svg/CurvedLinePeer';
import ArcLinePeer from '../../src/components/peer/svg/ArcLinePeer';
import ArrowPeer from '../../src/components/peer/svg/ArrowPeer';
import NeuronLinePeer from '../../src/components/peer/svg/NeuronLinePeer';
import type { StrokeStyle } from '../../src/components/types';

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
    p.setStroke(1, style as StrokeStyle);
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
      rect.setStroke(1, style as StrokeStyle);
      heartbeat.setStroke(1, style as StrokeStyle);
      expect(attr(rect, 'stroke-dasharray')).toBe(attr(heartbeat, 'stroke-dasharray'));
    });
  });

  // BL5-77: the dash lengths did not scale with the stroke width, so a thick dashed stroke closed
  // its gaps. The table is for width 1, which renders as before.
  describe('BL5-77: dash lengths scale with the stroke width', () => {
    const TABLE: [string, number[]][] = [
      ['dash', [5, 5]],
      ['dot', [1, 8]],
      ['longdash', [10, 5]],
      ['dashdot', [10, 5, 1, 5]],
    ];
    const CASES = TABLE.flatMap(([style, lengths]) =>
      [1, 2, 4].map((width) => [style, width, lengths.map((l) => l * width).join(' ')]),
    ) as [string, number, string][];

    it.each(CASES)('style %s at width %d is "%s"', (style, width, expected) => {
      const p = peer();
      p.setStroke(width, style as StrokeStyle);
      expect(attr(p, 'stroke-dasharray')).toBe(expected);
      // The same on every element type that uses the shared table.
      const heartbeat = new HeartbeatLinePeer();
      heartbeat.setStroke(width, style as StrokeStyle);
      expect(attr(heartbeat, 'stroke-dasharray')).toBe(expected);
      const neuron = new NeuronLinePeer();
      neuron.setStroke(width, style as StrokeStyle);
      expect(attr(neuron, 'stroke-dasharray')).toBe(expected);
    });

    it.each(CASES)('style %s set first, then width %d, is "%s"', (style, width, expected) => {
      const p = peer();
      p.setStroke(1, style as StrokeStyle);
      p.setStroke(width);
      expect(attr(p, 'stroke-dasharray')).toBe(expected);
    });

    it('width 1 renders exactly the table', () => {
      TABLE.forEach(([style, lengths]) => {
        const p = peer();
        p.setStroke(1, style as StrokeStyle);
        expect(attr(p, 'stroke-dasharray')).toBe(lengths.join(' '));
      });
    });

    it('a style without a width scales with the width already written, or 1', () => {
      const p = peer();
      p.setStroke(null, 'dash');
      expect(attr(p, 'stroke-dasharray')).toBe('5 5');
      p.setStroke(3);
      p.setStroke(null, 'dot');
      expect(attr(p, 'stroke-dasharray')).toBe('3 24');
    });

    it('rounds fractional lengths to 2 decimals', () => {
      const p = peer();
      p.setStroke(1.333, 'dash');
      expect(attr(p, 'stroke-dasharray')).toBe('6.67 6.67');
    });

    it.each([
      ['CurvedLinePeer', () => new CurvedLinePeer()],
      ['ArcLinePeer', () => new ArcLinePeer()],
      ['PolyLinePeer', () => new PolyLinePeer()],
    ] as [string, () => CurvedLinePeer | ArcLinePeer | PolyLinePeer][])(
      '%s.setStrokeWidth rescales the dash',
      (_name, create) => {
        const p = create();
        p.setStroke(1, 'dash');
        p.setStrokeWidth(2);
        expect(attr(p, 'stroke-width')).toBe('2');
        expect(attr(p, 'stroke-dasharray')).toBe('10 10');
      },
    );

    it('a new width leaves a dash written by setDashed alone', () => {
      const curve = new CurvedLinePeer();
      curve.setStroke(2, 'solid');
      curve.setDashed(8, 4);
      curve.setStroke(5);
      expect(attr(curve, 'stroke-dasharray')).toBe('8,4');
      const arrow = new ArrowPeer();
      arrow.setStroke(1, 'dash');
      arrow.setDashed(true, 3, 3);
      arrow.setStrokeWidth(4);
      expect(attr(arrow, 'stroke-dasharray')).toBe('3,3');
    });

    it('a new width after solid writes no dash', () => {
      const p = peer();
      p.setStroke(1, 'solid');
      p.setStroke(4);
      expect(p._native.hasAttribute('stroke-dasharray')).toBe(false);
    });
  });

  it('rejects unknown styles', () => {
    expect(() => peer().setStroke(1, 'wavy' as unknown as StrokeStyle)).toThrow(
      'Unsupported style: wavy',
    );
    expect(() => new Rect(0).setStroke(1, 'wavy' as unknown as StrokeStyle)).toThrow(
      "Unsupported stroke style: 'wavy'",
    );
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
    const p = new RectPeer(0);
    p.setSize(10.6, 20.256);
    expect(attr(p, 'width')).toBe('10.6');
    expect(attr(p, 'height')).toBe('20.26');
    expect(p.getSize()).toEqual({ width: 10.6, height: 20.256 });
    p.setSize(-0.001, 40);
    expect(attr(p, 'width')).toBe('0');
    expect(attr(p, 'height')).toBe('40');
  });

  it.each([
    ['svg', () => new WorkspacePeer(), true],
    ['rect', () => new RectPeer(0), true],
    ['image', () => new ImagePeer(), true],
    ['g', () => new GroupPeer(), false],
    ['text', () => new TextPeer(new FontPeer('Arial')), false],
    ['ellipse', () => new ElipsePeer(), false],
    ['line', () => new StraightLinePeer(), false],
    ['polyline', () => new PolyLinePeer(), false],
    ['path', () => new CurvedLinePeer(), false],
  ] as [string, () => ElementPeer, boolean][])(
    '<%s> writes width and height attributes: %s',
    (tag, create, written) => {
      const p = create();
      expect(p._native.localName).toBe(tag);
      p.setSize(30, 40);
      expect(p.getSize()).toEqual({ width: 30, height: 40 });
      expect(attr(p, 'width')).toBe(written ? '30' : null);
      expect(attr(p, 'height')).toBe(written ? '40' : null);
    },
  );
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
