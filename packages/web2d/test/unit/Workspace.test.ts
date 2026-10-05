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
import Workspace from '../../src/components/Workspace';
import WorkspacePeer from '../../src/components/peer/svg/WorkspacePeer';
import Rect from '../../src/components/Rect';
import Group from '../../src/components/Group';

describe('WorkspacePeer viewBox (W-VIEWBOX, BL-71)', () => {
  it('starts without a viewBox: size defaults to 1, origin to 0', () => {
    const peer = new WorkspacePeer();
    expect(peer.getCoordSize()).toEqual({ width: 1, height: 1 });
    expect(peer.getCoordOrigin()).toEqual({ x: 0, y: 0 });
    expect(peer.getPosition()).toEqual({ x: 0, y: 0 });
  });

  it('round-trips a fractional coordinate size without truncation', () => {
    const peer = new WorkspacePeer();
    peer.setCoordSize(1234.5, 987.6);
    expect(peer.getCoordSize()).toEqual({ width: 1234.5, height: 987.6 });
    expect(peer._native.getAttribute('viewBox')).toBe('0 0 1234.5 987.6');
  });

  it('round-trips a fractional origin without rounding', () => {
    const peer = new WorkspacePeer();
    peer.setCoordSize(100, 100);
    peer.setCoordOrigin(-10.25, 3.75);
    expect(peer.getCoordOrigin()).toEqual({ x: -10.25, y: 3.75 });
    expect(peer.getCoordSize()).toEqual({ width: 100, height: 100 });
  });

  it('accumulates slow pans (10 × 0.3)', () => {
    const peer = new WorkspacePeer();
    peer.setCoordSize(1000, 1000);
    for (let i = 0; i < 10; i++) {
      const { x, y } = peer.getCoordOrigin();
      peer.setCoordOrigin(x + 0.3, y - 0.3);
    }
    expect(peer.getCoordOrigin().x).toBeCloseTo(3);
    expect(peer.getCoordOrigin().y).toBeCloseTo(-3);
  });

  it('the origin and size are independent', () => {
    const peer = new WorkspacePeer();
    peer.setCoordOrigin(5, 6);
    peer.setCoordSize(7, 8);
    expect(peer._native.getAttribute('viewBox')).toBe('5 6 7 8');
  });

  it('stretches the viewBox (no aspect ratio)', () => {
    expect(new WorkspacePeer()._native.getAttribute('preserveAspectRatio')).toBe('none');
  });
});

