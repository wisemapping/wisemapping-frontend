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

export type FeatureType = 'note' | 'link' | 'icon';

class FeatureModel {
  static _next_id = 0;
  private _id: number;
  private _type: FeatureType;
  private _attributes: {};

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

    // Create type method ...
    this[`is${FeatureModel.capitalize(type)}Model`] = () => true;
  }

  getAttributes() {
    return { ...this._attributes };
  }

  static capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  setAttributes(attributes) {
    Object.keys(attributes).forEach((attr) => {
      const funName = `set${FeatureModel.capitalize(attr)}`;
      const value = attributes[attr];
      this[funName](value);
    });
  }

  setAttribute(key: string, value: any) {
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
    $assert(Number.isFinite(id));
    this._id = id;
  }

  getType(): FeatureType {
    return this._type;
  }

  static _nextUUID(): number {
    const result = FeatureModel._next_id + 1;
    FeatureModel._next_id = result;
    return result;
  }
}

export default FeatureModel;
