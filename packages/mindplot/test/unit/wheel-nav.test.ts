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

import Designer from '../../src/components/Designer';
import { DesignerOptions } from '../../src/components/DesignerOptionsBuilder';
import DesignerKeyboard from '../../src/components/DesignerKeyboard';
import WidgetBuilder from '../../src/components/WidgetBuilder';

const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

jest.mock('@wisemapping/web2d', () => {
  const actual = jest.requireActual('@wisemapping/web2d');
  return {
    ...actual,
    Workspace: jest.fn().mockImplementation(() => ({
      addItAsChildTo: jest.fn(),
      append: jest.fn((elem: { peer?: { _native?: Node } }) => {
        if (elem?.peer?._native) {
          svgElement.appendChild(elem.peer._native);
        }
      }),
      removeChild: jest.fn((elem: { peer?: { _native?: Node } }) => {
        if (elem?.peer?._native?.parentNode) {
          elem.peer._native.parentNode.removeChild(elem.peer._native);
        }
      }),
      getCoordOrigin: jest.fn().mockReturnValue({ x: 0, y: 0 }),
      setCoordOrigin: jest.fn(),
      setCoordSize: jest.fn(),
      getCoordSize: jest.fn().mockReturnValue({ width: 1000, height: 800 }),
      getSVGElement: jest.fn().mockReturnValue(svgElement),
    })),
  };
});

jest.mock('../../src/components/layout/LayoutEventBus', () => ({
  __esModule: true,
  default: {
    fireEvent: jest.fn(),
    addEvent: jest.fn(),
    removeEvent: jest.fn(),
  },
}));

jest.mock('../../src/components/SvgImageIcon', () => ({
  default: jest.fn(),
}));

jest.mock('../../src/components/export/PDFExporter', () => ({
  __esModule: true,
  default: class {},
}));

jest.mock('../../src/components/DesignerKeyboard', () => ({
  isDisabled: jest.fn().mockReturnValue(false),
  register: jest.fn(),
}));

describe('Designer Wheel Navigation (Pan vs Zoom)', () => {
  let designer: Designer;
  let container: HTMLDivElement;
  let wheelHandler: (event: WheelEvent) => void;

  beforeEach(() => {
    container = document.createElement('div');
    const addEventListenerSpy = jest.spyOn(container, 'addEventListener');

    const options: DesignerOptions = {
      zoom: 1.0,
      mode: 'edition-owner',
      divContainer: container,
      locale: 'en',
      widgetManager: {} as unknown as WidgetBuilder,
    };

    designer = new Designer(options);

    // Capture the wheel listener attached to container
    const wheelCall = addEventListenerSpy.mock.calls.find((call) => call[0] === 'wheel');
    expect(wheelCall).toBeDefined();
    wheelHandler = wheelCall![1] as (event: WheelEvent) => void;

    (DesignerKeyboard.isDisabled as jest.Mock).mockReturnValue(false);
    jest.spyOn(designer, 'panBy').mockImplementation();
    jest.spyOn(designer, 'zoomIn').mockImplementation();
    jest.spyOn(designer, 'zoomOut').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('2-finger / Wheel Panning (no modifiers)', () => {
    it('pans canvas when deltaX and deltaY are emitted without modifier keys', () => {
      const event = {
        deltaX: 25,
        deltaY: 40,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;

      wheelHandler(event);

      expect(designer.panBy).toHaveBeenCalledWith(25, 40);
      expect(designer.zoomIn).not.toHaveBeenCalled();
      expect(designer.zoomOut).not.toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('does not pan when deltaX and deltaY are both 0', () => {
      const event = {
        deltaX: 0,
        deltaY: 0,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;

      wheelHandler(event);

      expect(designer.panBy).not.toHaveBeenCalled();
      expect(designer.zoomIn).not.toHaveBeenCalled();
      expect(designer.zoomOut).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Modifier Zooming', () => {
    it('zooms in when deltaY < 0 with metaKey (Cmd on macOS)', () => {
      const event = {
        deltaX: 0,
        deltaY: -20,
        ctrlKey: false,
        metaKey: true,
        altKey: false,
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;

      wheelHandler(event);

      expect(designer.zoomIn).toHaveBeenCalled();
      expect(designer.panBy).not.toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('zooms out when deltaY > 0 with metaKey (Cmd on macOS)', () => {
      const event = {
        deltaX: 0,
        deltaY: 20,
        ctrlKey: false,
        metaKey: true,
        altKey: false,
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;

      wheelHandler(event);

      expect(designer.zoomOut).toHaveBeenCalled();
      expect(designer.panBy).not.toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('zooms in when deltaY < 0 with altKey (Option/Alt)', () => {
      const event = {
        deltaX: 0,
        deltaY: -15,
        ctrlKey: false,
        metaKey: false,
        altKey: true,
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;

      wheelHandler(event);

      expect(designer.zoomIn).toHaveBeenCalled();
      expect(designer.panBy).not.toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('zooms in when deltaY < 0 with ctrlKey (Ctrl / trackpad pinch)', () => {
      const event = {
        deltaX: 0,
        deltaY: -10,
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;

      wheelHandler(event);

      expect(designer.zoomIn).toHaveBeenCalled();
      expect(designer.panBy).not.toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('does nothing for zoom when deltaY is 0 with modifier key', () => {
      const event = {
        deltaX: 10,
        deltaY: 0,
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;

      wheelHandler(event);

      expect(designer.zoomIn).not.toHaveBeenCalled();
      expect(designer.zoomOut).not.toHaveBeenCalled();
      expect(designer.panBy).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Disabled State', () => {
    it('ignores wheel events when DesignerKeyboard is disabled', () => {
      (DesignerKeyboard.isDisabled as jest.Mock).mockReturnValue(true);

      const event = {
        deltaX: 10,
        deltaY: 20,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;

      wheelHandler(event);

      expect(designer.panBy).not.toHaveBeenCalled();
      expect(designer.zoomIn).not.toHaveBeenCalled();
      expect(designer.zoomOut).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});
