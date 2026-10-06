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
import { createDocument } from '../../../src/components/util/DOMUtils';
import EventManager from '../../../src/components/util/EventManager';

afterEach(() => {
  document.body.innerHTML = '';
  jest.useRealTimers();
});

describe('createDocument', () => {
  it('creates an empty XML document', () => {
    const doc = createDocument();
    expect(doc.documentElement).toBeNull();
    doc.appendChild(doc.createElement('map'));
    expect(doc.documentElement.tagName).toBe('map');
  });
});

describe('EventManager', () => {
  it('binds and unbinds a listener', () => {
    const element = document.createElement('div');
    const handler = jest.fn();
    EventManager.bind(element, 'custom', handler);
    element.dispatchEvent(new Event('custom'));
    EventManager.unbind(element, 'custom', handler);
    element.dispatchEvent(new Event('custom'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('triggers a custom event carrying data', () => {
    const element = document.createElement('div');
    const handler = jest.fn();
    element.addEventListener('changed', handler);
    EventManager.trigger(element, 'changed', { value: 1 });
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({ value: 1 });
  });

  it.each([
    ['click', MouseEvent],
    ['mousedown', MouseEvent],
    ['mouseout', MouseEvent],
    ['keydown', KeyboardEvent],
    ['keypress', KeyboardEvent],
    ['input', Event],
  ] as const)('triggers a bubbling %s event of the right type', (name, type) => {
    const parent = document.createElement('div');
    const element = parent.appendChild(document.createElement('div'));
    const handler = jest.fn();
    parent.addEventListener(name, handler);

    EventManager.trigger(element, name);
    const event = handler.mock.calls[0][0] as Event;
    expect(event).toBeInstanceOf(type);
    expect(event.bubbles).toBe(true);
    expect(event.cancelable).toBe(true);
  });
});
