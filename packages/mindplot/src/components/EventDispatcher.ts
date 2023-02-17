/* eslint-disable @typescript-eslint/no-explicit-any */
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
class EventDispispatcher<T> {
  private _handlerByType: Map<T, ((args?: any) => void)[]>;

  constructor() {
    this._handlerByType = new Map();
  }

  private static _normalizeEventName<K>(value: K): K {
    return String(value).replace(/^on([A-Z])/, (_full, first) => first.toLowerCase()) as K;
  }

  addEvent(typeName: T, fn: (args?: any) => void, internal?: boolean): void {
    const type = EventDispispatcher._normalizeEventName(typeName);

    let events = this._handlerByType.get(type);
    // Add function had not been added yet
    events = events || [];
    if (events && !events.includes(fn)) {
      events.push(fn);
      this._handlerByType.set(type, events);
    }

    // Mark reference ...
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fn.internal = Boolean(internal);
  }

  fireEvent(typeName: T, arg?: any): void {
    const type = EventDispispatcher._normalizeEventName(typeName);
    const events = this._handlerByType.get(type);
    if (events) {
      const args: any = arg ? [arg] : [];
      events.forEach((fn) => {
        fn.apply(this, args);
      });
    }
  }

  removeEvent(typeName: T, fn: (...args: any) => void): void {
    const type = EventDispispatcher._normalizeEventName(typeName);
    const events = this._handlerByType.get(type);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (events && !fn.internal) {
      const index = events.indexOf(fn);
      if (index !== -1) {
        events.splice(index, 1);
      }
    }
  }
}

export default EventDispispatcher;
