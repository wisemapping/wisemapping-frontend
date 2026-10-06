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
import type { EventArgs, EventHandler } from '../EventDispatcher';
import EventDispatcher from '../EventDispatcher';
import type { LayoutEventBusType, LayoutEvents } from '../LayoutEventBusType';

/** The payload of each event. Topics send their model, not themselves. */
export type LayoutEventPayloads = LayoutEvents;
export type { LayoutEvents };

/**
 * The layout events of one designer: its topics, canvas and commands fire them, and its layout,
 * selection overlays and auto-pan listen. Each designer has its own bus, so two designers on a
 * page never see each other's events.
 */
class LayoutEventBus {
  private _dispatcher: EventDispatcher<LayoutEvents>;

  constructor() {
    this._dispatcher = new EventDispatcher<LayoutEvents>();
  }

  fireEvent<T extends LayoutEventBusType>(type: T, ...args: EventArgs<LayoutEvents[T]>): void {
    this._dispatcher.fireEvent(type, ...args);
  }

  addEvent<T extends LayoutEventBusType>(
    type: T,
    fn: EventHandler<LayoutEvents[T]>,
    internal?: boolean,
  ): void {
    this._dispatcher.addEvent(type, fn, internal);
  }

  removeEvent<T extends LayoutEventBusType>(type: T, fn: EventHandler<LayoutEvents[T]>): void {
    this._dispatcher.removeEvent(type, fn);
  }

  /** The number of handlers registered, for one event or for all of them. */
  listenerCount(type?: LayoutEventBusType): number {
    return this._dispatcher.listenerCount(type);
  }

  reset(): void {
    this._dispatcher = new EventDispatcher<LayoutEvents>();
  }
}

export default LayoutEventBus;
export { LayoutEventBus };
