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
import FeatureType from './FeatureType';

class FeatureModel {
  static _nextId = 0;

  private _id: number;

  private _type: FeatureType;

  private _attributes;

  private _changeListener: (() => void) | undefined;

  /**
   * @constructs
   * @param type
   * @throws will throw an exception if type is null or undefined
   * assigns a unique id and the given type to the new model
   */
  constructor(type: FeatureType) {
    $assert(type, 'type can not be null');
    this._id = FeatureModel._nextUUID();

    this._type = type;
    this._attributes = {};
    this._changeListener = undefined;

    // Create type method ...
    this[`is${FeatureModel.capitalize(type)}Model`] = () => true;
  }

  getAttributes() {
    return { ...this._attributes };
  }

  static capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Applies the given attributes. An undefined value removes the attribute, so a snapshot that
   * also lists the keys the feature lacked restores it exactly.
   */
  setAttributes(attributes: Record<string, unknown>): void {
    Object.keys(attributes).forEach((key) => {
      const value = attributes[key];
      if (value === undefined) {
        delete this._attributes[key];
      } else {
        this.applyAttribute(key, value);
      }
    });
    this._changeListener?.();
  }

  /**
   * Sets the function called after setAttributes, so the icon showing the feature can follow
   * changes made by commands (e.g. an undo).
   */
  setChangeListener(listener: (() => void) | undefined): void {
    this._changeListener = listener;
  }

  /**
   * Sets one attribute. Subclasses map their attributes to their setters, so values are
   * validated and normalized. Otherwise, a set<Key> setter declared by the subclass is used,
   * never FeatureModel's own (the 'id' attribute is not the feature id), else the raw value is stored.
   */
  applyAttribute(key: string, value: unknown): void {
    const setterName = `set${FeatureModel.capitalize(key)}`;
    const setter = this[setterName];
    if (typeof setter === 'function' && !(setterName in FeatureModel.prototype)) {
      setter.call(this, value);
    } else {
      this.setAttribute(key, value);
    }
  }

  setAttribute(key: string, value: unknown) {
    $assert(key, 'key id can not be null');
    this._attributes[key] = value;
  }

  getAttribute(key: string) {
    $assert(key, 'key id can not be null');

    return this._attributes[key];
  }

  getId(): number {
    return this._id;
  }

  setId(id: number) {
    $assert(Number.isFinite(id), `id is not a number ${id}`);
    this._id = id;
  }

  getType(): FeatureType {
    return this._type;
  }

  static _nextUUID(): number {
    const result = FeatureModel._nextId + 1;
    FeatureModel._nextId = result;
    return result;
  }
}

export default FeatureModel;
