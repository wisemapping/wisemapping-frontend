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

import type PositionType from '../../PositionType';
import { heartbeatPathData } from '../../geometry/heartbeat';
import ElementPeer from './ElementPeer';
import type { StrokeStyle } from '../../types';

/**
 * HeartbeatLinePeer renders an ECG-inspired waveform with a signature spike that
 * runs between the source and destination points. It gives a rhythmic, animated feel
 * that differs from the bezier-based connectors.
 */
class HeartbeatLinePeer extends ElementPeer<SVGPathElement> {
  private _strokeWidth: number;

  private _strokeOpacity: number;

  private _strokeColor: string;

  private _strokeStyle: StrokeStyle | null;

  private _dashPattern: string | null;

  private _x1: number;

  private _y1: number;

  private _x2: number;

  private _y2: number;

  constructor() {
    super(ElementPeer.createNode('path'));

    this.attr('fill', 'none');
    this.attr('stroke-linejoin', 'round');
    this.attr('stroke-linecap', 'round');

    this._strokeWidth = 3;
    this._strokeOpacity = 1;
    this._strokeColor = '#ff3366';
    this._strokeStyle = 'solid';
    this._dashPattern = null;

    this._x1 = 0;
    this._y1 = 0;
    this._x2 = 0;
    this._y2 = 0;

    this._applyStroke();
  }

  override setStroke(
    width: number | null,
    style?: StrokeStyle | null,
    color?: string | null,
    opacity?: number,
  ): void {
    // The spike amplitude depends on the width, so a new width re-paths (W-STALEPATH).
    const repath = width != null && width !== this._strokeWidth;
    if (width != null) {
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
    if (repath) {
      this._updatePath();
    }
  }

  setDashPattern(length: number, spacing: number): void {
    if (length != null && spacing != null) {
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
    if (changed) {
      this._updatePath();
    }
  }

  setTo(x: number, y: number): void {
    const changed = this._x2 !== x || this._y2 !== y;
    this._x2 = x;
    this._y2 = y;
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
    const d =
      this._x1 != null && this._y1 != null && this._x2 != null && this._y2 != null
        ? heartbeatPathData(
            { x: this._x1, y: this._y1 },
            { x: this._x2, y: this._y2 },
            this._strokeWidth,
          )
        : null;
    if (d === null) {
      // Nothing to draw: clear the previous path rather than leave it on screen (W-STALEPATH).
      this.removeAttr('d');
      return;
    }
    this.attr('d', d);
  }
}

export default HeartbeatLinePeer;
