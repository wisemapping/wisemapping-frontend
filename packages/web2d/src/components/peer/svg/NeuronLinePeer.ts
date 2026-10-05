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
import PositionType from '../../PositionType';
import ElementPeer, { StrokeStyle } from './ElementPeer';

/**
 * NeuronLinePeer renders an irregular spline that mimics the branching impulse
 * of neurons. Each connection gets a deterministic but organic-looking path.
 */
class NeuronLinePeer extends ElementPeer {
  private _strokeWidth: number;

  private _strokeOpacity: number;

  private _strokeColor: string;

  private _strokeStyle: string | null;

  private _dashPattern: string | null;

  private _x1: number;

  private _y1: number;

  private _x2: number;

  private _y2: number;

  // Whether setFrom and setTo have been called: the seed is fixed on the first draw with both.
  private _hasFrom: boolean;

  private _hasTo: boolean;

  private _seed: number | null;

  constructor() {
    const svgElement = window.document.createElementNS(
      NeuronLinePeer.svgNamespace,
      'path',
    ) as SVGPathElement;
    super(svgElement);

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
    this._seed = null;

    this._applyStroke();
  }

  override setStroke(
    width: number | null,
    style?: string | null,
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

    if ($defined(opacity)) {
      this._strokeOpacity = opacity as number;
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

    const dashArray =
      this._strokeStyle && this._strokeStyle !== 'solid'
        ? ElementPeer.DASH_ARRAYS[this._strokeStyle as StrokeStyle]
        : undefined;

    if (dashArray && dashArray.length > 0) {
      this.attr('stroke-dasharray', dashArray.join(' '));
    } else if (this._dashPattern) {
      this.attr('stroke-dasharray', this._dashPattern);
    } else {
      this.removeAttr('stroke-dasharray');
    }
  }

  private _updatePath(): void {
    if (
      !$defined(this._x1) ||
      !$defined(this._y1) ||
      !$defined(this._x2) ||
      !$defined(this._y2) ||
      (this._x1 === this._x2 && this._y1 === this._y2)
    ) {
      // Nothing to draw: clear the previous path rather than leave it on screen (W-STALEPATH).
      this.removeAttr('d');
      return;
    }

    const dx = this._x2 - this._x1;
    const dy = this._y2 - this._y1;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    const unitX = dx / distance;
    const unitY = dy / distance;
    const perpX = -unitY;
    const perpY = unitX;

    const steps = Math.min(18, Math.max(6, Math.round(distance / 35)));
    const amplitude = Math.min(60, distance * 0.35);
    const jitterSeed = this._seedFor();
    const pathSegments: string[] = [];
    pathSegments.push(`M${NeuronLinePeer._pointToStr(this._x1, this._y1)}`);

    let prevPoint = { x: this._x1, y: this._y1 };

    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      const baseX = this._x1 + dx * t;
      const baseY = this._y1 + dy * t;

      const lateral =
        Math.sin(t * Math.PI * (1.5 + jitterSeed * 0.5) + jitterSeed * 6) *
        amplitude *
        (0.2 + this._rand(jitterSeed, i, 0.6) * 0.6);
      const forward =
        (Math.cos(t * Math.PI * 2 + this._rand(jitterSeed, i, 1) * 2) - 0.5) * amplitude * 0.08;

      const spikePhase = (Math.sin(t * Math.PI * 4 + jitterSeed * 10) + 1) / 2;
      const spike = spikePhase > 0.8 ? (spikePhase - 0.8) * 5 : 0;

      // The last segment ends exactly at the target (W-NEURONEND).
      const last = i === steps;
      const targetX = last ? this._x2 : baseX + perpX * lateral + unitX * forward;
      const targetY = last ? this._y2 : baseY + perpY * lateral + unitY * forward;

      const ctrlOffset = distance / steps / 3;
      const ctrl1 = {
        x:
          prevPoint.x +
          unitX * ctrlOffset +
          perpX * this._rand(jitterSeed, i * 2, 0.4) * ctrlOffset,
        y:
          prevPoint.y +
          unitY * ctrlOffset +
          perpY * this._rand(jitterSeed, i * 2 + 1, 0.4) * ctrlOffset,
      };
      const ctrl2 = {
        x: targetX - unitX * ctrlOffset + perpX * this._rand(jitterSeed, i * 3, 0.4) * ctrlOffset,
        y:
          targetY -
          unitY * ctrlOffset +
          perpY * this._rand(jitterSeed, i * 3 + 1, 0.4) * ctrlOffset,
      };

      const adjustedTargetX = last ? targetX : targetX + perpX * spike;
      const adjustedTargetY = last ? targetY : targetY + perpY * spike;

      pathSegments.push(
        `C${NeuronLinePeer._pointToStr(ctrl1.x, ctrl1.y)} ${NeuronLinePeer._pointToStr(ctrl2.x, ctrl2.y)} ${NeuronLinePeer._pointToStr(adjustedTargetX, adjustedTargetY)}`,
      );
      prevPoint = { x: adjustedTargetX, y: adjustedTargetY };
    }

    this.attr('d', pathSegments.join(' '));
  }

  /**
   * The seed belongs to the line: it comes from the length of its first draw with both ends set,
   * and is then kept. So moving the whole line, or dragging one end, stretches the same shape
   * instead of reshuffling it (W-STALEPATH, BL5-74), and a static render stays deterministic.
   */
  private _seedFor(): number {
    if (this._seed !== null) {
      return this._seed;
    }
    const length = Math.hypot(this._x2 - this._x1, this._y2 - this._y1);
    const seed = (Math.sin(length * 0.37) + 1) / 2;
    if (this._hasFrom && this._hasTo) {
      this._seed = seed;
    }
    return seed;
  }

  private _rand(seed: number, iteration: number, amplitude: number): number {
    const value = Math.sin(seed * 100 + iteration * 7.13) * 43758.5453;
    return (value - Math.floor(value)) * 2 * amplitude - amplitude;
  }

  private static _pointToStr(x: number, y: number): string {
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }
}

export default NeuronLinePeer;
