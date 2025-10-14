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
const mockSetAttribute = jest.fn();
jest.mock('@wisemapping/web2d', () => ({
  Workspace: jest.fn().mockImplementation(() => ({
    addItAsChildTo: jest.fn(),
    getCoordOrigin: jest.fn().mockReturnValue({ x: 0, y: 0 }),
    setCoordOrigin: jest.fn(),
    setCoordSize: jest.fn(),
    getCoordSize: jest.fn().mockReturnValue({ width: 1000, height: 800 }),
    getSVGElement: jest.fn().mockReturnValue({
      parentElement: {
        parentElement: {
          setAttribute: mockSetAttribute,
        },
      },
    }),
  })),
}));

describe('Canvas Background Style Tests', () => {
  let canvas: Canvas;
  let mockScreenManager: jest.Mocked<ScreenManager>;

  beforeEach(() => {
    mockSetAttribute.mockClear();

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
    canvas = new Canvas(mockScreenManager, 1.0, false);
  });

  test('should apply solid background style correctly', () => {
    const cssStyle = `
      position: relative;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
      overflow: hidden;
      opacity: 1;
      background-color: #f2f2f2;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    `;

    canvas.setBackgroundStyle(cssStyle);

    expect(mockSetAttribute).toHaveBeenCalledWith('style', cssStyle);
  });

  test('should apply grid background style correctly', () => {
    const cssStyle = `
      position: relative;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
      overflow: hidden;
      opacity: 1;
      background-color: #f2f2f2;
      background-image: linear-gradient(#ebe9e7 1px, transparent 1px),
        linear-gradient(to right, #ebe9e7 1px, #f2f2f2 1px);
      background-size: 50px 50px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    `;

    canvas.setBackgroundStyle(cssStyle);

    expect(mockSetAttribute).toHaveBeenCalledWith('style', cssStyle);
  });

  test('should apply dots background style correctly', () => {
    const cssStyle = `
      position: relative;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
      overflow: hidden;
      opacity: 1;
      background-color: #ffffff;
      background-image: radial-gradient(circle, #cccccc 1px, transparent 1px);
      background-size: 25px 25px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    `;

    canvas.setBackgroundStyle(cssStyle);

    expect(mockSetAttribute).toHaveBeenCalledWith('style', cssStyle);
  });

  test('should handle empty style string', () => {
    const cssStyle = '';

    canvas.setBackgroundStyle(cssStyle);

    expect(mockSetAttribute).toHaveBeenCalledWith('style', '');
  });

  test('should handle complex CSS with multiple properties', () => {
    const cssStyle = `
      position: relative;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
      overflow: hidden;
      opacity: 1;
      background-color: #ff0000;
      background-image: linear-gradient(#00ff00 2px, transparent 2px),
        linear-gradient(to right, #00ff00 2px, #ff0000 2px);
      background-size: 100px 100px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    `;

    canvas.setBackgroundStyle(cssStyle);

    expect(mockSetAttribute).toHaveBeenCalledWith('style', cssStyle);
  });

  test('should find correct DOM element for style application', () => {
    const workspace = (canvas as any)._workspace;
    const mockSVGElement = {
      parentElement: {
        parentElement: {
          setAttribute: mockSetAttribute,
        },
      },
    };
    workspace.getSVGElement.mockReturnValue(mockSVGElement);

    const cssStyle = 'background-color: #f2f2f2;';
    canvas.setBackgroundStyle(cssStyle);

    expect(workspace.getSVGElement).toHaveBeenCalled();
    expect(mockSetAttribute).toHaveBeenCalledWith('style', cssStyle);
  });
});
