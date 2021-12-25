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
  constructor() {
    this.$events = {};
  }

  static _removeOn(string) {
    return string.replace(/^on([A-Z])/, (full, first) => first.toLowerCase());
  }

  addEvent(typeName, fn, internal) {
    const type = Events._removeOn(typeName);

    // Add function had not been added yet
    const funByType = this.$events[type] ? this.$events[type] : [];
    if (!funByType.includes(fn)) {
      funByType.push(fn);
      this.$events[type] = funByType;
    }

    // Mark reference ...
    // eslint-disable-next-line no-param-reassign
    fn.internal = Boolean(internal);
    return this;
  }

  fireEvent(typeName, eventArgs, delay) {
    const type = Events._removeOn(typeName);
    const events = this.$events[type];
    if (!events) return this;

    const args = Array.isArray(eventArgs) ? eventArgs : [eventArgs];
    events.forEach(((fn) => {
      if (delay) {
        fn.delay(delay, this, args);
      } else {
        fn.apply(this, args);
      }
    }));
    return this;
  }

  removeEvent(typeName, fn) {
    const type = Events._removeOn(typeName);
    const events = this.$events[type];
    if (events && !fn.internal) {
      const index = events.indexOf(fn);
      if (index !== -1) events.splice(index, 1);
    }
    return this;
  }
}

export default Events;
