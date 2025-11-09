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

describe('Canvas Zoom Tests', () => {
  let canvas: Canvas;
  let mockScreenManager: jest.Mocked<ScreenManager>;

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
  });

  test('setZoom should calculate viewport center focused coordinates by default', () => {
    // Set initial state
    const workspace = (canvas as any)._workspace;
    workspace.getCoordOrigin.mockReturnValue({ x: -500, y: -400 });
    workspace.getCoordSize.mockReturnValue({ width: 1000, height: 800 });

    // Calculate expected center of visible area: origin + half coord size
    // visibleCenterX = -500 + 1000/2 = 0
    // visibleCenterY = -400 + 800/2 = 0
    // New coord origin = visibleCenter - newCoordSize/2
    // coordOriginX = 0 - 2000/2 = -1000
    // coordOriginY = 0 - 1600/2 = -800

    // Call setZoom (viewport center focus is now default)
    canvas.setZoom(2.0);

    // Verify that setCoordOrigin was called with correct viewport-centered coordinates
    expect(workspace.setCoordOrigin).toHaveBeenCalledWith(-1000, -800);
    expect(workspace.setCoordSize).toHaveBeenCalledWith(2000, 1600); // 1000*2, 800*2
  });

  test('setZoom with different zoom levels should maintain viewport centering', () => {
    const workspace = (canvas as any)._workspace;
    workspace.getCoordOrigin.mockReturnValue({ x: -500, y: -400 });
    workspace.getCoordSize.mockReturnValue({ width: 1000, height: 800 });

    canvas.setZoom(0.5);

    expect(workspace.setCoordOrigin).toHaveBeenCalled();
    expect(workspace.setCoordSize).toHaveBeenCalledWith(500, 400); // 1000*0.5, 800*0.5
  });

  test('setZoom with center flag should center the viewport', () => {
    const workspace = (canvas as any)._workspace;

    canvas.setZoom(2.0, true);

    expect(workspace.setCoordOrigin).toHaveBeenCalledWith(-1000, -800); // -(width/2)*zoom, -(height/2)*zoom
    expect(workspace.setCoordSize).toHaveBeenCalledWith(2000, 1600);
  });
});
