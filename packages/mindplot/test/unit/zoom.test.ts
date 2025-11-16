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

// Mock DOM elements and jQuery
const mockDiv = {
  css: jest.fn().mockReturnValue('1000'),
  width: jest.fn().mockReturnValue(1000),
  height: jest.fn().mockReturnValue(800),
  position: jest.fn().mockReturnValue({ left: 0, top: 0 }),
  find: jest.fn().mockReturnValue({
    attr: jest.fn(),
  }),
};

const mockContainer = {
  ...mockDiv,
  bind: jest.fn(),
  unbind: jest.fn(),
  trigger: jest.fn(),
};

// Mock ScreenManager
jest.mock('../../src/components/ScreenManager');
const MockedScreenManager = ScreenManager as jest.MockedClass<typeof ScreenManager>;

// Mock Workspace2D
jest.mock('@wisemapping/web2d', () => ({
  Workspace: jest.fn().mockImplementation(() => ({
    addItAsChildTo: jest.fn(),
    getCoordOrigin: jest.fn().mockReturnValue({ x: -500, y: -400 }),
    setCoordOrigin: jest.fn(),
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

const layoutEventBus = LayoutEventBus as jest.Mocked<typeof LayoutEventBus>;

describe('Canvas', () => {
  let canvas: Canvas;
  let mockScreenManager: jest.Mocked<ScreenManager>;
  let workspace;

  beforeEach(() => {
    MockedScreenManager.mockImplementation(() => {
      const instance = {
        getContainer: jest.fn().mockReturnValue(mockContainer),
        getVisibleBrowserSize: jest.fn().mockReturnValue({ width: 1000, height: 800 }),
        getContainerWidth: jest.fn().mockReturnValue(1000),
        getContainerHeight: jest.fn().mockReturnValue(800),
        findInContainer: jest.fn().mockReturnValue({
          setAttribute: jest.fn(),
          getAttribute: jest.fn(),
        }),
        setOffset: jest.fn(),
        setScale: jest.fn(),
        fireEvent: jest.fn(),
        addEvent: jest.fn(),
        removeEvent: jest.fn(),
      };
      return instance as any;
    });

    mockScreenManager = new MockedScreenManager({} as any) as jest.Mocked<ScreenManager>;
    canvas = new Canvas(mockScreenManager, 1.0, false, false);
    workspace = (canvas as any)._workspace;
  });

  describe('zoom', () => {
    test('setZoom should calculate viewport center focused coordinates by default', () => {
      workspace.getCoordOrigin.mockReturnValue({ x: -500, y: -400 });
      workspace.getCoordSize.mockReturnValue({ width: 1000, height: 800 });

      canvas.setZoom(2.0);

      expect(workspace.setCoordOrigin).toHaveBeenCalledWith(-1000, -800);
      expect(workspace.setCoordSize).toHaveBeenCalledWith(2000, 1600);
    });

    test('setZoom with different zoom levels should maintain viewport centering', () => {
      workspace.getCoordOrigin.mockReturnValue({ x: -500, y: -400 });
      workspace.getCoordSize.mockReturnValue({ width: 1000, height: 800 });

      canvas.setZoom(0.5);

      expect(workspace.setCoordOrigin).toHaveBeenCalled();
      expect(workspace.setCoordSize).toHaveBeenCalledWith(500, 400);
    });

    test('setZoom with center flag should center the viewport', () => {
      canvas.setZoom(2.0, true);

      expect(workspace.setCoordOrigin).toHaveBeenCalledWith(-1000, -800);
      expect(workspace.setCoordSize).toHaveBeenCalledWith(2000, 1600);
    });
  });

  describe('ensureVisible', () => {
    beforeEach(() => {
      workspace.getCoordOrigin.mockReturnValue({ x: 0, y: 0 });
      workspace.getCoordSize.mockReturnValue({ width: 1000, height: 800 });
      workspace.setCoordOrigin.mockClear();
      mockScreenManager.setOffset.mockClear();
      mockScreenManager.fireEvent.mockClear();
      layoutEventBus.fireEvent.mockClear();
    });

    test('pans when bounds exceed the right edge', () => {
      const result = canvas.ensureVisible({ left: 1200, right: 1250, top: 100, bottom: 200 });

      expect(result).toBe(true);
      expect(workspace.setCoordOrigin).toHaveBeenCalledWith(330, 0);
      expect(mockScreenManager.setOffset).toHaveBeenCalledWith(330, 0);
      expect(mockScreenManager.fireEvent).toHaveBeenCalledWith('update');
      expect(layoutEventBus.fireEvent).toHaveBeenCalledWith('canvasPanned');
    });

    test('pans when bounds are too close to the top-left edge', () => {
      const result = canvas.ensureVisible({ left: 40, right: 80, top: 10, bottom: 40 });

      expect(result).toBe(true);
      expect(workspace.setCoordOrigin).toHaveBeenCalledWith(-40, -70);
      expect(mockScreenManager.setOffset).toHaveBeenCalledWith(-40, -70);
      expect(layoutEventBus.fireEvent).toHaveBeenCalledWith('canvasPanned');
    });

    test('does nothing when target is comfortably inside the viewport', () => {
      const result = canvas.ensureVisible({ left: 200, right: 260, top: 200, bottom: 240 });

      expect(result).toBe(false);
      expect(workspace.setCoordOrigin).not.toHaveBeenCalled();
      expect(mockScreenManager.setOffset).not.toHaveBeenCalled();
      expect(layoutEventBus.fireEvent).not.toHaveBeenCalled();
    });
  });
});
