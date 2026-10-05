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

import { $defined } from '../utils/assert';
import type PositionType from '../../PositionType';
import { neuronPathData, neuronSeed, neuronSteps } from '../../geometry/neuron';
import ElementPeer from './ElementPeer';
import type { StrokeStyle } from '../../types';

/**
 * NeuronLinePeer renders an irregular spline that mimics the branching impulse
 * of neurons. Each connection gets a deterministic but organic-looking path.
 */
class NeuronLinePeer extends ElementPeer<SVGPathElement> {
  private _strokeWidth: number;

  private _strokeOpacity: number;

  private _strokeColor: string;

  private _strokeStyle: StrokeStyle | null;

  private _dashPattern: string | null;

  private _x1: number;

  private _y1: number;

  private _x2: number;

  private _y2: number;

  // Whether setFrom and setTo have been called: the shape is fixed on the first draw with both.
  private _hasFrom: boolean;

  private _hasTo: boolean;

  // The seed and the segment count of the fixed shape, or null until it is fixed.
  private _shape: { readonly seed: number; readonly steps: number } | null;

  constructor() {
    super(ElementPeer.createNode('path'));

    this.attr('fill', 'none');
    this.attr('stroke-linecap', 'round');
    this.attr('stroke-linejoin', 'round');

    this._strokeWidth = 3;
    this._strokeOpacity = 1;
    this._strokeColor = '#9cf7ff';
    this._strokeStyle = 'solid';
    this._dashPattern = null;

    this._x1 = 0;
    this._y1 = 0;
    this._x2 = 0;
    this._y2 = 0;
    this._hasFrom = false;
    this._hasTo = false;
    this._shape = null;

    this._applyStroke();
  }

  override setStroke(
    width: number | null,
    style?: StrokeStyle | null,
    color?: string | null,
    opacity?: number,
  ) {
    if ($defined(width) && width !== null) {
      this._strokeWidth = width;
    }

    if (style) {
      this._strokeStyle = style;
      if (style === 'solid') {
        this._dashPattern = null;
      }
    }

    if (color) {
      this._strokeColor = color;
    }

    if (opacity != null) {
      this._strokeOpacity = opacity;
    }

    this._applyStroke();
  }

  setDashPattern(length: number, spacing: number): void {
    if ($defined(length) && $defined(spacing)) {
      this._dashPattern = `${length},${spacing}`;
    } else {
      this._dashPattern = null;
    }
    this._applyStroke();
  }

  setFrom(x: number, y: number): void {
    const changed = this._x1 !== x || this._y1 !== y;
    this._x1 = x;
    this._y1 = y;
    this._hasFrom = true;
    if (changed) {
      this._updatePath();
    }
  }

  setTo(x: number, y: number): void {
    const changed = this._x2 !== x || this._y2 !== y;
    this._x2 = x;
    this._y2 = y;
    this._hasTo = true;
    if (changed) {
      this._updatePath();
    }
  }

  getFrom(): PositionType {
    return { x: this._x1, y: this._y1 };
  }

  getTo(): PositionType {
    return { x: this._x2, y: this._y2 };
  }

  private _applyStroke(): void {
    this.attr('stroke-width', Math.max(1, this._strokeWidth).toFixed(1));
    this.attr('stroke-opacity', this._strokeOpacity.toString());
    this.attr('stroke', this._strokeColor);

    // The table dash scales with the drawn width (BL5-77).
    const dashArray =
      this._strokeStyle && this._strokeStyle !== 'solid'
        ? ElementPeer.dashArray(this._strokeStyle, Math.max(1, this._strokeWidth))
        : undefined;

    if (dashArray) {
      this.attr('stroke-dasharray', dashArray);
    } else if (this._dashPattern) {
      this.attr('stroke-dasharray', this._dashPattern);
    } else {
      this.removeAttr('stroke-dasharray');
    }
  }

  private _updatePath(): void {
    const from = { x: this._x1, y: this._y1 };
    const to = { x: this._x2, y: this._y2 };
    // The ends are checked before the seed is taken: a draw with coinciding ends must not fix it.
    const drawable =
      $defined(from.x) &&
      $defined(from.y) &&
      $defined(to.x) &&
      $defined(to.y) &&
      (from.x !== to.x || from.y !== to.y);
    const shape = drawable ? this._shapeFor() : null;
    const d = shape ? neuronPathData(from, to, shape.seed, shape.steps) : null;
    if (d === null) {
      // Nothing to draw: clear the previous path rather than leave it on screen (W-STALEPATH).
      this.removeAttr('d');
      return;
    }
    this.attr('d', d);
  }

  /**
   * The shape belongs to the line: its seed and its segment count come from the length of its
   * first draw with both ends set, and are then kept. So moving the whole line, or dragging one
   * end, stretches the same shape instead of reshuffling it (W-STALEPATH, BL5-74) or adding and
   * dropping segments in jumps (BL5-119), and a static render stays deterministic.
   */
  private _shapeFor(): { readonly seed: number; readonly steps: number } {
    if (this._shape !== null) {
      return this._shape;
    }
    const length = Math.hypot(this._x2 - this._x1, this._y2 - this._y1);
    const shape = { seed: neuronSeed(length), steps: neuronSteps(length) };
    if (this._hasFrom && this._hasTo) {
      this._shape = shape;
    }
    return shape;
  }
}

export default NeuronLinePeer;
