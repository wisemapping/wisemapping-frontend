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
import Canvas from '../../src/components/Canvas';
import ScreenManager from '../../src/components/ScreenManager';

// The web2d viewBox must keep fractional values, as mindplot's ScreenManager does. Otherwise
// slow pans are lost, drag-pan moves in whole-unit steps and the mouse maps to the wrong point.
describe('Workspace viewBox precision', () => {
  const viewBoxOf = (svg: Element): number[] =>
    (svg.getAttribute('viewBox') ?? '').split(' ').map((v) => Number.parseFloat(v));

  it('round-trips a fractional coordinate origin and size', () => {
    const workspace = new Workspace();
    workspace.setCoordOrigin(-150.25, -120.75);
    workspace.setCoordSize(1234.5, 987.6);

    expect(workspace.getCoordOrigin()).toEqual({ x: -150.25, y: -120.75 });
    expect(workspace.getCoordSize()).toEqual({ width: 1234.5, height: 987.6 });
    expect(viewBoxOf(workspace.getSVGElement())).toEqual([-150.25, -120.75, 1234.5, 987.6]);
  });

  describe('with a Canvas zoomed to a fractional level', () => {
    let container: HTMLDivElement;
    let screenManager: ScreenManager;
    let canvas: Canvas;

    beforeEach(() => {
      container = document.createElement('div');
      container.style.width = '1000px';
      container.style.height = '800px';
      document.body.appendChild(container);
      screenManager = new ScreenManager(container);
      canvas = new Canvas(screenManager, 0.3, false, false);
    });

    afterEach(() => {
      canvas.dispose();
      container.remove();
    });

    const svg = (): Element => container.querySelector('svg') as Element;

    it('accumulates slow pans instead of losing them to rounding', () => {
      for (let i = 0; i < 10; i++) {
        canvas.panBy(1, 0);
      }
      // Origin starts at -1000/2*0.3 = -150; ten 0.3-unit steps move it to -147.
      expect(viewBoxOf(svg())[0]).toBeCloseTo(-147, 6);
    });

    it('keeps a fractional coordinate size', () => {
      canvas.setZoom(1.2345, true);
      const [, , width, height] = viewBoxOf(svg());
      expect(width).toBeCloseTo(1234.5, 6);
      expect(height).toBeCloseTo(987.6, 6);
    });

    it('maps the mouse to the same point the viewBox renders there', () => {
      canvas.setZoom(0.7, true);
      canvas.panBy(1.3, -2.1);

      const [minX, minY, width, height] = viewBoxOf(svg());
      // jsdom's bounding rect is at (0,0): a click on (500,400) is the container centre.
      const event = new MouseEvent('mousemove', { clientX: 500, clientY: 400 });
      const mouse = screenManager.getWorkspaceMousePosition(event);

      // The SVG (preserveAspectRatio none) renders the point minX + 500 * width / 1000 there.
      expect(mouse.x).toBeCloseTo(minX + (500 * width) / 1000, 6);
      expect(mouse.y).toBeCloseTo(minY + (400 * height) / 800, 6);
    });
  });
});