describe('Workspace', () => {
  it('characterization: default attributes', () => {
    const workspace = new Workspace();
    const container = workspace._getHtmlContainer();
    const svg = workspace.getSVGElement();
    expect(container.style.width).toBe('400px');
    expect(container.style.height).toBe('400px');
    expect(container.style.position).toBe('relative');
    expect(container.style.backgroundColor).toBe('white');
    expect(container.style.border).toBe('1px solid rgb(237, 241, 190)');
    expect(svg.getAttribute('width')).toBe('400');
    expect(svg.getAttribute('height')).toBe('400');
    expect(svg.getAttribute('viewBox')).toBe('0 0 200 200');
    expect(workspace.getType()).toBe('Workspace');
    expect(workspace.getSize()).toEqual({ width: '400px', height: '400px' });
  });

  it('applies fractional zoom and origin at full precision', () => {
    const workspace = new Workspace();
    workspace.setSize('800px', '600px');
    workspace.setCoordSize(800 * 1.37, 600 * 1.37);
    workspace.setCoordOrigin(-548.3, -411.15);
    expect(workspace.getCoordSize().width).toBeCloseTo(1096);
    expect(workspace.getCoordSize().height).toBeCloseTo(822);
    expect(workspace.getCoordOrigin()).toEqual({ x: -548.3, y: -411.15 });
  });

  it('parses string coordinate sizes', () => {
    const workspace = new Workspace();
    workspace.setCoordSize('300.5', '200');
    expect(workspace.getCoordSize()).toEqual({ width: 300.5, height: 200 });
  });

  it('appends and removes children', () => {
    const workspace = new Workspace();
    const rect = new Rect(0);
    workspace.append(rect);
    expect(workspace.getSVGElement().contains(rect.peer._native)).toBe(true);
    expect(workspace.peer.getChildren()).toContain(rect.peer);
    workspace.removeChild(rect);
    expect(workspace.getSVGElement().contains(rect.peer._native)).toBe(false);
  });

  it('rejects invalid children', () => {
    const workspace = new Workspace();
    expect(() => workspace.append(new Workspace())).toThrow();
    expect(() => workspace.append(null as unknown as Rect)).toThrow();
    expect(() => workspace.removeChild(null as unknown as Rect)).toThrow();
    expect(() => workspace.removeChild(workspace)).toThrow();
  });

  it('is added to a div', () => {
    const workspace = new Workspace();
    const div = document.createElement('div');
    workspace.addItAsChildTo(div);
    expect(div.firstChild).toBe(workspace._getHtmlContainer());
    expect(() => workspace.addItAsChildTo(null as unknown as HTMLDivElement)).toThrow();
  });

  it('fill sets the container background; stroke its border', () => {
    const workspace = new Workspace();
    const container = workspace._getHtmlContainer();
    workspace.setFill('red');
    workspace.setStroke('2px', 'solid', 'blue');
    expect(container.style.backgroundColor).toBe('red');
    expect(container.style.border).toBe('2px solid blue');
    // A number width is in pixels.
    workspace.setStroke(4, 'solid', 'green');
    expect(container.style.border).toBe('4px solid green');
  });

  it.each([
    ['dash', 'dashed'],
    ['longdash', 'dashed'],
    ['dashdot', 'dashed'],
    ['dot', 'dotted'],
  ])('maps the stroke style %s to the CSS border style %s', (style, css) => {
    const workspace = new Workspace();
    workspace.setStroke(1, style, 'red');
    expect(workspace._getHtmlContainer().style.border).toBe(`1px ${css} red`);
  });

  it('rejects unknown stroke styles', () => {
    expect(() => new Workspace().setStroke(1, 'wavy', 'red')).toThrow(
      "Unsupported stroke style: 'wavy'",
    );
  });

  it('has no debug border or height of its own', () => {
    const container = Workspace._createDivContainer();
    expect(container.style.border).toBe('');
    expect(container.style.height).toBe('');
  });

  it('strokeWidth wins over the default stroke, whatever the key order', () => {
    const workspace = new Workspace({ strokeWidth: 0 });
    expect(workspace._getHtmlContainer().style.border).toBe('0px solid rgb(237, 241, 190)');
  });

  // Section 3.4 (Liskov): Workspace.setStroke(0) threw "style:undefined".
  it('Liskov: setStroke(width) without a style does not throw', () => {
    const workspace = new Workspace();
    expect(() => workspace.setStroke(0, undefined, 'red', 1)).not.toThrow();
    expect(workspace._getHtmlContainer().style.border).toBe('0px solid red');
  });

  it('Liskov: setFill(color, opacity) does not throw', () => {
    const workspace = new Workspace();
    expect(() => workspace.setFill('red', 0.5)).not.toThrow();
    expect(workspace._getHtmlContainer().style.backgroundColor).toBe('red');
  });

  it('nests groups', () => {
    const workspace = new Workspace();
    const group = new Group();
    const inner = new Group();
    group.append(inner);
    workspace.append(group);
    expect(inner.peer.getParent()).toBe(group.peer);
    expect(group.peer.getParent()).toBe(workspace.peer);
  });
});

// BL5-64: setSize skipped a size equal to the kept one, so it could not restore an attribute
// written around the peer, and getSize kept reporting the old size.
describe('size attributes written around the peer (BL5-64)', () => {
  it('setSize restores a width and height written directly on the svg', () => {
    const workspace = new Workspace();
    const svg = workspace.getSVGElement();
    svg.setAttribute('width', '800');
    svg.setAttribute('height', '600');
    workspace.setSize('400px', '400px');
    expect(svg.getAttribute('width')).toBe('400');
    expect(svg.getAttribute('height')).toBe('400');
  });

  it('setSize restores a rect size written directly', () => {
    const rect = new Rect(0, { width: 40, height: 20 });
    rect.peer._native.setAttribute('width', '99');
    rect.setSize(40, 20);
    expect(rect.peer._native.getAttribute('width')).toBe('40');
  });

  it('WorkspacePeer.getSize reads the svg width and height', () => {
    const peer = new WorkspacePeer();
    peer.setSize(400, 300);
    peer._native.setAttribute('width', '800');
    expect(peer.getSize()).toEqual({ width: 800, height: 300 });
  });

  it('WorkspacePeer.getSize keeps the kept size for a non-numeric attribute', () => {
    const peer = new WorkspacePeer();
    peer.setSize(400, 300);
    peer._native.setAttribute('width', 'auto');
    expect(peer.getSize()).toEqual({ width: 400, height: 300 });
  });

  it('WorkspacePeer.getSize keeps full precision while the attributes match', () => {
    const peer = new WorkspacePeer();
    peer.setSize(400.555, 300.125);
    expect(peer.getSize()).toEqual({ width: 400.555, height: 300.125 });
  });
});
