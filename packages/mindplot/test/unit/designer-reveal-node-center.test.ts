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
import WidgetBuilder from '../../src/components/WidgetBuilder';
import type Topic from '../../src/components/Topic';

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

const buildTopic = (position: { x: number; y: number }): Topic =>
  ({
    getId: () => 7,
    getParent: () => null,
    getPosition: () => position,
    getSize: () => ({ width: 100, height: 40 }),
    setOnFocus: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any as Topic;

describe('Designer node centering', () => {
  let designer: Designer;
  let container: HTMLDivElement;
  let centerOnPosition: jest.SpyInstance;
  let ensureVisible: jest.SpyInstance;

  beforeEach(() => {
    container = document.createElement('div');

    const options: DesignerOptions = {
      zoom: 1.0,
      mode: 'edition-owner',
      divContainer: container,
      locale: 'en',
      widgetManager: {} as unknown as WidgetBuilder,
    };

    designer = new Designer(options);

    const canvas = designer.getWorkSpace();
    centerOnPosition = jest.spyOn(canvas, 'centerOnPosition').mockReturnValue(true);
    ensureVisible = jest.spyOn(canvas, 'ensureVisible').mockReturnValue(true);

    jest.spyOn(designer, 'onObjectFocusEvent').mockImplementation();
    jest.spyOn(designer, 'deselectAll').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('goToNode', () => {
    it('pans by the minimum needed by default (no center argument)', () => {
      const topic = buildTopic({ x: 250, y: 125 });

      designer.goToNode(topic);

      expect(ensureVisible).toHaveBeenCalledWith({
        left: 200,
        right: 300,
        top: 105,
        bottom: 145,
      });
      expect(centerOnPosition).not.toHaveBeenCalled();
      expect(topic.setOnFocus).toHaveBeenCalledWith(true);
    });

    it('centres the node on the viewport when asked to', () => {
      const topic = buildTopic({ x: 250, y: 125 });

      designer.goToNode(topic, true);

      expect(centerOnPosition).toHaveBeenCalledWith({ x: 250, y: 125 });
      expect(ensureVisible).not.toHaveBeenCalled();
      expect(topic.setOnFocus).toHaveBeenCalledWith(true);
    });
  });

  describe('revealNode', () => {
    it('keeps the existing minimal-pan behaviour for the keyboard call sites', () => {
      const topic = buildTopic({ x: 40, y: 60 });

      designer.revealNode(topic);

      expect(designer.deselectAll).toHaveBeenCalled();
      expect(ensureVisible).toHaveBeenCalled();
      expect(centerOnPosition).not.toHaveBeenCalled();
    });

    it('forwards the center flag through to the canvas', () => {
      const topic = buildTopic({ x: 40, y: 60 });

      designer.revealNode(topic, true);

      expect(designer.deselectAll).toHaveBeenCalled();
      expect(centerOnPosition).toHaveBeenCalledWith({ x: 40, y: 60 });
      expect(ensureVisible).not.toHaveBeenCalled();
    });
  });

  describe('centerNode', () => {
    it('pans without touching focus', () => {
      const topic = buildTopic({ x: 11, y: 22 });

      designer.centerNode(topic);

      expect(centerOnPosition).toHaveBeenCalledWith({ x: 11, y: 22 });
      expect(topic.setOnFocus).not.toHaveBeenCalled();
      expect(designer.onObjectFocusEvent).not.toHaveBeenCalled();
    });
  });
});
