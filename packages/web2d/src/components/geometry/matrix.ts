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
import type { Vec } from './path';
import { EPSILON } from './vector';

/**
 * A 2D affine matrix, as SVG and DOMMatrix write it:
 *
 *     | a c e |
 *     | b d f |
 *     | 0 0 1 |
 *
 * so that a point (x, y) maps to (a·x + c·y + e, b·x + d·y + f). An SVGMatrix or a DOMMatrix
 * (getScreenCTM()) is one.
 */
export type Matrix = {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly e: number;
  readonly f: number;
};

/** A rectangle: its top-left corner and its size. */
export type Box = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export const IDENTITY: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

/** The point `p` maps to through `m`. */
export const applyMatrix = (m: Matrix, p: Vec): Vec => ({
  x: m.a * p.x + m.c * p.y + m.e,
  y: m.b * p.x + m.d * p.y + m.f,
});

/** The inverse of `m`, or null when it has none (it squashes the plane onto a line or a point). */
export const invertMatrix = (m: Matrix): Matrix | null => {
  const det = m.a * m.d - m.b * m.c;
  if (Math.abs(det) < EPSILON) {
    return null;
  }
  return {
    a: m.d / det,
    b: -m.b / det,
    c: -m.c / det,
    d: m.a / det,
    e: (m.c * m.f - m.d * m.e) / det,
    f: (m.b * m.e - m.a * m.f) / det,
  };
};

/**
 * The matrix from the user units of a viewBox to the pixels of the viewport it is drawn in, for
 * preserveAspectRatio="none" (each axis is stretched on its own): the viewBox corner lands on the
 * viewport corner and the viewBox size fills the viewport size. An empty viewBox axis is not
 * scaled.
 */
export const viewBoxMatrix = (viewBox: Box, viewport: Box): Matrix => {
  const a = viewBox.width > 0 ? viewport.width / viewBox.width : 1;
  const d = viewBox.height > 0 ? viewport.height / viewBox.height : 1;
  return { a, b: 0, c: 0, d, e: viewport.x - viewBox.x * a, f: viewport.y - viewBox.y * d };
};
