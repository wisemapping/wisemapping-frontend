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
import PositionType from '../PositionType';
import ChildrenSorterStrategy from './ChildrenSorterStrategy';
import Node from './Node';
import RootedTreeSet from './RootedTreeSet';

/**
 * What one layout pass of one tree keeps, so that it does not redo work for every parent:
 * - the extents of its branches, measured once for the whole tree per way of measuring them (see
 *   ChildrenSorterStrategy.getBranchExtentKey) instead of once per parent and child;
 * - moving a branch only when it is not where it goes already.
 */
class LayoutPass {
  private _treeSet: RootedTreeSet;

  private _root: Node;

  private _extentsByKey: Map<string, Map<number, number>>;

  constructor(treeSet: RootedTreeSet, root: Node) {
    this._treeSet = treeSet;
    this._root = root;
    this._extentsByKey = new Map();
  }

  /** Extents the layout measured already, for sorters with the given extent key. */
  seedExtents(key: string, extentById: Map<number, number>): void {
    this._extentsByKey.set(key, extentById);
  }

  /**
   * The branch extents of the tree as the given sorter measures them. Nothing in the tree changes
   * size or shape during a pass, so they are the ones its computeOffsets would measure itself.
   */
  extentsFor(sorter: ChildrenSorterStrategy): Map<number, number> {
    const key = sorter.getBranchExtentKey();
    let result = this._extentsByKey.get(key);
    if (!result) {
      result = sorter.computeBranchExtents(this._treeSet, this._root);
      this._extentsByKey.set(key, result);
    }
    return result;
  }

  /**
   * Moves the branch of `node` so that `node` is at `position`. When it is there already,
   * updateBranchPosition would change nothing, yet walk the whole branch: it is skipped.
   */
  moveBranch(node: Node, position: PositionType): void {
    const current = node.getPosition();
    const inPlace =
      Number.isFinite(current.x) &&
      Number.isFinite(current.y) &&
      current.x === position.x &&
      current.y === position.y;
    if (!inPlace) {
      this._treeSet.updateBranchPosition(node, position);
    }
  }
}

export default LayoutPass;
