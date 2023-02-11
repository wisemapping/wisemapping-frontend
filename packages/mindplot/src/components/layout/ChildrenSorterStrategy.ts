/**
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import RootedTreeSet from './RootedTreeSet';
import Node from './Node';
import PositionType from '../PositionType';

abstract class ChildrenSorterStrategy {
  abstract computeChildrenIdByHeights(treeSet: RootedTreeSet, node: Node): Map<number, number>;

  abstract computeOffsets(treeSet: RootedTreeSet, node: Node): Map<number, PositionType>;

  abstract insert(treeSet: RootedTreeSet, parent: Node, child: Node, order: number): void;

  abstract detach(treeSet: RootedTreeSet, node: Node): void;

  abstract predict(
    treeSet: RootedTreeSet,
    parent: Node,
    node: Node | null,
    position: PositionType | null,
  ): void;

  abstract verify(treeSet: RootedTreeSet, node: Node): void;

  abstract getChildDirection(treeSet: RootedTreeSet, node: Node): 1 | -1;

  abstract toString(): string;

  abstract getVerticalPadding(): number;
}

export default ChildrenSorterStrategy;
