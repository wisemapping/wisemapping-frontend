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

// A workspace whose screen matrix follows its viewBox, as a browser's getScreenCTM does: a client
// point maps to origin + client * zoom, with the origin the pan moves.
const mockState = { origin: { x: 0, y: 0 }, zoom: 2 };

jest.mock('@wisemapping/web2d', () => ({
  Workspace: jest.fn().mockImplementation(() => ({
    addItAsChildTo: jest.fn(),
    getCoordOrigin: () => ({ ...mockState.origin }),
    setCoordOrigin: (x: number, y: number) => {
      mockState.origin = { x, y };
    },
    setSize: jest.fn(),
    setCoordSize: jest.fn(),
    getCoordSize: jest.fn().mockReturnValue({ width: 1000, height: 800 }),
    getSVGElement: () => ({ getScreenCTM: () => ({}) }),
    clientToWorld: (x: number, y: number) => ({
      x: mockState.origin.x + x * mockState.zoom,
      y: mockState.origin.y + y * mockState.zoom,
    }),
    _getHtmlContainer: jest.fn().mockReturnValue({ remove: jest.fn() }),
    observeResize: jest.fn(() => () => {}),
    dispose: jest.fn(),
  })),
}));

jest.mock('../../src/components/layout/LayoutEventBus', () => ({
  __esModule: true,
  default: class {
    fireEvent = jest.fn();

    addEvent = jest.fn();

    removeEvent = jest.fn();
  },
}));

const mouseEvent = (type: string, clientX: number, clientY: number): MouseEvent =>
  new MouseEvent(type, { clientX, clientY, bubbles: true, cancelable: true });

// A pan read the pointer through the screen matrix, which the pan itself moves: every move after
// the first was measured in an already shifted frame, so the map lagged behind the pointer (30 px
// in the editor relationship spec). The pan now follows the pointer in screen pixels.
describe('Canvas pan with a screen matrix that follows the viewBox', () => {
  let container: HTMLDivElement;
  let canvas: Canvas;

  beforeEach(() => {
    mockState.origin = { x: 0, y: 0 };
    container = document.createElement('div');
    document.body.appendChild(container);
    canvas = new Canvas(new ScreenManager(container), mockState.zoom, false, false);
    canvas.registerEvents();
  });

  afterEach(() => {
    canvas.dispose();
    container.remove();
  });

  it('moves the map by exactly the pointer move, scaled by the zoom, over several moves', () => {
    const start = { ...mockState.origin };
    container.dispatchEvent(mouseEvent('mousedown', 100, 100));
    container.dispatchEvent(mouseEvent('mousemove', 150, 130));
    container.dispatchEvent(mouseEvent('mousemove', 160, 140));
    container.dispatchEvent(mouseEvent('mouseup', 160, 140));

    // 60 x 40 pixels at 2 workspace units per pixel.
    expect(mockState.origin).toEqual({ x: start.x - 120, y: start.y - 80 });
  });
});
