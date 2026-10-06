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
import { $assert } from '../util/assert';
import PositionType from '../PositionType';
import SizeType from '../SizeType';
import ChildrenSorterStrategy from './ChildrenSorterStrategy';

/** The properties of a layout node, by key. Position and size are always set (constructor). */
type NodeProps = {
  order: number | undefined;
  position: PositionType;
  size: SizeType;
  freeDisplacement: PositionType;
  shrink: boolean;
};
type NodeKey = keyof NodeProps;
type PropertyState<V> = {
  hasChanged: boolean;
  value: V | undefined;
  oldValue: V | undefined;
};
type NodeState = { [K in NodeKey]: PropertyState<NodeProps[K]> };

const unset = <V>(): PropertyState<V> => ({
  hasChanged: false,
  value: undefined,
  oldValue: undefined,
});

class Node {
  private _id: number;

  // Set by RootedTreeSet when the node is connected; a node starts as a root.
  _parent: Node | null = null;

  private _sorter: ChildrenSorterStrategy;

  private _properties: NodeState;

  _children!: Node[];

  constructor(id: number, size: SizeType, position: PositionType, sorter: ChildrenSorterStrategy) {
    $assert(typeof id === 'number' && Number.isFinite(id), 'id can not be null');
    this._id = id;
    this._sorter = sorter;
    this._properties = {
      order: unset(),
      position: unset(),
      size: unset(),
      freeDisplacement: unset(),
      shrink: unset(),
    };

    this.setSize(size);
    this.setPosition(position);
    this.setShrunken(false);
  }

  getId(): number {
    return this._id;
  }

  hasFreeDisplacementChanged(): boolean {
    return this.isPropertyChanged('freeDisplacement');
  }

  setShrunken(value: boolean): void {
    this.setProperty('shrink', value);
  }

  areChildrenShrunken(): boolean {
    return Boolean(this.getProperty('shrink'));
  }

  /**
   * Set the order of this node among its siblings.
   * Pass a number for nodes with siblings, or undefined for nodes without siblings.
   * @param order - The order value (finite number or undefined)
   */
  setOrder(order: number | undefined): void {
    $assert(
      order === undefined || (typeof order === 'number' && Number.isFinite(order)),
      `Order must be a finite number or undefined. Value:${order}`,
    );

    if (this.getOrder() !== order) {
      this.setProperty('order', order);
    }
  }

  resetPositionState(): void {
    this._properties.position.hasChanged = false;
  }

  resetOrderState(): void {
    this._properties.order.hasChanged = false;
  }

  resetFreeState(): void {
    this._properties.freeDisplacement.hasChanged = false;
  }

  /**
   * Get the order of this node among its siblings.
   * Returns undefined for nodes without siblings (central node, isolated nodes).
   * @returns The order value, or undefined if not applicable
   */
  getOrder(): number | undefined {
    return this.getProperty('order');
  }

  hasOrderChanged(): boolean {
    return Boolean(this.isPropertyChanged('order'));
  }

  hasPositionChanged() {
    return this.isPropertyChanged('position');
  }

  /**
   * Get the position of this node.
   * Position is always defined (initialized in constructor).
   * @returns The node position
   */
  getPosition(): PositionType {
    const position = this.getProperty('position');
    // Position is always set in constructor, but TypeScript can't verify this
    // Use assertion since we know it's always defined
    $assert(position !== undefined, 'Position should always be defined');
    return position;
  }

  setSize(size: SizeType): void {
    const currentSize = this.getProperty('size');
    // Only update if size changed significantly (performance optimization)
    if (
      !currentSize ||
      Math.abs(currentSize.height - size.height) > 0.5 ||
      Math.abs(currentSize.width - size.width) > 0.5
    ) {
      this.setProperty('size', { ...size });
    }
  }

  /**
   * Get the size of this node.
   * Size is always defined (initialized in constructor).
   * @returns The node size
   */
  getSize(): SizeType {
    const size = this.getProperty('size');
    // Size is always set in constructor, but TypeScript can't verify this
    // Use assertion since we know it's always defined
    $assert(size !== undefined, 'Size should always be defined');
    return size;
  }

  setFreeDisplacement(displacement: PositionType): void {
    const oldDisplacement = this.getFreeDisplacement();
    const newDisplacement = {
      x: oldDisplacement.x + displacement.x,
      y: oldDisplacement.y + displacement.y,
    };

    this.setProperty('freeDisplacement', { ...newDisplacement });
  }

  /**
   * Get the free displacement of this node.
   * Returns {x: 0, y: 0} if not set (default value).
   * @returns The free displacement
   */
  getFreeDisplacement(): PositionType {
    const freeDisplacement = this.getProperty('freeDisplacement');
    return freeDisplacement || { x: 0, y: 0 };
  }

  /**
   * @throws will throw an error if position is missing, or its x or y is not a finite number: the
   * node would keep it (it compares as NaN) and the layout would place its branch there.
   */
  setPosition(position: PositionType): void {
    $assert(
      position && Number.isFinite(position.x) && Number.isFinite(position.y),
      `position must have finite x and y. Value:${JSON.stringify(position)}`,
    );

    // This is a performance improvement to avoid movements that really could be avoided.
    const currentPos = this.getProperty('position');
    if (
      !currentPos ||
      Math.abs(currentPos.x - position.x) > 0.5 ||
      Math.abs(currentPos.y - position.y) > 0.5
    ) {
      this.setProperty('position', { ...position });
    }
  }

  private setProperty<K extends NodeKey>(key: K, value: NodeProps[K]): void {
    const prop: PropertyState<NodeProps[K]> = this._properties[key];

    // Only update if the property has changed ...
    if (JSON.stringify(prop.value) !== JSON.stringify(value)) {
      prop.oldValue = prop.value;
      prop.value = value;
      prop.hasChanged = true;
    }
  }

  private getProperty<K extends NodeKey>(key: K): NodeProps[K] | undefined {
    return this._properties[key].value;
  }

  isPropertyChanged(key: NodeKey): boolean {
    return this._properties[key].hasChanged;
  }

  getSorter(): ChildrenSorterStrategy {
    return this._sorter;
  }

  setSorter(sorter: ChildrenSorterStrategy): void {
    this._sorter = sorter;
  }

  /** @return {String} returns id, order, position, size and shrink information */
  toString(): string {
    return `[id:${this.getId()}, order:${this.getOrder()}, position: {${this.getPosition().x},${
      this.getPosition().y
    }}, size: {${this.getSize().width},${
      this.getSize().height
    }}, shrink:${this.areChildrenShrunken()}]`;
  }
}

export default Node;
