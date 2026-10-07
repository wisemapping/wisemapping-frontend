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

import { Group } from '@wisemapping/web2d';
import type { CommandDispatcher } from '../../src/components/ActionDispatcher';
import ActionDispatcher from '../../src/components/ActionDispatcher';
import type Canvas from '../../src/components/Canvas';
import DragManager from '../../src/components/DragManager';
import DragPivot from '../../src/components/DragPivot';
import DragTopic from '../../src/components/DragTopic';
import type EventBusDispatcher from '../../src/components/layout/EventBusDispatcher';
import type LayoutManager from '../../src/components/layout/LayoutManager';
import type NodeGraph from '../../src/components/NodeGraph';
import ScreenManager from '../../src/components/ScreenManager';
import type Topic from '../../src/components/Topic';

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {},
}));

type CanvasElementLike = {
  addToWorkspace?: (canvas: Canvas) => void;
  removeFromWorkspace?: (canvas: Canvas) => void;
};

const mouseEvent = (
  type: string,
  clientX = 0,
  clientY = 0,
  init: MouseEventInit = {},
): MouseEvent =>
  new MouseEvent(type, { clientX, clientY, bubbles: true, cancelable: true, ...init });

// A workspace double that only records what is appended to it.
const buildCanvas = (container: HTMLDivElement) => {
  const screenManager = new ScreenManager(container);
  let eventsEnabled = true;
  const appended: unknown[] = [];
  const root = new Group();
  const canvas = {
    getScreenManager: () => screenManager,
    isWorkspaceEventsEnabled: () => eventsEnabled,
    enableWorkspaceEvents: (value: boolean) => {
      eventsEnabled = value;
    },
    append: (elem: CanvasElementLike) => {
      appended.push(elem);
      if (elem.addToWorkspace) {
        elem.addToWorkspace(canvas as unknown as Canvas);
      } else {
        root.append(elem as never);
      }
    },
    removeChild: (elem: CanvasElementLike) => {
      if (elem.removeFromWorkspace) {
        elem.removeFromWorkspace(canvas as unknown as Canvas);
      } else {
        root.removeChild(elem as never);
      }
    },
  };
  return { canvas: canvas as unknown as Canvas, appended };
};

const layoutManager = {
  getOrientation: () => 'horizontal',
  predict: () => ({ order: 0, position: { x: 0, y: 0 } }),
} as unknown as LayoutManager;

// A draggable topic double: it keeps the mousedown listener the DragManager registers.
const buildTopic = () => {
  let mouseDown: ((event: Event) => void) | null = null;
  const node = {
    getId: () => 3,
    isCentralTopic: () => false,
    isInWorkspace: () => true,
    // A topic without a designer: it runs its commands through ActionDispatcher.getInstance().
    getActionDispatcher: () => ActionDispatcher.getInstance(),
    getSize: () => ({ width: 40, height: 20 }),
    addEvent: (type: string, listener: (event: Event) => void) => {
      if (type === 'mousedown') mouseDown = listener;
    },
    createDragNode: (manager: LayoutManager) => {
      const shape = new Group();
      return new DragTopic(shape, node as unknown as NodeGraph, manager);
    },
  };
  return {
    topic: node as unknown as Topic,
    pressMouse: (x: number, y: number, init: MouseEventInit = {}) =>
      mouseDown!(mouseEvent('mousedown', x, y, init)),
  };
};

