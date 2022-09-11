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

class Events {
  protected _handlerByType;

  constructor() {
    this._handlerByType = {};
  }

  static _normalizeEventName(string: string) {
    return string.replace(/^on([A-Z])/, (_full, first) => first.toLowerCase());
  }

  addEvent(typeName: string, fn?, internal?: boolean): Events {
    const type = Events._normalizeEventName(typeName);

    // Add function had not been added yet
    const funByType = this._handlerByType[type] ? this._handlerByType[type] : [];
    if (!funByType.includes(fn)) {
      funByType.push(fn);
      this._handlerByType[type] = funByType;
    }

    // Mark reference ...
    fn.internal = Boolean(internal);
    return this;
  }

  fireEvent(typeName: string, eventArgs?): Events {
    const type = Events._normalizeEventName(typeName);
    const events = this._handlerByType[type];
    if (!events) return this;

    const args = Array.isArray(eventArgs) ? eventArgs : [eventArgs];
    events.forEach((fn) => {
      fn.apply(this, args);
    });
    return this;
  }

  removeEvent(typeName: string, fn?): Events {
    const type = Events._normalizeEventName(typeName);
    const events = this._handlerByType[type];
    if (events && !fn.internal) {
      const index = events.indexOf(fn);
      if (index !== -1) events.splice(index, 1);
    }
    return this;
  }
}

export default Events;
