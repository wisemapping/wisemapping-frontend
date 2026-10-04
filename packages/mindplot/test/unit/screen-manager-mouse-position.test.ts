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

import ScreenManager from '../../src/components/ScreenManager';

const setWindowScroll = (x: number, y: number): void => {
  Object.defineProperty(window, 'scrollX', { value: x, configurable: true });
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
};

const touchEvent = (
  type: string,
  touches: { clientX: number; clientY: number }[],
  changedTouches: { clientX: number; clientY: number }[],
): TouchEvent => {
  const event = new Event(type);
  Object.defineProperty(event, 'touches', { value: touches });
  Object.defineProperty(event, 'changedTouches', { value: changedTouches });
  return event as TouchEvent;
};

describe('ScreenManager.getWorkspaceMousePosition', () => {
  let container: HTMLDivElement;
  let screenManager: ScreenManager;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    // Viewport-relative rect, as returned by the browser.
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 50,
      right: 900,
      bottom: 650,
      width: 800,
      height: 600,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    } as DOMRect);
    screenManager = new ScreenManager(container);
  });

  afterEach(() => {
    setWindowScroll(0, 0);
    container.remove();
    jest.restoreAllMocks();
  });

  it('maps viewport coordinates to the container origin', () => {
    setWindowScroll(0, 0);
    const event = new MouseEvent('mousedown', { clientX: 150, clientY: 80 });

    expect(screenManager.getWorkspaceMousePosition(event)).toEqual({ x: 50, y: 30 });
  });

  it('ignores the host page scroll, since clientX/Y and the rect are both viewport relative', () => {
    setWindowScroll(200, 300);
    const event = new MouseEvent('mousedown', { clientX: 150, clientY: 80 });

    expect(screenManager.getWorkspaceMousePosition(event)).toEqual({ x: 50, y: 30 });
  });

  it('applies scale and offset after the container adjustment', () => {
    setWindowScroll(200, 300);
    screenManager.setScale(2);
    screenManager.setOffset(-400, -300);
    const event = new MouseEvent('mousemove', { clientX: 150, clientY: 80 });

    expect(screenManager.getWorkspaceMousePosition(event)).toEqual({ x: -300, y: -240 });
  });

  it('uses the active touch for touchmove', () => {
    const event = touchEvent('touchmove', [{ clientX: 120, clientY: 70 }], []);

    expect(screenManager.getWorkspaceMousePosition(event)).toEqual({ x: 20, y: 20 });
  });

  it('falls back to changedTouches on touchend, where touches is empty', () => {
    const event = touchEvent('touchend', [], [{ clientX: 130, clientY: 90 }]);

    expect(screenManager.getWorkspaceMousePosition(event)).toEqual({ x: 30, y: 40 });
  });

  it('keeps getContainerPosition in document coordinates', () => {
    setWindowScroll(200, 300);

    expect(screenManager.getContainerPosition()).toEqual({ left: 300, top: 350 });
  });
});