describe('DragManager', () => {
  let container: HTMLDivElement;
  let canvas: Canvas;
  let dragManager: DragManager;
  let dragTopicAction: jest.Mock;
  let startDragging: jest.Mock;
  let dragging: jest.Mock;
  let endDragging: jest.Mock;
  let pressMouse: (x: number, y: number, init?: MouseEventInit) => void;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    ({ canvas } = buildCanvas(container));

    dragTopicAction = jest.fn();
    jest.spyOn(ActionDispatcher, 'getInstance').mockReturnValue({
      dragTopic: dragTopicAction,
      moveTopic: jest.fn(),
    } as unknown as CommandDispatcher);

    const eventDispatcher = {
      getLayoutManager: () => layoutManager,
    } as unknown as EventBusDispatcher;
    dragManager = new DragManager(canvas, eventDispatcher);

    // Mirror what Designer registers: the drop applies the drag node changes.
    startDragging = jest.fn();
    dragging = jest.fn();
    endDragging = jest.fn((_event: MouseEvent, dragTopic: DragTopic) =>
      dragTopic.applyChanges(canvas),
    );
    dragManager.addEvent('startdragging', startDragging);
    dragManager.addEvent('dragging', dragging);
    dragManager.addEvent('enddragging', endDragging);

    const draggable = buildTopic();
    dragManager.add(draggable.topic);
    ({ pressMouse } = draggable);
  });

  afterEach(() => {
    // Leave no drag hanging around between tests.
    window.dispatchEvent(new Event('blur'));
    container.remove();
    document.body.style.cursor = '';
    jest.restoreAllMocks();
  });

  const startDrag = () => {
    pressMouse(10, 10);
    container.dispatchEvent(mouseEvent('mousemove', 40, 40));
    expect(startDragging).toHaveBeenCalledTimes(1);
    expect(dragging).toHaveBeenCalledTimes(1);
  };

  describe('the button of the press', () => {
    const onPlatform = (platform: string) => {
      Object.defineProperty(window.navigator, 'platform', { value: platform, configurable: true });
    };

    afterEach(() => {
      delete (window.navigator as { platform?: string }).platform;
    });

    /** Whether a press with `init` and a move start a drag. */
    const dragsWith = (init: MouseEventInit): boolean => {
      pressMouse(10, 10, init);
      document.body.dispatchEvent(mouseEvent('mousemove', 40, 40, init));
      const dragged = startDragging.mock.calls.length > 0;
      document.body.dispatchEvent(mouseEvent('mouseup', 40, 40, init));
      return dragged;
    };

    it('the left button drags the topic', () => {
      expect(dragsWith({ button: 0 })).toBe(true);
    });

    it('a Ctrl press drags the topic elsewhere: it drags it disconnected', () => {
      onPlatform('Win32');
      expect(dragsWith({ button: 0, ctrlKey: true })).toBe(true);
    });

    it('the right button does not drag the topic, nor keep the canvas waiting', () => {
      // Before: it started a pending drag, which the next move turned into a drag.
      expect(dragsWith({ button: 2, buttons: 2 })).toBe(false);
      expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
    });

    it('a Ctrl press on a Mac, its right click, does not drag the topic', () => {
      onPlatform('MacIntel');
      expect(dragsWith({ button: 0, ctrlKey: true })).toBe(false);
      expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
    });

    it('the middle, back and forward buttons do not drag the topic', () => {
      expect(dragsWith({ button: 1 })).toBe(false);
      expect(dragsWith({ button: 3 })).toBe(false);
      expect(dragsWith({ button: 4 })).toBe(false);
    });
  });

  it('drops the topic when the button is released inside the container', () => {
    startDrag();
    container.dispatchEvent(mouseEvent('mouseup', 40, 40));

    expect(endDragging).toHaveBeenCalledTimes(1);
    expect(dragTopicAction).toHaveBeenCalledTimes(1);
    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
  });

  it('ends the drag when the button is released outside the container', () => {
    startDrag();
    document.body.dispatchEvent(mouseEvent('mouseup', 900, 900));

    expect(endDragging).toHaveBeenCalledTimes(1);
    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
    expect(document.body.style.cursor).toBe('default');

    // With the button up the topic must no longer follow the cursor ...
    container.dispatchEvent(mouseEvent('mousemove', 60, 60));
    expect(dragging).toHaveBeenCalledTimes(1);
  });

  it('keeps following the cursor while it is outside the container', () => {
    startDrag();
    document.body.dispatchEvent(mouseEvent('mousemove', 900, 900));

    expect(dragging).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['the window loses focus', () => window.dispatchEvent(new Event('blur'))],
    [
      'Escape is pressed',
      () =>
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
    ],
  ])('cancels the drag without moving the topic when %s', (_label, cancel) => {
    startDrag();
    cancel();

    expect(dragTopicAction).not.toHaveBeenCalled();
    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
    expect(document.body.style.cursor).toBe('default');
    expect((dragManager as unknown as { _isDragInProcess: boolean })._isDragInProcess).toBe(false);

    // Nothing follows the cursor, and the next release does not drop the topic ...
    container.dispatchEvent(mouseEvent('mousemove', 60, 60));
    container.dispatchEvent(mouseEvent('mouseup', 60, 60));
    expect(dragging).toHaveBeenCalledTimes(1);
    expect(dragTopicAction).not.toHaveBeenCalled();
  });

  it('cancels cleanly when the window loses focus before the drag threshold is met', () => {
    pressMouse(10, 10);
    window.dispatchEvent(new Event('blur'));

    expect(startDragging).not.toHaveBeenCalled();
    expect(endDragging).not.toHaveBeenCalled();
    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);

    container.dispatchEvent(mouseEvent('mousemove', 60, 60));
    expect(startDragging).not.toHaveBeenCalled();
  });

  // BL4-48: Designer.dispose() cancels a drag in progress.
  it('cancel() abandons the drag in progress and releases its listeners', () => {
    startDrag();
    const removeDocumentListener = jest.spyOn(document, 'removeEventListener');
    const removeWindowListener = jest.spyOn(window, 'removeEventListener');

    dragManager.cancel();

    expect(endDragging).toHaveBeenCalledTimes(1);
    expect(dragTopicAction).not.toHaveBeenCalled();
    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
    expect(document.body.style.cursor).toBe('default');
    const documentTypes = removeDocumentListener.mock.calls.map(([type]) => type);
    expect(documentTypes).toEqual(expect.arrayContaining(['mousemove', 'mouseup', 'keydown']));
    expect(removeWindowListener.mock.calls.map(([type]) => type)).toContain('blur');

    container.dispatchEvent(mouseEvent('mousemove', 60, 60));
    container.dispatchEvent(mouseEvent('mouseup', 60, 60));
    expect(dragging).toHaveBeenCalledTimes(1);
    expect(dragTopicAction).not.toHaveBeenCalled();
  });

  it('cancel() before the drag threshold is met releases the listeners', () => {
    pressMouse(10, 10);

    dragManager.cancel();

    expect(endDragging).not.toHaveBeenCalled();
    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
    container.dispatchEvent(mouseEvent('mousemove', 60, 60));
    expect(startDragging).not.toHaveBeenCalled();
  });

  it('cancel() without a drag in progress does nothing', () => {
    expect(() => dragManager.cancel()).not.toThrow();
    expect(endDragging).not.toHaveBeenCalled();
    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
  });

  // BL4-24: the central topic has no drag shape, and createDragNode throws for it.
  it('ignores a mousedown on a topic that can not be dragged', () => {
    const mouseDownListeners: ((event: Event) => void)[] = [];
    const central = {
      getId: () => 0,
      isCentralTopic: () => true,
      addEvent: (type: string, listener: (event: Event) => void) => {
        if (type === 'mousedown') mouseDownListeners.push(listener);
      },
      createDragNode: () => {
        throw new Error('CentralTopic has no drag shape: it can not be dragged');
      },
    } as unknown as Topic;
    dragManager.add(central);

    expect(() =>
      mouseDownListeners.forEach((listener) => listener(mouseEvent('mousedown', 10, 10))),
    ).not.toThrow();

    // The workspace is not left disabled, and nothing follows the cursor ...
    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
    container.dispatchEvent(mouseEvent('mousemove', 60, 60));
    expect(startDragging).not.toHaveBeenCalled();

    // ... so a draggable topic can still be dragged.
    startDrag();
  });

  // BL5-39: Designer adds every topic it builds and relies on this to skip the central one.
  it('registers no listener on the central topic', () => {
    const addEvent = jest.fn();
    dragManager.add({ getId: () => 0, isCentralTopic: () => true, addEvent } as unknown as Topic);

    expect(addEvent).not.toHaveBeenCalled();
  });

  it('ignores keys other than Escape during a drag', () => {
    startDrag();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

    container.dispatchEvent(mouseEvent('mousemove', 50, 50));
    expect(dragging).toHaveBeenCalledTimes(2);
  });
});

