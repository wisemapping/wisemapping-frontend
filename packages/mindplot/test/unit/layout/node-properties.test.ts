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
import Node from '../../../src/components/layout/Node';
import SymmetricSorter from '../../../src/components/layout/SymmetricSorter';

// BL5-185: the properties of a layout node are typed by key. What each one stores and when it
// counts as changed, which the layout passes rely on, is pinned here.
const build = () => new Node(1, { width: 80, height: 60 }, { x: 10, y: 20 }, new SymmetricSorter());

describe('layout Node properties (BL5-185)', () => {
  it('starts with its size, position and shrink set, no order and no free displacement', () => {
    const node = build();

    expect(node.hasPositionChanged()).toBe(true);
    expect(node.isPropertyChanged('size')).toBe(true);
    expect(node.getOrder()).toBeUndefined();
    expect(node.hasOrderChanged()).toBe(false);
    expect(node.getFreeDisplacement()).toEqual({ x: 0, y: 0 });
    expect(node.hasFreeDisplacementChanged()).toBe(false);
    expect(node.areChildrenShrunken()).toBe(false);
    // The constructor sets it to false, which counts as a change from unset.
    expect(node.isPropertyChanged('shrink')).toBe(true);
  });

  it('marks the order changed only when it changes, until reset', () => {
    const node = build();
    node.setOrder(2);
    expect(node.getOrder()).toBe(2);
    expect(node.hasOrderChanged()).toBe(true);

    node.resetOrderState();
    node.setOrder(2);
    expect(node.hasOrderChanged()).toBe(false);

    node.setOrder(undefined);
    expect(node.getOrder()).toBeUndefined();
    expect(node.hasOrderChanged()).toBe(true);
  });

  it('keeps a copy of the size and skips changes of half a pixel or less', () => {
    const node = build();
    const size = { width: 100, height: 40 };
    node.setSize(size);
    size.width = 999;
    expect(node.getSize()).toEqual({ width: 100, height: 40 });

    node.setSize({ width: 100.5, height: 40.5 });
    expect(node.getSize()).toEqual({ width: 100, height: 40 });
  });

  it('adds up free displacements', () => {
    const node = build();
    node.setFreeDisplacement({ x: 5, y: -3 });
    node.setFreeDisplacement({ x: 1, y: 1 });

    expect(node.getFreeDisplacement()).toEqual({ x: 6, y: -2 });
    expect(node.hasFreeDisplacementChanged()).toBe(true);
    node.resetFreeState();
    expect(node.hasFreeDisplacementChanged()).toBe(false);
  });

  it('stores whether its children are shrunken', () => {
    const node = build();
    node.setShrunken(true);

    expect(node.areChildrenShrunken()).toBe(true);
  });
});
