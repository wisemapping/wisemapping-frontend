/* eslint-disable @typescript-eslint/no-explicit-any */
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
import EventDispatcher from '../EventDispatcher';
import { LayoutEventBusType } from '../LayoutEventBusType';

class LayoutEventBus {
  private _dispatcher: EventDispatcher<LayoutEventBusType>;

  constructor() {
    this._dispatcher = new EventDispatcher<LayoutEventBusType>();
  }

  fireEvent(type: LayoutEventBusType, arg?: any): void {
    this._dispatcher.fireEvent(type, arg);
  }

  addEvent(type: LayoutEventBusType, fn: (arg?: any) => void, internal?: boolean): void {
    this._dispatcher.addEvent(type, fn, internal);
  }

  removeEvent(type: LayoutEventBusType, fn: (arg?: any) => void): void {
    this._dispatcher.removeEvent(type, fn);
  }

  reset(): void {
    this._dispatcher = new EventDispatcher<LayoutEventBusType>();
  }
}

const layoutEventBus = new LayoutEventBus();
export default layoutEventBus;
export { LayoutEventBus };