// <mindplot-component> renders the canvas inside its shadow root. The browser fires pointer
// events composed, so they leave the shadow root and reach the drag listeners on the document.
// (A synthetic event that is not composed, as Cypress' trigger() fires, stops at the shadow root.)
describe('DragManager with the canvas in a shadow root', () => {
  let host: HTMLElement;
  let container: HTMLDivElement;
  let inner: HTMLElement;
  let dragTopicAction: jest.Mock;
  let dragging: jest.Mock;
  let endDragging: jest.Mock;
  let pressMouse: (x: number, y: number) => void;

  const pointerEvent = (type: string, clientX: number, clientY: number): MouseEvent =>
    new MouseEvent(type, { clientX, clientY, bubbles: true, cancelable: true, composed: true });

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    const shadowRoot = host.attachShadow({ mode: 'open' });
    container = document.createElement('div');
    shadowRoot.appendChild(container);
    // An element of the map under the pointer ...
    inner = document.createElement('span');
    container.appendChild(inner);

    const { canvas } = buildCanvas(container);
    dragTopicAction = jest.fn();
    jest.spyOn(ActionDispatcher, 'getInstance').mockReturnValue({
      dragTopic: dragTopicAction,
      moveTopic: jest.fn(),
    } as unknown as CommandDispatcher);

    const dragManager = new DragManager(canvas, {
      getLayoutManager: () => layoutManager,
    } as unknown as EventBusDispatcher);
    dragging = jest.fn();
    endDragging = jest.fn((_event: MouseEvent, dragTopic: DragTopic) =>
      dragTopic.applyChanges(canvas),
    );
    dragManager.addEvent('dragging', dragging);
    dragManager.addEvent('enddragging', endDragging);

    const draggable = buildTopic();
    dragManager.add(draggable.topic);
    ({ pressMouse } = draggable);
  });

  afterEach(() => {
    window.dispatchEvent(new Event('blur'));
    host.remove();
    document.body.style.cursor = '';
    jest.restoreAllMocks();
  });

  it('drags and drops with the events a real pointer fires over the map', () => {
    pressMouse(10, 10);
    inner.dispatchEvent(pointerEvent('mousemove', 40, 40));
    inner.dispatchEvent(pointerEvent('mouseup', 40, 40));

    expect(dragging).toHaveBeenCalledTimes(1);
    expect(endDragging).toHaveBeenCalledTimes(1);
    expect(dragTopicAction).toHaveBeenCalledTimes(1);
  });

  it('ends the drag when the pointer is released outside the map', () => {
    pressMouse(10, 10);
    inner.dispatchEvent(pointerEvent('mousemove', 40, 40));
    document.body.dispatchEvent(pointerEvent('mouseup', 900, 900));

    expect(endDragging).toHaveBeenCalledTimes(1);
    expect(dragTopicAction).toHaveBeenCalledTimes(1);
  });
});

