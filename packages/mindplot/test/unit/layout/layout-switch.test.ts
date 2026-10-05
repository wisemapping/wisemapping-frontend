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

import { describe, expect, it } from '@jest/globals';
import LayoutManager from '../../../src/components/layout/LayoutManager';
import BalancedSorter from '../../../src/components/layout/BalancedSorter';
import SymmetricSorter from '../../../src/components/layout/SymmetricSorter';
import TreeSorter from '../../../src/components/layout/TreeSorter';

const ROOT_SIZE = { width: 140, height: 90 };
const SIZE = { width: 80, height: 30 };

/** Switching layouts gives every node the sorter of the new layout, children or not (BL5-82). */
describe('layout switch migration (BL5-82)', () => {
  it('gives a childless central topic the mind map sorter', () => {
    const manager = new LayoutManager(0, ROOT_SIZE, 'tree');
    manager.setLayoutType('mindmap');

    expect(manager.find(0).getSorter()).toBeInstanceOf(BalancedSorter);

    // Its first two children go to either side, as in a mind map, not under it.
    manager.addNode(1, SIZE, { x: 0, y: 0 }).connectNode(0, 1, 0);
    manager.addNode(2, SIZE, { x: 0, y: 0 }).connectNode(0, 2, 1);
    manager.layout(true);
    expect(manager.find(1).getPosition().x).toBeGreaterThan(0);
    expect(manager.find(2).getPosition().x).toBeLessThan(0);
  });

  it('gives childless topics the sorter of the new layout, both ways', () => {
    const manager = new LayoutManager(0, ROOT_SIZE, 'tree');
    manager.addNode(1, SIZE, { x: 0, y: 0 }).connectNode(0, 1, 0);
    manager.addNode(2, SIZE, { x: 0, y: 0 }).connectNode(1, 2, 0);

    manager.setLayoutType('mindmap');
    expect(manager.find(1).getSorter()).toBeInstanceOf(SymmetricSorter);
    expect(manager.find(2).getSorter()).toBeInstanceOf(SymmetricSorter);

    manager.setLayoutType('tree');
    [0, 1, 2].forEach((id) => expect(manager.find(id).getSorter()).toBeInstanceOf(TreeSorter));
  });
});
