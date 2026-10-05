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
import LayoutEventBus from '../../src/components/layout/LayoutEventBus';

const mockDiv = {
  css: jest.fn().mockReturnValue('1000'),
  width: jest.fn().mockReturnValue(1000),
  height: jest.fn().mockReturnValue(800),
  position: jest.fn().mockReturnValue({ left: 0, top: 0 }),
  find: jest.fn().mockReturnValue({ attr: jest.fn() }),
};

const mockContainer = {
  ...mockDiv,
  bind: jest.fn(),
  unbind: jest.fn(),
  trigger: jest.fn(),
};

// Mutable viewport state shared with the Workspace2D mock below.
let coordOrigin = { x: 0, y: 0 };
const mockSetCoordOrigin = jest.fn((x: number, y: number) => {
  coordOrigin = { x, y };
});

jest.mock('../../src/components/ScreenManager');
const MockedScreenManager = ScreenManager as jest.MockedClass<typeof ScreenManager>;

jest.mock('@wisemapping/web2d', () => ({
  Workspace: jest.fn().mockImplementation(() => ({
    addItAsChildTo: jest.fn(),
    getCoordOrigin: jest.fn(() => coordOrigin),
    setCoordOrigin: (x: number, y: number) => mockSetCoordOrigin(x, y),
    setSize: jest.fn(),
    setCoordSize: jest.fn(),
    getCoordSize: jest.fn().mockReturnValue({ width: 1000, height: 800 }),
    getSVGElement: jest.fn().mockReturnValue({
      parentElement: { parentElement: { setAttribute: jest.fn() } },
    }),
  })),
}));

describe('Canvas.centerOnPosition', () => {
  let canvas: Canvas;
  let mockScreenManager: jest.Mocked<ScreenManager>;
  let setOffset: jest.Mock;
  let fireEvent: jest.Mock;
  let busFireEvent: jest.SpyInstance;

  beforeEach(() => {
    coordOrigin = { x: 0, y: 0 };
    mockSetCoordOrigin.mockClear();
    setOffset = jest.fn();
    fireEvent = jest.fn();

    MockedScreenManager.mockImplementation(
      () =>
        ({
          getContainer: jest.fn().mockReturnValue(mockContainer),
          getVisibleBrowserSize: jest.fn().mockReturnValue({ width: 1000, height: 800 }),
          getContainerWidth: jest.fn().mockReturnValue(1000),
          getContainerHeight: jest.fn().mockReturnValue(800),
          findInContainer: jest.fn().mockReturnValue({
            setAttribute: jest.fn(),
            getAttribute: jest.fn(),
          }),
          setOffset,
          setScale: jest.fn(),
          fireEvent,
          addEvent: jest.fn(),
          removeEvent: jest.fn(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockScreenManager = new MockedScreenManager({} as any) as jest.Mocked<ScreenManager>;
    canvas = new Canvas(mockScreenManager, 1.0, false, false);

    // The constructor calls setZoom(zoom, true), which already moved the origin.
    coordOrigin = { x: 0, y: 0 };
    mockSetCoordOrigin.mockClear();
    setOffset.mockClear();
    fireEvent.mockClear();
    busFireEvent = jest.spyOn(LayoutEventBus, 'fireEvent').mockImplementation();
  });

  afterEach(() => {
    busFireEvent.mockRestore();
  });

  it('places the position at the centre of the visible area', () => {
    const moved = canvas.centerOnPosition({ x: 500, y: 300 });

    // A 1000x800 viewport centred on (500, 300) starts at (0, -100).
    expect(moved).toBe(true);
    expect(mockSetCoordOrigin).toHaveBeenCalledWith(0, -100);
    expect(setOffset).toHaveBeenCalledWith(0, -100);
  });

  it('handles negative coordinates', () => {
    canvas.centerOnPosition({ x: -250, y: -600 });

    expect(mockSetCoordOrigin).toHaveBeenCalledWith(-750, -1000);
    expect(setOffset).toHaveBeenCalledWith(-750, -1000);
  });

  it('notifies listeners that the canvas moved so they can re-sync overlays', () => {
    canvas.centerOnPosition({ x: 120, y: 240 });

    expect(fireEvent).toHaveBeenCalledWith('update');
    expect(busFireEvent).toHaveBeenCalledWith('canvasPanned');
  });

  it('is a no-op when the position is already centred', () => {
    // Origin (0, 0) with a 1000x800 coord size is already centred on (500, 400).
    const moved = canvas.centerOnPosition({ x: 500, y: 400 });

    expect(moved).toBe(false);
    expect(mockSetCoordOrigin).not.toHaveBeenCalled();
    expect(setOffset).not.toHaveBeenCalled();
    expect(busFireEvent).not.toHaveBeenCalled();
  });

  it('always re-centres, unlike ensureVisible which only pans when needed', () => {
    const bounds = { left: 480, right: 520, top: 380, bottom: 420 };

    // Dead centre of the viewport: ensureVisible leaves the origin alone ...
    expect(canvas.ensureVisible(bounds)).toBe(false);
    expect(mockSetCoordOrigin).not.toHaveBeenCalled();

    // ... and a node near (but not at) the centre is left alone too, while
    // centerOnPosition moves the origin to put it exactly in the middle.
    expect(canvas.ensureVisible({ left: 380, right: 420, top: 280, bottom: 320 })).toBe(false);
    expect(canvas.centerOnPosition({ x: 400, y: 300 })).toBe(true);
    expect(mockSetCoordOrigin).toHaveBeenCalledWith(-100, -100);
  });
});