describe('DragManager drag pivot', () => {
  const containers: HTMLDivElement[] = [];

  const buildWorkspace = () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    containers.push(container);
    return { container, ...buildCanvas(container) };
  };

  afterEach(() => {
    window.dispatchEvent(new Event('blur'));
    containers.splice(0).forEach((c) => c.remove());
    jest.restoreAllMocks();
  });

  const eventDispatcher = {
    getLayoutManager: () => layoutManager,
  } as unknown as EventBusDispatcher;

  it('gives every workspace its own drag pivot', () => {
    const first = buildWorkspace();
    const second = buildWorkspace();
    const firstManager = new DragManager(first.canvas, eventDispatcher);
    const secondManager = new DragManager(second.canvas, eventDispatcher);

    const firstPivots = first.appended.filter((e) => e instanceof DragPivot);
    const secondPivots = second.appended.filter((e) => e instanceof DragPivot);
    expect(firstPivots).toHaveLength(1);
    expect(secondPivots).toHaveLength(1);
    expect(firstPivots[0] === secondPivots[0]).toBe(false);
    expect(firstManager.getDragPivot() === firstPivots[0]).toBe(true);
    expect(secondManager.getDragPivot() === secondPivots[0]).toBe(true);
  });

  it('connects a drag node to the pivot of the workspace it is dragged in', () => {
    const first = buildWorkspace();
    const second = buildWorkspace();
    const firstManager = new DragManager(first.canvas, eventDispatcher);
    const secondManager = new DragManager(second.canvas, eventDispatcher);

    let dragNode: DragTopic | null = null;
    firstManager.addEvent('startdragging', (_event, node) => {
      dragNode = node;
    });
    firstManager.addEvent('dragging', jest.fn());
    firstManager.addEvent('enddragging', jest.fn());
    const draggable = buildTopic();
    firstManager.add(draggable.topic);

    draggable.pressMouse(10, 10);
    first.container.dispatchEvent(mouseEvent('mousemove', 40, 40));

    const parent = { getId: () => 1 } as unknown as Topic;
    jest.spyOn(DragPivot.prototype, 'connectTo').mockImplementation(function connectTo(
      this: DragPivot,
      target: Topic,
    ) {
      (this as unknown as { _targetTopic: Topic })._targetTopic = target;
    });
    dragNode!.connectTo(parent);

    expect(firstManager.getDragPivot().getTargetTopic()).toBe(parent);
    expect(secondManager.getDragPivot().getTargetTopic()).toBeNull();
  });
});

