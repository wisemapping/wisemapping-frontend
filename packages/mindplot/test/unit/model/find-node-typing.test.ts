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
import { describe, expect, test } from '@jest/globals';
import Mindmap from '../../../src/components/model/Mindmap';
import NodeModel from '../../../src/components/model/NodeModel';
import RootedTreeSet from '../../../src/components/layout/RootedTreeSet';
import Node from '../../../src/components/layout/Node';
import ChildrenSorterStrategy from '../../../src/components/layout/ChildrenSorterStrategy';

// ts-jest type-checks the tests: the typed assignments below fail to compile when the lookups
// return the base INodeModel, or hide a missing node behind a non-null assertion.
describe('typed node lookups (T4)', () => {
  test('Mindmap.findNodeById returns a NodeModel, or undefined', () => {
    const mindmap = new Mindmap('map');
    const central = mindmap.createNode('CentralTopic', 1);
    const child = mindmap.createNode('MainTopic', 2);
    mindmap.addBranch(central);
    child.connectTo(central);

    const found: NodeModel | undefined = mindmap.findNodeById(2);
    expect(found).toBe(child);
    expect(found?.findNodeById(2)).toBe(child);
    // @ts-expect-error a missing node is undefined
    const missing: NodeModel = mindmap.findNodeById(3);
    expect(missing).toBeUndefined();
  });

  test('RootedTreeSet.find returns a node, or null when it does not validate', () => {
    const treeSet = new RootedTreeSet();
    const sorter = {} as ChildrenSorterStrategy;
    treeSet.add(new Node(1, { width: 10, height: 10 }, { x: 0, y: 0 }, sorter));

    const found: Node = treeSet.find(1);
    expect(found.getId()).toBe(1);
    expect(() => treeSet.find(2)).toThrow('node could not be found');
    // @ts-expect-error without validation a missing node is null
    const missing: Node = treeSet.find(2, false);
    expect(missing).toBeNull();
  });
});
