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

import { Text } from '@wisemapping/web2d';
import Canvas from '../../src/components/Canvas';
import ScreenManager from '../../src/components/ScreenManager';

// W-HTMLFONT: Canvas.setZoom wrote the SVG width/height directly, so the web2d workspace kept the
// size it was built with. The inline editor's font size is scaled by it, so after the container
// shrank from 800 to 400 px the editor font doubled (13 -> 26 px).
describe('Canvas keeps the workspace size in sync (W-HTMLFONT)', () => {
  let container: HTMLDivElement;
  let canvas: Canvas;
  let text: Text;

  const resize = (width: number, height: number): void => {
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
  };

  beforeEach(() => {
    container = document.createElement('div');
    resize(800, 800);
    document.body.appendChild(container);
    canvas = new Canvas(new ScreenManager(container), 1, false, false);
    text = new Text();
    canvas.append(text);
    text.setFontSize(10);
  });

  afterEach(() => {
    canvas.dispose();
    container.remove();
  });

  it('the HTML font size matches the canvas text at zoom 1', () => {
    expect(text.getHtmlFontSize()).toBe('13.4');
  });

  it('the HTML font size is unchanged after the container shrinks', () => {
    resize(400, 400);
    canvas.setZoom(1, false); // What the window resize listener does.

    const svg = canvas.getSVGElement();
    expect(svg.getAttribute('width')).toBe('400');
    expect(svg.getAttribute('height')).toBe('400');
    expect((svg.parentElement as HTMLElement).style.width).toBe('400px');
    expect(text.getHtmlFontSize()).toBe('13.4');
  });

  it('the HTML font size follows the zoom after a resize', () => {
    resize(400, 300);
    canvas.setZoom(2, false);
    expect(text.getHtmlFontSize()).toBe('6.7');
  });
});