describe('DragManager without listeners', () => {
  let container: HTMLDivElement;

  afterEach(() => {
    window.dispatchEvent(new Event('blur'));
    container.remove();
    jest.restoreAllMocks();
  });

  it('drags and drops when no startdragging or enddragging listener is registered', () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    const { canvas, appended } = buildCanvas(container);
    const eventDispatcher = {
      getLayoutManager: () => layoutManager,
    } as unknown as EventBusDispatcher;
    const dragManager = new DragManager(canvas, eventDispatcher);
    const draggable = buildTopic();
    dragManager.add(draggable.topic);

    // jsdom reports a listener that throws as a window error instead of rethrowing it.
    const errors: unknown[] = [];
    const onError = (event: ErrorEvent) => {
      errors.push(event.error);
      event.preventDefault();
    };
    window.addEventListener('error', onError);
    try {
      draggable.pressMouse(10, 10);
      container.dispatchEvent(mouseEvent('mousemove', 40, 40));
      const dragTopic = appended.find((e): e is DragTopic => e instanceof DragTopic);
      expect(dragTopic?.isInWorkspace()).toBe(true);

      container.dispatchEvent(mouseEvent('mouseup', 40, 40));
      expect(dragTopic?.isInWorkspace()).toBe(false);
    } finally {
      window.removeEventListener('error', onError);
    }

    expect(errors).toEqual([]);
    expect((dragManager as unknown as { _isDragInProcess: boolean })._isDragInProcess).toBe(false);
    expect(canvas.isWorkspaceEventsEnabled()).toBe(true);
  });
});
