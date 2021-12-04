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
import _ from '@libraries/underscore-min';

class Events {
  constructor() {
    this.$events = {};
  }

  static _removeOn(string) {
    return string.replace(/^on([A-Z])/, (full, first) => first.toLowerCase());
  }

  addEvent(type, fn, internal) {
    type = Events._removeOn(type);

    this.$events[type] = (this.$events[type] || []).include(fn);
    if (internal) fn.internal = true;
    return this;
  }

  fireEvent(type, args, delay) {
    type = Events._removeOn(type);
    const events = this.$events[type];
    if (!events) return this;
    args = Array.isArray(args) ? args : [args];
    _.each(
      events,
      function (fn) {
        if (delay) fn.delay(delay, this, args);
        else fn.apply(this, args);
      },
      this,
    );
    return this;
  }

  removeEvent(type, fn) {
    type = Events._removeOn(type);
    const events = this.$events[type];
    if (events && !fn.internal) {
      const index = events.indexOf(fn);
      if (index !== -1) events.splice(index, 1);
    }
    return this;
  }
}

export default Events;
