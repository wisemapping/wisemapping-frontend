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
import { $assert, $defined } from '@wisemapping/core-js';
import PositionType from '../PositionType';
import SizeType from '../SizeType';
import ChildrenSorterStrategy from './ChildrenSorterStrategy';

class Node {
  private _id: number;

  // eslint-disable-next-line no-use-before-define
  _parent!: Node | null;

  private _sorter: ChildrenSorterStrategy;

  private _properties;

  // eslint-disable-next-line no-use-before-define
  _children!: Node[];

  _branchHeight: number;

  _heightChanged: boolean;

  constructor(id: number, size: SizeType, position: PositionType, sorter: ChildrenSorterStrategy) {
    $assert(typeof id === 'number' && Number.isFinite(id), 'id can not be null');
    this._id = id;
    this._sorter = sorter;
    this._properties = {};

    this.setSize(size);
    this.setPosition(position);
    this.setShrunken(false);
    this._branchHeight = -1;
    this._heightChanged = false;
  }

  /** */
  getId(): number {
    return this._id;
  }

  /** */
  hasFreeDisplacementChanged() {
    return this.isPropertyChanged('freeDisplacement');
  }

  /** */
  setShrunken(value: boolean) {
    this.setProperty('shrink', value);
  }

  /** */
  areChildrenShrunken() {
    return this.getProperty('shrink');
  }

  setOrder(order: number) {
    $assert(
      typeof order === 'number' && Number.isFinite(order),
      `Order can not be null. Value:${order}`,
    );

    if (this.getOrder() !== order) {
      this.setProperty('order', order);
    }
  }

  /** */
  resetPositionState() {
    const prop = this._properties.position;
    if (prop) {
      prop.hasChanged = false;
    }
  }

  /** */
  resetOrderState() {
    const prop = this._properties.order;
    if (prop) {
      prop.hasChanged = false;
    }
  }

  /** */
  resetFreeState() {
    const prop = this._properties.freeDisplacement;
    if (prop) {
      prop.hasChanged = false;
    }
  }

  getOrder(): number {
    return this.getProperty('order') as number;
  }

  /** */
  hasOrderChanged() {
    return this.isPropertyChanged('order');
  }

  /** */
  hasPositionChanged() {
    return this.isPropertyChanged('position');
  }

  hasSizeChanged(): boolean {
    return this.isPropertyChanged('size');
  }

  getPosition(): PositionType {
    return this.getProperty('position') as PositionType;
  }

  /** */
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

  /** */
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

  /** */
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

  setProperty(key: string, value) {
    let prop = this._properties[key];
    if (!prop) {
      prop = {
        hasChanged: false,
        value: null,
        oldValue: null,
      };
    }

    // Only update if the property has changed ...
    if (JSON.stringify(prop.value) !== JSON.stringify(value)) {
      prop.oldValue = prop.value;
      prop.value = value;
      prop.hasChanged = true;
    }
    this._properties[key] = prop;
  }

  private getProperty(key: string): null | number | PositionType | SizeType {
    const prop = this._properties[key];
    return $defined(prop) ? prop.value : null;
  }

  isPropertyChanged(key: string) {
    const prop = this._properties[key];
    return prop ? prop.hasChanged : false;
  }

  /** */
  getSorter() {
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
