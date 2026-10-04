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

import Canvas from '../../src/components/Canvas';
import ScreenManager from '../../src/components/ScreenManager';

const mockSetCoordOrigin = jest.fn();

jest.mock('@wisemapping/web2d', () => ({
  Workspace: jest.fn().mockImplementation(() => ({
    addItAsChildTo: jest.fn(),
    getCoordOrigin: jest.fn().mockReturnValue({ x: 0, y: 0 }),
    setCoordOrigin: mockSetCoordOrigin,
    setCoordSize: jest.fn(),
    getCoordSize: jest.fn().mockReturnValue({ width: 1000, height: 800 }),
    getSVGElement: jest.fn(),
  })),
}));

jest.mock('../../src/components/layout/LayoutEventBus', () => ({
  __esModule: true,
  default: {
    fireEvent: jest.fn(),
    addEvent: jest.fn(),
    removeEvent: jest.fn(),
  },
}));

type TouchPoint = { clientX: number; clientY: number };

const mouseEvent = (type: string, clientX = 0, clientY = 0): MouseEvent =>
  new MouseEvent(type, { clientX, clientY, bubbles: true, cancelable: true });

const touchEvent = (type: string, touches: TouchPoint[]): Event => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'touches', { value: touches });
  Object.defineProperty(event, 'changedTouches', { value: touches });
  return event;
};

describe('Canvas drag (pan) events', () => {
  let container: HTMLDivElement;
  let canvas: Canvas;
  let listeners: Map<string, Set<EventListenerOrEventListenerObject>>;

  const listenerCount = (type: string): number => listeners.get(type)?.size ?? 0;

  beforeEach(() => {
    mockSetCoordOrigin.mockClear();
    container = document.createElement('div');
    document.body.appendChild(container);

    // Track the listeners bound to the container, mirroring the DOM's de-duplication.
    listeners = new Map();
    const originalAdd = container.addEventListener.bind(container);
    const originalRemove = container.removeEventListener.bind(container);
    jest.spyOn(container, 'addEventListener').mockImplementation((type, listener, options?) => {
      if (!listeners.has(type)) {
        listeners.set(type, new Set());
      }
      listeners.get(type)!.add(listener!);
      originalAdd(type, listener, options);
    });
    jest.spyOn(container, 'removeEventListener').mockImplementation((type, listener, options?) => {
      listeners.get(type)?.delete(listener!);
      originalRemove(type, listener, options);
    });

    const screenManager = new ScreenManager(container);
    canvas = new Canvas(screenManager, 1, false, false);
    canvas.registerEvents();
  });

  afterEach(() => {
    canvas.dispose();
    container.remove();
    jest.restoreAllMocks();
  });

  it('unbinds the touchmove and touchend listeners once a mouse pan ends', () => {
    const baseline = {
      touchmove: listenerCount('touchmove'),
      touchend: listenerCount('touchend'),
      mousemove: listenerCount('mousemove'),
      mouseup: listenerCount('mouseup'),
    };

    for (let i = 0; i < 3; i++) {
      container.dispatchEvent(mouseEvent('mousedown', 10, 10));
      container.dispatchEvent(mouseEvent('mousemove', 20 + i, 20));
      container.dispatchEvent(mouseEvent('mouseup', 20 + i, 20));
    }

    expect(listenerCount('touchmove')).toBe(baseline.touchmove);
    expect(listenerCount('touchend')).toBe(baseline.touchend);
    expect(listenerCount('mousemove')).toBe(baseline.mousemove);
    expect(listenerCount('mouseup')).toBe(baseline.mouseup);
    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
  });

  it('does not keep panning on touchmove after a mouse pan has ended', () => {
    container.dispatchEvent(mouseEvent('mousedown', 10, 10));
    container.dispatchEvent(mouseEvent('mousemove', 30, 30));
    container.dispatchEvent(mouseEvent('mouseup', 30, 30));
    mockSetCoordOrigin.mockClear();

    container.dispatchEvent(touchEvent('touchmove', [{ clientX: 100, clientY: 100 }]));

    expect(mockSetCoordOrigin).not.toHaveBeenCalled();
  });

  it('keeps workspace events enabled after a multi-touch (pinch) start', () => {
    container.dispatchEvent(
      touchEvent('touchstart', [
        { clientX: 10, clientY: 10 },
        { clientX: 50, clientY: 50 },
      ]),
    );

    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
    expect(listenerCount('touchmove')).toBe(0);
  });

  it('still pans with a single finger after a pinch gesture', () => {
    container.dispatchEvent(
      touchEvent('touchstart', [
        { clientX: 10, clientY: 10 },
        { clientX: 50, clientY: 50 },
      ]),
    );

    container.dispatchEvent(touchEvent('touchstart', [{ clientX: 10, clientY: 10 }]));
    container.dispatchEvent(touchEvent('touchmove', [{ clientX: 40, clientY: 25 }]));

    expect(mockSetCoordOrigin).toHaveBeenLastCalledWith(-30, -15);

    container.dispatchEvent(touchEvent('touchend', []));
    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
    expect(listenerCount('touchmove')).toBe(0);
    expect(listenerCount('touchend')).toBe(0);
  });

  it('ends the pan when the button is released outside the container', () => {
    const click = jest.fn();
    canvas.getScreenManager().addEvent('click', click);

    container.dispatchEvent(mouseEvent('mousedown', 10, 10));
    container.dispatchEvent(mouseEvent('mousemove', 30, 30));
    document.body.dispatchEvent(mouseEvent('mouseup', 900, 900));

    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
    expect(document.body.style.cursor).toBe('default');
    expect(click).not.toHaveBeenCalled();

    // With the button up the canvas must no longer follow the cursor ...
    mockSetCoordOrigin.mockClear();
    container.dispatchEvent(mouseEvent('mousemove', 60, 60));
    expect(mockSetCoordOrigin).not.toHaveBeenCalled();
  });

  it('keeps panning while the cursor is outside the container', () => {
    container.dispatchEvent(mouseEvent('mousedown', 10, 10));
    document.body.dispatchEvent(mouseEvent('mousemove', 40, 25));

    expect(mockSetCoordOrigin).toHaveBeenLastCalledWith(-30, -15);
  });

  it('ends the pan when the window loses focus, without firing a click', () => {
    const click = jest.fn();
    canvas.getScreenManager().addEvent('click', click);

    container.dispatchEvent(mouseEvent('mousedown', 10, 10));
    window.dispatchEvent(new Event('blur'));

    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
    expect(click).not.toHaveBeenCalled();

    mockSetCoordOrigin.mockClear();
    container.dispatchEvent(mouseEvent('mousemove', 60, 60));
    expect(mockSetCoordOrigin).not.toHaveBeenCalled();
  });

  it('ends a touch pan when the touch is cancelled', () => {
    container.dispatchEvent(touchEvent('touchstart', [{ clientX: 10, clientY: 10 }]));
    container.dispatchEvent(touchEvent('touchcancel', []));

    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
    expect(listenerCount('touchmove')).toBe(0);
    expect(listenerCount('touchend')).toBe(0);
  });

  it('still pans after the events are registered again (a second map load)', () => {
    canvas.registerEvents();

    container.dispatchEvent(mouseEvent('mousedown', 10, 10));
    container.dispatchEvent(mouseEvent('mousemove', 40, 25));

    expect(mockSetCoordOrigin).toHaveBeenLastCalledWith(-30, -15);
    expect(listenerCount('mousedown')).toBe(1);
    expect(listenerCount('touchstart')).toBe(1);
  });
});

