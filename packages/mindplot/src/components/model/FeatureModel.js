/*
 *    Copyright [2015] [wisemapping]
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
import $ from 'jquery';

class FeatureModel {
  /**
     * @constructs
     * @param type
     * @throws will throw an exception if type is null or undefined
     * assigns a unique id and the given type to the new model
     */
  constructor(type) {
    $assert(type, 'type can not be null');
    this._id = FeatureModel._nextUUID();

    this._type = type;
    this._attributes = {};

    // Create type method ...
    this[`is${FeatureModel.camelize(type)}Model`] = () => true;
  }

  /** */
  getAttributes() {
    return { ...this._attributes };
  }

  static camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase())).replace(/\s+/g, '');
  }

  /** */
  setAttributes(attributes) {
    for (const attr in attributes) {
      const funName = `set${FeatureModel.camelize(attr)}`;
      const value = attributes[attr];
      this[funName](value);
    }
  }

  /** */
  setAttribute(key, value) {
    $assert(key, 'key id can not be null');
    this._attributes[key] = value;
  }

  /** */
  getAttribute(key) {
    $assert(key, 'key id can not be null');

    return this._attributes[key];
  }

  /** */
  getId() {
    return this._id;
  }

  /** */
  setId(id) {
    this._id = id;
  }

  /** */
  getType() {
    return this._type;
  }
}

FeatureModel._nextUUID = function _nextUUID() {
  if (!$defined(FeatureModel._uuid)) {
    FeatureModel._uuid = 0;
  }

  FeatureModel._uuid += 1;
  return FeatureModel._uuid;
};

export default FeatureModel;
