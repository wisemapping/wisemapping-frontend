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
/**
 * The handler of an event: it receives the payload its event map gives that event. An event
 * whose payload is `void` calls it with no argument.
 */
export type EventHandler<P> = (payload: P) => void;

/** The arguments fireEvent takes after the event name: none for an event without a payload. */
export type EventArgs<P> = [P] extends [void] ? [] : [P];

/** The names of an event map. */
export type EventName<M> = keyof M & string;

/**
 * Dispatches the events of the map M, which gives the payload of each event name. A handler is
 * checked against the payload of its event, and fireEvent against the payload it sends.
 */
class EventDispispatcher<M extends object> {
  // Handlers of different events take different payloads: the map is typed per call ...
  private _handlerByType: Map<string, EventHandler<never>[]>;

  // Handlers added as internal: removeEvent leaves them in place.
  private _internalHandlers: WeakSet<EventHandler<never>>;

  constructor() {
    this._handlerByType = new Map();
    this._internalHandlers = new WeakSet();
  }

  private static _normalizeEventName(value: string): string {
    return value.replace(/^on([A-Z])/, (_full, first: string) => first.toLowerCase());
  }

  addEvent<K extends EventName<M>>(typeName: K, fn: EventHandler<M[K]>, internal?: boolean): void {
    const type = EventDispispatcher._normalizeEventName(typeName);

    // Add function had not been added yet
    const events = this._handlerByType.get(type) || [];
    if (!events.includes(fn)) {
      events.push(fn);
      this._handlerByType.set(type, events);
    }

    // Mark reference ...
    if (internal) {
      this._internalHandlers.add(fn);
    } else {
      this._internalHandlers.delete(fn);
    }
  }

  fireEvent<K extends EventName<M>>(typeName: K, ...args: EventArgs<M[K]>): void {
    const type = EventDispispatcher._normalizeEventName(typeName);
    const events = this._handlerByType.get(type) as ((...a: unknown[]) => void)[] | undefined;
    if (events) {
      // Falsy payloads (0, false, '') are still payloads ...
      const payload: unknown[] = args[0] !== undefined ? [args[0]] : [];
      // Iterate over a copy, so a handler removing itself does not skip the next one.
      // A handler removed by an earlier one during this dispatch is not called ...
      [...events].forEach((fn) => {
        if (events.includes(fn)) {
          fn.apply(this, payload);
        }
      });
    }
  }

  /** The number of handlers registered, for one event or for all of them. */
  listenerCount(typeName?: EventName<M>): number {
    if (typeName !== undefined) {
      const type = EventDispispatcher._normalizeEventName(typeName);
      return this._handlerByType.get(type)?.length ?? 0;
    }
    let count = 0;
    this._handlerByType.forEach((events) => {
      count += events.length;
    });
    return count;
  }

  removeEvent<K extends EventName<M>>(typeName: K, fn: EventHandler<M[K]>): void {
    const type = EventDispispatcher._normalizeEventName(typeName);
    const events = this._handlerByType.get(type);

    if (events && !this._internalHandlers.has(fn)) {
      const index = events.indexOf(fn);
      if (index !== -1) {
        events.splice(index, 1);
      }
    }
  }
}

export default EventDispispatcher;
