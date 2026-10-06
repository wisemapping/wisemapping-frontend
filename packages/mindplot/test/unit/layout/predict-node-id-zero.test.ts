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

const ROOT_NODE_SIZE = { width: 140, height: 90 };
const NODE_SIZE = { width: 80, height: 60 };

/** A root (central topic `rootId`) with one child, `childId`, laid out on the right. */
const singleChild = (rootId: number, childId: number): LayoutManager => {
  const manager = new LayoutManager(rootId, ROOT_NODE_SIZE);
  manager.addNode(childId, NODE_SIZE, { x: 0, y: 0 }).connectNode(rootId, childId, 0);
  manager.layout();
  return manager;
};

describe('LayoutManager.predict with a dragged node whose id is 0', () => {
  // Id 0 is a valid topic id: only the central topic usually has it, but a loaded map
  // can give it to any topic. A truthy check treated it as "no dragged node".
  it('predicts the same as for any other id', () => {
    const zero = singleChild(1, 0);
    const other = singleChild(1, 7);
    const position = zero.find(0).getPosition();

    expect(zero.predict(1, 0, position)).toEqual(other.predict(1, 7, position));
  });

  it('keeps a lone child where it is when it is dropped on itself', () => {
    const manager = singleChild(1, 0);
    const node = manager.find(0);

    expect(manager.predict(1, 0, node.getPosition())).toEqual({
      order: node.getOrder(),
      position: node.getPosition(),
    });
  });
});
