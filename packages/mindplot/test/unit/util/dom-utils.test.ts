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
import DOMUtils from '../../../src/components/util/DOMUtils';
import EventManager from '../../../src/components/util/EventManager';

afterEach(() => {
  document.body.innerHTML = '';
  jest.useRealTimers();
});

describe('DOMUtils getters and setters', () => {
  it('sets a style, and reads the computed value', () => {
    const element = document.body.appendChild(document.createElement('div'));
    DOMUtils.css(element, 'zIndex', '8');
    DOMUtils.css(element, 'display', 'none');
    expect(element.style.zIndex).toBe('8');
    expect(DOMUtils.css(element, 'display')).toBe('none');
  });

  it('sets and reads html, text and attributes', () => {
    const element = document.createElement('div');
    DOMUtils.html(element, '<b>bold</b>');
    expect(DOMUtils.html(element)).toBe('<b>bold</b>');
    expect(DOMUtils.text(element)).toBe('bold');

    DOMUtils.text(element, '<i>');
    expect(element.innerHTML).toBe('&lt;i&gt;');

    expect(DOMUtils.attr(element, 'title')).toBe('');
    DOMUtils.attr(element, 'title', 'tip');
    expect(DOMUtils.attr(element, 'title')).toBe('tip');
  });

  it('sets and reads input values', () => {
    const input = document.createElement('input');
    DOMUtils.val(input, 'typed');
    expect(DOMUtils.val(input)).toBe('typed');
  });

  it('shows and hides', () => {
    const element = document.createElement('div');
    DOMUtils.hide(element);
    expect(element.style.display).toBe('none');
    DOMUtils.show(element);
    expect(element.style.display).toBe('block');
  });

  it('places an element absolutely, and reads its document offset', () => {
    const element = document.body.appendChild(document.createElement('div'));
    DOMUtils.offset(element, { top: 10, left: 20 });
    expect(element.style.position).toBe('absolute');
    expect(element.style.top).toBe('10px');
    expect(element.style.left).toBe('20px');

    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top: 5, left: 7 } as DOMRect);
    expect(DOMUtils.offset(element)).toEqual({
      top: 5 + window.pageYOffset,
      left: 7 + window.pageXOffset,
    });
  });

  it('reads sizes and positions', () => {
    const element = document.createElement('div');
    expect(DOMUtils.width(element)).toBe(0);
    expect(DOMUtils.height(element)).toBe(0);
    expect(DOMUtils.position(element)).toEqual({ top: 0, left: 0 });
    expect(DOMUtils.windowWidth()).toBe(window.innerWidth);
    expect(DOMUtils.windowHeight()).toBe(window.innerHeight);
  });
});

describe('DOMUtils tree helpers', () => {
  it('appends, finds, reads the parent and removes', () => {
    const parent = DOMUtils.createElement('div');
    const child = DOMUtils.createElement('span');
    child.className = 'item';
    DOMUtils.append(parent, child);

    expect(DOMUtils.find(parent, '.item')).toEqual([child]);
    expect(DOMUtils.parent(child)).toBe(parent);

    DOMUtils.remove(child);
    expect(DOMUtils.find(parent, '.item')).toEqual([]);
    // Removing a detached element is a no-op.
    expect(() => DOMUtils.remove(child)).not.toThrow();
  });

  it('fades an element out, then hides it and clears the transition', () => {
    jest.useFakeTimers();
    const element = document.createElement('div');
    DOMUtils.fadeOut(element, 200);
    expect(element.style.opacity).toBe('0');
    expect(element.style.transition).toBe('opacity 200ms');

    jest.advanceTimersByTime(200);
    expect(element.style.display).toBe('none');
    expect(element.style.transition).toBe('');
    expect(element.style.opacity).toBe('');
  });

  it('creates an empty XML document', () => {
    const doc = DOMUtils.createDocument();
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