describe('Canvas window listeners', () => {
  let container: HTMLDivElement;
  let canvases: Canvas[];

  const buildCanvas = (): Canvas => {
    const canvas = new Canvas(new ScreenManager(container), 1, false, false);
    canvases.push(canvas);
    return canvas;
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    canvases = [];
  });

  afterEach(() => {
    canvases.forEach((canvas) => canvas.dispose());
    container.remove();
    jest.restoreAllMocks();
  });

  const resizeListeners = (spy: jest.SpyInstance) =>
    spy.mock.calls.filter(([type]) => type === 'resize').map(([, listener]) => listener);

  it('registers a single resize listener however many maps are loaded', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const canvas = buildCanvas();

    canvas.registerEvents();
    canvas.registerEvents();

    expect(resizeListeners(addSpy)).toHaveLength(1);
  });

  it('removes its window listeners on dispose', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const canvas = buildCanvas();
    canvas.registerEvents();

    canvas.dispose();

    const added = resizeListeners(addSpy);
    expect(added).toHaveLength(1);
    expect(resizeListeners(removeSpy)).toEqual(added);

    // Neither the container nor the window drive the disposed canvas any more ...
    mockSetCoordOrigin.mockClear();
    container.dispatchEvent(mouseEvent('mousedown', 10, 10));
    container.dispatchEvent(mouseEvent('mousemove', 40, 25));
    window.dispatchEvent(new Event('resize'));
    expect(mockSetCoordOrigin).not.toHaveBeenCalled();
  });

  it('ends a pan in progress on dispose', () => {
    const canvas = buildCanvas();
    canvas.registerEvents();
    container.dispatchEvent(mouseEvent('mousedown', 10, 10));

    canvas.dispose();

    mockSetCoordOrigin.mockClear();
    document.body.dispatchEvent(mouseEvent('mousemove', 40, 25));
    expect(mockSetCoordOrigin).not.toHaveBeenCalled();
    expect(document.body.style.cursor).not.toBe('move');
  });
});
