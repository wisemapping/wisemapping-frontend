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
import type PositionType from '../PositionType';
import ChildrenSorterStrategy from './ChildrenSorterStrategy';
import type Node from './Node';
import type RootedTreeSet from './RootedTreeSet';
import { sideOf } from '../util/side';

abstract class AbstractBasicSorter extends ChildrenSorterStrategy {
  private INTERNODE_VERTICAL_PADDING = 5;

  computeChildrenIdByHeights(treeSet: RootedTreeSet, node: Node): Map<number, number> {
    const result = new Map<number, number>();
    this._computeChildrenHeight(treeSet, node, result);
    return result;
  }

  computeBranchExtents(treeSet: RootedTreeSet, node: Node): Map<number, number> {
    return this.computeChildrenIdByHeights(treeSet, node);
  }

  getBranchExtentKey(): string {
    return AbstractBasicSorter.heightExtentKey(this.getVerticalPadding());
  }

  /** The extent key of branch heights measured with the given vertical padding. */
  static heightExtentKey(verticalPadding: number): string {
    return `height:${verticalPadding}`;
  }

  getVerticalPadding(): number {
    return this.INTERNODE_VERTICAL_PADDING;
  }

  /** Height of the branch of `child`: from the given extents when they have it, else measured. */
  protected _getBranchHeight(
    treeSet: RootedTreeSet,
    child: Node,
    extentById?: Map<number, number>,
  ): number {
    return extentById?.get(child.getId()) ?? this._computeChildrenHeight(treeSet, child);
  }

  _computeChildrenHeight(
    treeSet: RootedTreeSet,
    node: Node,
    heightCache?: Map<number, number>,
  ): number {
    // 2* Top and down padding;
    const height = node.getSize().height + this.getVerticalPadding() * 2;

    let result: number;
    const children = treeSet.getChildren(node);
    if (children.length === 0 || node.areChildrenShrunken()) {
      result = height;
    } else {
      const childrenHeight = children
        .map((child) => this._computeChildrenHeight(treeSet, child, heightCache))
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      result = Math.max(height, childrenHeight);
    }

    if (heightCache) {
      heightCache.set(node.getId(), result);
    }

    return result;
  }

  protected _getSortedChildren(treeSet: RootedTreeSet, node: Node): Node[] {
    const result = treeSet.getChildren(node);
    // Sort by order, using nullish coalescing to treat undefined as 0
    result.sort((a, b) => (a.getOrder() ?? 0) - (b.getOrder() ?? 0));
    return result;
  }

  /**
   * Half the gap, in y, between the centre of children[index] and the next child in the list (the
   * one before it, for the last): how far from the first child, or from the last one, the drag
   * pivot goes before or after them, as it is centred in the gap between two children. A lone
   * child counts the gap the layout leaves between two leaves of its height.
   */
  protected _halfSiblingGap(children: Node[], index: number): number {
    // In range: every caller passes the index of a child it already holds.
    const child = children[index]!;
    const neighbour = children[index === 0 ? 1 : index - 1];
    const gap = neighbour
      ? Math.abs(neighbour.getPosition().y - child.getPosition().y)
      : child.getSize().height + this.getVerticalPadding() * 2;
    return gap / 2;
  }

  protected _getRelativeDirection(reference: PositionType, position: PositionType): 1 | -1 {
    return sideOf(position.x, reference.x);
  }
}

export default AbstractBasicSorter;
