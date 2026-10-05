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
import EventDispispatcher from '../../src/components/EventDispatcher';

type Events = { change: unknown; ping: void };

describe('EventDispatcher.fireEvent', () => {
  it.each([0, false, '', null])('passes the falsy payload %p to the handlers', (payload) => {
    const dispatcher = new EventDispispatcher<Events>();
    const handler = jest.fn();
    dispatcher.addEvent('change', handler);

    dispatcher.fireEvent('change', payload);

    expect(handler).toHaveBeenCalledWith(payload);
  });

  it('calls the handlers with no argument when there is no payload', () => {
    const dispatcher = new EventDispispatcher<Events>();
    const handler = jest.fn();
    dispatcher.addEvent('ping', handler);

    dispatcher.fireEvent('ping');

    expect(handler).toHaveBeenCalledWith();
  });

  it('still calls the next handler when one removes itself during dispatch', () => {
    const dispatcher = new EventDispispatcher<Events>();
    const once: jest.Mock<void, []> = jest.fn(() => dispatcher.removeEvent('change', once));
    const next = jest.fn();
    dispatcher.addEvent('change', once);
    dispatcher.addEvent('change', next);

    dispatcher.fireEvent('change', 1);

    expect(once).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(1);

    dispatcher.fireEvent('change', 2);
    expect(once).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(2);
  });

  it('does not call a handler an earlier one removed during dispatch', () => {
    const dispatcher = new EventDispispatcher<Events>();
    const removed = jest.fn();
    dispatcher.addEvent('change', () => dispatcher.removeEvent('change', removed));
    dispatcher.addEvent('change', removed);

    dispatcher.fireEvent('change', 1);

    expect(removed).not.toHaveBeenCalled();
  });

  it('does not call a handler added during dispatch until the next event', () => {
    const dispatcher = new EventDispispatcher<Events>();
    const late = jest.fn();
    dispatcher.addEvent('change', () => dispatcher.addEvent('change', late));

    dispatcher.fireEvent('change', 1);
    expect(late).not.toHaveBeenCalled();

    dispatcher.fireEvent('change', 2);
    expect(late).toHaveBeenCalledWith(2);
  });
});

describe('EventDispatcher typing and registration', () => {
  type Typed = { moved: { x: number }; done: void };

  it('checks each handler and fireEvent against the payload of its event', () => {
    const dispatcher = new EventDispispatcher<Typed>();
    const moved = jest.fn((payload: { x: number }) => payload.x);
    dispatcher.addEvent('moved', moved);
    // Checked by tsc only: never run.
    const misuses = (): void => {
      // @ts-expect-error a handler for another payload is rejected
      dispatcher.addEvent('moved', (payload: string) => payload);
      // @ts-expect-error an event without a payload takes no argument
      dispatcher.fireEvent('done', 1);
      // @ts-expect-error an event with a payload needs it
      dispatcher.fireEvent('moved');
      // @ts-expect-error unknown events are rejected
      dispatcher.addEvent('unknown', () => undefined);
    };
    expect(misuses).toBeInstanceOf(Function);

    dispatcher.fireEvent('moved', { x: 3 });

    expect(moved).toHaveBeenCalledWith({ x: 3 });
  });

  it('keeps an internal handler on removeEvent, and drops the mark when added again', () => {
    const dispatcher = new EventDispispatcher<Typed>();
    const handler = jest.fn();
    dispatcher.addEvent('done', handler, true);

    dispatcher.removeEvent('done', handler);
    expect(dispatcher.listenerCount('done')).toBe(1);

    dispatcher.addEvent('done', handler);
    dispatcher.removeEvent('done', handler);
    expect(dispatcher.listenerCount('done')).toBe(0);
  });

  it('counts the handlers of one event or of all of them', () => {
    const dispatcher = new EventDispispatcher<Typed>();
    dispatcher.addEvent('done', () => undefined);
    dispatcher.addEvent('moved', () => undefined);
    dispatcher.addEvent('moved', () => undefined);

    expect(dispatcher.listenerCount('moved')).toBe(2);
    expect(dispatcher.listenerCount()).toBe(3);
  });
});
