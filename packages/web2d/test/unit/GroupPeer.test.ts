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
import GroupPeer from '../../src/components/peer/svg/GroupPeer';
import Group from '../../src/components/Group';
import Rect from '../../src/components/Rect';
import Workspace from '../../src/components/Workspace';
import { hasNaN } from '../helpers/geometry';

const group = (
  size: [number, number],
  coordSize: [number, number],
  position: [number, number] = [0, 0],
  origin: [number, number] = [0, 0],
) => {
  const peer = new GroupPeer();
  peer.setSize(size[0], size[1]);
  peer.setCoordSize(coordSize[0], coordSize[1]);
  peer.setPosition(position[0], position[1]);
  peer.setCoordOrigin(origin[0], origin[1]);
  return peer;
};

const transform = (peer: GroupPeer) => peer._native.getAttribute('transform');

describe('GroupPeer.updateTransform', () => {
  it('scales by size / coordSize', () => {
    expect(transform(group([100, 50], [50, 100]))).toBe('translate(0.00,0.00) scale(2,0.5)');
  });

  it('translates by position minus origin × scale', () => {
    expect(transform(group([100, 100], [50, 50], [10, 20], [5, 5]))).toBe(
      'translate(0.00,10.00) scale(2,2)',
    );
  });

  it('an identity group only translates', () => {
    expect(transform(group([10, 10], [10, 10], [3, 4]))).toBe('translate(3.00,4.00) scale(1,1)');
  });

  it('does not rewrite the transform when nothing changes', () => {
    const peer = group([10, 10], [10, 10], [3, 4]);
    const spy = jest.spyOn(peer._native, 'setAttribute');
    peer.setPosition(3, 4);
    peer.setCoordOrigin(0, 0);
    peer.setCoordSize(10, 10);
    expect(spy).not.toHaveBeenCalledWith('transform', expect.anything());
  });

  it('getters return copies', () => {
    const peer = group([10, 20], [30, 40], [1, 2], [3, 4]);
    expect(peer.getSize()).toEqual({ width: 10, height: 20 });
    expect(peer.getCoordSize()).toEqual({ width: 30, height: 40 });
    expect(peer.getPosition()).toEqual({ x: 1, y: 2 });
    expect(peer.getCoordOrigin()).toEqual({ x: 3, y: 4 });
    peer.getPosition().x = 99;
    expect(peer.getPosition().x).toBe(1);
  });

  // W-GTRANSFORM: only coordSize.width > 0 was checked.
  it('W-GTRANSFORM: a coordinate height of 0 gives no NaN or Infinity', () => {
    const value = transform(group([50, 50], [150, 0], [50, 0]));
    expect(hasNaN(value)).toBe(false);
    expect(value).not.toContain('Infinity');
    expect(value).toBe('translate(50.00,0.00) scale(0.333333,1)');
  });

  it('W-GTRANSFORM: a coordinate width of 0 keeps the translate', () => {
    expect(transform(group([10, 10], [0, 10], [5, 5]))).toBe('translate(5.00,5.00) scale(1,1)');
  });

  it('W-GTRANSFORM: the scale is not rounded to 2 decimals', () => {
    // 16.8 / 100 = 0.168, written as 0.17 (a 1.2 % error on icons).
    expect(transform(group([16.8, 16.8], [100, 100]))).toContain('0.168');
  });

  it('setOpacity sets the element opacity, like every element', () => {
    const peer = new GroupPeer();
    peer.setOpacity(0.4);
    expect(peer._native.style.opacity).toBe('0.4');
  });
});

describe('Group', () => {
  it('default attributes: 50×50 at the origin', () => {
    const g = new Group();
    expect(g.getType()).toBe('Group');
    expect(g.getSize()).toEqual({ width: 50, height: 50 });
    expect(g.getPosition()).toEqual({ x: 0, y: 0 });
    expect(g.peer._native.getAttribute('transform')).toBe('translate(0.00,0.00) scale(1,1)');
  });

  // W-GDEFAULTS: the defaults 'coordSize: 50 50' and 'coordOrigin: 0 0' were split into strings.
  it('W-GDEFAULTS: default coordSize and coordOrigin are numbers', () => {
    const g = new Group();
    expect(g.getCoordSize()).toStrictEqual({ width: 50, height: 50 });
    expect(g.getCoordOrigin()).toStrictEqual({ x: 0, y: 0 });
  });

  it('delegates coordinates to its peer', () => {
    const g = new Group({ width: 100, height: 100, coordSizeWidth: 50, coordSizeHeight: 50 });
    g.setCoordSize(25, 25);
    g.setCoordOrigin(1, 2);
    g.setPosition(3, 4);
    g.setOpacity(0.5);
    expect(g.getCoordSize()).toEqual({ width: 25, height: 25 });
    expect(g.getCoordOrigin()).toEqual({ x: 1, y: 2 });
    expect(g.getPosition()).toEqual({ x: 3, y: 4 });
    expect(g.peer._native.style.opacity).toBe('0.5');
  });

  it('appends and removes children', () => {
    const g = new Group();
    const rect = new Rect(0);
    g.append(rect);
    expect(g.peer._native.contains(rect.peer._native)).toBe(true);
    g.removeChild(rect);
    expect(g.peer._native.contains(rect.peer._native)).toBe(false);
  });

  it('appends raw DOM children', () => {
    const g = new Group();
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    g.appendDomChild(node);
    expect(g.peer._native.lastChild).toBe(node);
    expect(() => g.appendDomChild(null as unknown as Node)).toThrow();
  });

  it('rejects invalid children', () => {
    const g = new Group();
    expect(() => g.append(g)).toThrow();
    expect(() => g.append(null as unknown as Rect)).toThrow();
    expect(() => g.append(new Workspace())).toThrow();
    expect(() => g.removeChild(g)).toThrow();
    expect(() => g.removeChild(null as unknown as Rect)).toThrow();
  });

  it('Liskov: fill and stroke are no-ops on a group (section 3.4)', () => {
    const g = new Group();
    expect(() => g.setFill('red', 0.5)).not.toThrow();
    expect(() => g.setStroke(1, 'dash', 'red', 0.5)).not.toThrow();
    expect(g.peer._native.hasAttribute('fill')).toBe(false);
    expect(g.peer._native.hasAttribute('stroke')).toBe(false);
  });

  it('Liskov: new Group({ fillColor }) does not throw', () => {
    expect(() => new Group({ fillColor: 'red', strokeWidth: 1 })).not.toThrow();
  });
});
