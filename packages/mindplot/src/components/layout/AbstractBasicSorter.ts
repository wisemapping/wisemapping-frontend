/*
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
import PositionType from '../PositionType';
import ChildrenSorterStrategy from './ChildrenSorterStrategy';
import Node from './Node';
import RootedTreeSet from './RootedTreeSet';

abstract class AbstractBasicSorter extends ChildrenSorterStrategy {
  private INTERNODE_VERTICAL_PADDING = 5;

  computeChildrenIdByHeights(treeSet: RootedTreeSet, node: Node): Map<number, number> {
    const result = new Map<number, number>();
    this._computeChildrenHeight(treeSet, node, result);
    return result;
  }

  getVerticalPadding(): number {
    return this.INTERNODE_VERTICAL_PADDING;
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
    result.sort((a, b) => a.getOrder() - b.getOrder());
    return result;
  }

  protected _getRelativeDirection(reference: PositionType, position: PositionType): 1 | -1 {
    const offset = position.x - reference.x;
    return offset >= 0 ? 1 : -1;
  }
}

export default AbstractBasicSorter;
