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

import { Workspace } from '@wisemapping/web2d';
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

// W5: positions go through the SVG screen matrix (Workspace.clientToWorld) where the browser has
// one. jsdom has none, so the tests below give the SVG a getScreenCTM.
describe('ScreenManager.getWorkspaceMousePosition through the workspace screen matrix (W5)', () => {
  let container: HTMLDivElement;
  let screenManager: ScreenManager;
  let workspace: Workspace;

  // The container at viewport (100, 50); zoom 2 (2 workspace units per pixel), panned to
  // (-400, -300), as Canvas sets them.
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    jest
      .spyOn(container, 'getBoundingClientRect')
      .mockReturnValue({ left: 100, top: 50, width: 800, height: 600 } as DOMRect);
    screenManager = new ScreenManager(container);
    workspace = new Workspace({ width: '800px', height: '600px' });
    workspace.addItAsChildTo(container);
    workspace.setCoordSize(1600, 1200);
    workspace.setCoordOrigin(-400, -300);
    screenManager.setScale(2);
    screenManager.setOffset(-400, -300);
  });

  afterEach(() => {
    container.remove();
    jest.restoreAllMocks();
  });

  /** The screen matrix of the SVG drawn with its top-left corner at viewport (left, top). */
  const svgAt = (left: number, top: number) => {
    const { x, y } = workspace.getCoordOrigin();
    workspace.getSVGElement().getScreenCTM = () =>
      ({ a: 0.5, b: 0, c: 0, d: 0.5, e: left - x * 0.5, f: top - y * 0.5 }) as DOMMatrix;
  };

  it('gives what the container maths gave, for an SVG at the container corner', () => {
    const event = new MouseEvent('mousemove', { clientX: 150, clientY: 80 });
    const fromContainer = screenManager.getWorkspaceMousePosition(event);

    screenManager.setWorkspace(workspace);
    svgAt(100, 50);

    expect(fromContainer).toEqual({ x: -300, y: -240 });
    expect(screenManager.getWorkspaceMousePosition(event)).toEqual({ x: -300, y: -240 });
  });

  it('accounts for where the SVG really is, such as inside a container border', () => {
    screenManager.setWorkspace(workspace);
    // A 10 px border moves the SVG 10 px right and down: 20 workspace units at zoom 2.
    svgAt(110, 60);
    const event = new MouseEvent('mousemove', { clientX: 150, clientY: 80 });

    expect(screenManager.getWorkspaceMousePosition(event)).toEqual({ x: -320, y: -260 });
  });

  it('maps touches the same way', () => {
    screenManager.setWorkspace(workspace);
    svgAt(100, 50);
    const event = touchEvent('touchmove', [{ clientX: 150, clientY: 80 }], []);

    expect(screenManager.getWorkspaceMousePosition(event)).toEqual({ x: -300, y: -240 });
  });

  it('uses the container maths without a screen matrix (jsdom) or a workspace', () => {
    const event = new MouseEvent('mousemove', { clientX: 150, clientY: 80 });
    screenManager.setWorkspace(workspace);
    expect(screenManager.getWorkspaceMousePosition(event)).toEqual({ x: -300, y: -240 });

    svgAt(110, 60);
    screenManager.setWorkspace(null);
    expect(screenManager.getWorkspaceMousePosition(event)).toEqual({ x: -300, y: -240 });
  });
});
