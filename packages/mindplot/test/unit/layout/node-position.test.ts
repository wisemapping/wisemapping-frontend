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

import LayoutManager from '../../../src/components/layout/LayoutManager';
import Node from '../../../src/components/layout/Node';
import SymmetricSorter from '../../../src/components/layout/SymmetricSorter';
import PositionType from '../../../src/components/PositionType';

const SIZE = { width: 80, height: 60 };

describe('layout Node.setPosition (BL4-37)', () => {
  it.each([{}, { x: Number.NaN, y: 20 }, { x: 10 }])(
    'replaces an incomplete current position %p',
    (current) => {
      const node = new Node(1, SIZE, current as PositionType, new SymmetricSorter());
      node.resetPositionState();

      node.setPosition({ x: 10, y: 20 });

      expect(node.getPosition()).toEqual({ x: 10, y: 20 });
      expect(node.hasPositionChanged()).toBe(true);
    },
  );

  it('still skips moves of half a pixel or less', () => {
    const node = new Node(1, SIZE, { x: 10, y: 20 }, new SymmetricSorter());
    node.resetPositionState();

    node.setPosition({ x: 10.5, y: 19.5 });

    expect(node.getPosition()).toEqual({ x: 10, y: 20 });
    expect(node.hasPositionChanged()).toBe(false);
  });
});

describe('LayoutManager.addNode (BL4-37)', () => {
  it.each([undefined, {}, { x: Number.NaN, y: 0 }, { x: 0, y: Number.POSITIVE_INFINITY }])(
    'rejects the invalid position %p',
    (position) => {
      const manager = new LayoutManager(0, SIZE);

      expect(() => manager.addNode(1, SIZE, position as PositionType)).toThrow(/position/);
    },
  );

  it('adds a node with a valid position', () => {
    const manager = new LayoutManager(0, SIZE);

    manager.addNode(1, SIZE, { x: -5, y: 7 });

    expect(manager.find(1).getPosition()).toEqual({ x: -5, y: 7 });
  });
});
