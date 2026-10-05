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

const SIZE = { width: 80, height: 30 };

/*
 * LayoutManager.needsLayout only sees the changes made through the manager: a node changed
 * through find() was not laid out by the next forceLayout (BL5-132). find() now gives the node
 * without its setters, so such a change does not compile.
 */
describe('LayoutManager.find (BL5-132)', () => {
  it('gives a node to read, without its setters', () => {
    const manager = new LayoutManager(0, { width: 140, height: 90 });
    manager.addNode(1, SIZE, { x: 0, y: 0 }).connectNode(0, 1, 0);
    manager.layout(true);
    expect(manager.needsLayout()).toBe(false);

    const node = manager.find(1);
    expect(node.getOrder()).toBe(0);
    expect(node.getSize()).toEqual(SIZE);

    // Type checks only, never run: each would change the node behind the manager's back.
    const changes = [
      // @ts-expect-error find() gives no setter
      () => node.setOrder(2),
      // @ts-expect-error find() gives no setter
      () => node.setSize({ width: 1, height: 1 }),
      // @ts-expect-error find() gives no setter
      () => node.setPosition({ x: 1, y: 1 }),
      // @ts-expect-error find() gives no setter
      () => node.setShrunken(true),
    ];
    expect(changes).toHaveLength(4);

    // The manager's own methods are tracked.
    manager.updateNodeSize(1, { width: 200, height: 30 });
    expect(manager.needsLayout()).toBe(true);
  });
});
