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

/*
 * jsdom has no layout engine, so the SVG measurement APIs web2d relies on are missing. These fakes
 * are deterministic, so a test can compute the expected value by hand:
 *
 * - getBBox on <text>: width = longest line × fontSize × 0.6, height = lines × fontSize × 1.2,
 *   where a line is a <tspan> (or the text content when there are none) and fontSize is the
 *   nearest `font-size` attribute (16 by default).
 * - getBBox on other elements: x/y/width/height read from their attributes (0 when unset).
 * - getComputedTextLength: characters × fontSize × 0.6.
 * - getScreenCTM: an identity matrix scaled by the owner <svg>'s size / viewBox ratio and
 *   translated by its viewBox origin. Group transforms are ignored.
 * - ResizeObserver: records observed elements; tests call `FakeResizeObserver.trigger(el, w, h)`.
 */

const DEFAULT_FONT_SIZE = 16;
export const CHAR_WIDTH_RATIO = 0.6;
export const LINE_HEIGHT_RATIO = 1.2;

const numAttr = (el: Element, name: string, fallback = 0): number => {
  const value = Number.parseFloat(el.getAttribute(name) ?? '');
  return Number.isNaN(value) ? fallback : value;
};

const fontSizeOf = (el: Element): number => {
  let current: Element | null = el;
  while (current) {
    const size = Number.parseFloat(current.getAttribute('font-size') ?? '');
    if (!Number.isNaN(size)) {
      return size;
    }
    current = current.parentElement;
  }
  return DEFAULT_FONT_SIZE;
};

const textLines = (el: Element): string[] => {
  const tspans = Array.from(el.querySelectorAll('tspan'));
  if (tspans.length > 0) {
    return tspans.map((t) => t.textContent ?? '');
  }
  const content = el.textContent ?? '';
  return content.length > 0 ? [content] : [];
};

type FakeRect = { x: number; y: number; width: number; height: number };

function fakeGetBBox(this: SVGElement): FakeRect {
  if (this.tagName === 'text' || this.tagName === 'tspan') {
    const fontSize = fontSizeOf(this);
    const lines = textLines(this);
    const longest = lines.reduce((max, l) => Math.max(max, l.length), 0);
    return {
      x: numAttr(this, 'x'),
      y: numAttr(this, 'y'),
      width: longest * fontSize * CHAR_WIDTH_RATIO,
      height: lines.length * fontSize * LINE_HEIGHT_RATIO,
    };
  }
  return {
    x: numAttr(this, 'x'),
    y: numAttr(this, 'y'),
    width: numAttr(this, 'width'),
    height: numAttr(this, 'height'),
  };
}

function fakeGetComputedTextLength(this: SVGElement): number {
  return (this.textContent ?? '').length * fontSizeOf(this) * CHAR_WIDTH_RATIO;
}

export type FakeMatrix = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  inverse(): FakeMatrix;
};

const matrix = (a: number, d: number, e: number, f: number): FakeMatrix => ({
  a,
  b: 0,
  c: 0,
  d,
  e,
  f,
  inverse: () => matrix(1 / a, 1 / d, -e / a, -f / d),
});

function fakeGetScreenCTM(this: SVGElement): FakeMatrix {
  const svg = this.tagName === 'svg' ? this : this.closest('svg');
  if (!svg) {
    return matrix(1, 1, 0, 0);
  }
  const viewBox = (svg.getAttribute('viewBox') ?? '')
    .split(/[\s,]+/)
    .map((v) => Number.parseFloat(v));
  const width = numAttr(svg, 'width', Number.NaN);
  const height = numAttr(svg, 'height', Number.NaN);
  if (viewBox.length !== 4 || viewBox.some(Number.isNaN) || Number.isNaN(width + height)) {
    return matrix(1, 1, 0, 0);
  }
  const [vx, vy, vw, vh] = viewBox as [number, number, number, number];
  const sx = width / vw;
  const sy = height / vh;
  return matrix(sx, sy, -vx * sx, -vy * sy);
}

type ResizeCallback = (entries: { target: Element; contentRect: FakeRect }[]) => void;

export class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];

  readonly callback: ResizeCallback;

  readonly targets = new Set<Element>();

  constructor(callback: ResizeCallback) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.targets.add(target);
  }

  unobserve(target: Element): void {
    this.targets.delete(target);
  }

  disconnect(): void {
    this.targets.clear();
  }

  /** Notifies every observer watching `target` of a new content size. */
  static trigger(target: Element, width: number, height: number): void {
    FakeResizeObserver.instances
      .filter((o) => o.targets.has(target))
      .forEach((o) => o.callback([{ target, contentRect: { x: 0, y: 0, width, height } }]));
  }
}

const proto = window.SVGElement.prototype as unknown as Record<string, unknown>;
proto.getBBox = fakeGetBBox;
proto.getComputedTextLength = fakeGetComputedTextLength;
proto.getScreenCTM = fakeGetScreenCTM;
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = FakeResizeObserver;
