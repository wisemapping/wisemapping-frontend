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
import { $assert } from '@wisemapping/core-js';
import PositionType from '../PositionType';
import SizeType from '../SizeType';
import ChildrenSorterStrategy from './ChildrenSorterStrategy';

type NodeValue = number | SizeType | PositionType | boolean;
type MapValue = {
  hasChanged: boolean;
  value: NodeValue | undefined;
  oldValue: NodeValue | undefined;
};
type NodeKey = 'order' | 'position' | 'size' | 'freeDisplacement' | 'shrink';

class Node {
  private _id: number;

  // eslint-disable-next-line no-use-before-define
  _parent!: Node | null;

  private _sorter: ChildrenSorterStrategy;

  private _properties: Map<NodeKey, MapValue>;

  // eslint-disable-next-line no-use-before-define
  _children!: Node[];

  _branchHeight: number;

  _heightChanged: boolean;

  constructor(id: number, size: SizeType, position: PositionType, sorter: ChildrenSorterStrategy) {
    $assert(typeof id === 'number' && Number.isFinite(id), 'id can not be null');
    this._id = id;
    this._sorter = sorter;
    this._properties = new Map();

    this.setSize(size);
    this.setPosition(position);
    this.setShrunken(false);
    this._branchHeight = -1;
    this._heightChanged = false;
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

  setOrder(order: number): void {
    $assert(
      typeof order === 'number' && Number.isFinite(order),
      `Order can not be null. Value:${order}`,
    );

    if (this.getOrder() !== order) {
      this.setProperty('order', order);
    }
  }

  resetPositionState(): void {
    const prop = this._properties.get('position');
    if (prop) {
      prop.hasChanged = false;
    }
  }

  resetOrderState(): void {
    const prop = this._properties.get('order');
    if (prop) {
      prop.hasChanged = false;
    }
  }

  resetFreeState(): void {
    const prop = this._properties.get('freeDisplacement');
    if (prop) {
      prop.hasChanged = false;
    }
  }

  getOrder(): number {
    return this.getProperty('order') as number;
  }

  hasOrderChanged(): boolean {
    return Boolean(this.isPropertyChanged('order'));
  }

  hasPositionChanged() {
    return this.isPropertyChanged('position');
  }

  hasSizeChanged(): boolean {
    return this.isPropertyChanged('size');
  }

  getPosition(): PositionType {
    return this.getProperty('position') as PositionType;
  }

  setSize(size: SizeType): void {
    const currentSize = this.getSize();
    if (
      !currentSize ||
      (currentSize &&
        (Math.abs(currentSize.height - size.height) > 0.5 ||
          Math.abs(currentSize.width - size.width) > 0.5))
    ) {
      this.setProperty('size', { ...size });
    }
  }

  getSize(): SizeType {
    return this.getProperty('size') as SizeType;
  }

  setFreeDisplacement(displacement: PositionType): void {
    const oldDisplacement = this.getFreeDisplacement();
    const newDisplacement = {
      x: oldDisplacement.x + displacement.x,
      y: oldDisplacement.y + displacement.y,
    };

    this.setProperty('freeDisplacement', { ...newDisplacement });
  }

  getFreeDisplacement(): PositionType {
    const freeDisplacement = this.getProperty('freeDisplacement') as PositionType;
    return freeDisplacement || { x: 0, y: 0 };
  }

  setPosition(position: PositionType): void {
    // This is a performance improvement to avoid movements that really could be avoided.
    const currentPos = this.getPosition();
    if (
      !currentPos ||
      (currentPos &&
        (Math.abs(currentPos.x - position.x) > 0.5 || Math.abs(currentPos.y - position.y) > 0.5))
    ) {
      this.setProperty('position', { ...position });
    }
  }

  private setProperty(key: NodeKey, value: NodeValue): void {
    let prop = this._properties.get(key);
    if (!prop) {
      prop = {
        hasChanged: false,
        value: undefined,
        oldValue: undefined,
      };
    }

    // Only update if the property has changed ...
    if (JSON.stringify(prop.value) !== JSON.stringify(value)) {
      prop.oldValue = prop.value;
      prop.value = value;
      prop.hasChanged = true;
    }
    this._properties.set(key, prop);
  }

  private getProperty(key: NodeKey): NodeValue | undefined {
    return this._properties.get(key)?.value;
  }

  isPropertyChanged(key: NodeKey): boolean {
    const prop = this._properties.get(key);
    return prop ? prop.hasChanged : false;
  }

  getSorter(): ChildrenSorterStrategy {
    return this._sorter;
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
