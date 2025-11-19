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
import ElementPeer from './ElementPeer';

/**
 * HeartbeatLinePeer renders an ECG-inspired waveform with a signature spike that
 * runs between the source and destination points. It gives a rhythmic, animated feel
 * that differs from the bezier-based connectors.
 */
class HeartbeatLinePeer extends ElementPeer {
  private _path: SVGPathElement;

  private _strokeWidth: number;

  private _strokeOpacity: number;

  private _strokeColor: string;

  private _strokeStyle: string | null;

  private _dashPattern: string | null;

  private _x1: number;

  private _y1: number;

  private _x2: number;

  private _y2: number;

  constructor() {
    const svgElement = window.document.createElementNS(
      HeartbeatLinePeer.svgNamespace,
      'path',
    ) as SVGPathElement;
    super(svgElement);

    this._path = svgElement;
    this._path.setAttribute('fill', 'none');
    this._path.setAttribute('stroke-linejoin', 'round');
    this._path.setAttribute('stroke-linecap', 'round');

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
    this._path.setAttribute('stroke-width', Math.max(1, this._strokeWidth).toFixed(1));
    this._path.setAttribute('stroke-opacity', this._strokeOpacity.toString());
    this._path.setAttribute('stroke', this._strokeColor);

    const dashStyles = ElementPeer.stokeStyleToStrokDasharray();
    const dashArray =
      this._strokeStyle && this._strokeStyle !== 'solid'
        ? dashStyles[this._strokeStyle as keyof typeof dashStyles]
        : undefined;

    if (dashArray && dashArray.length > 0) {
      this._path.setAttribute('stroke-dasharray', dashArray.join(' '));
    } else if (this._dashPattern) {
      this._path.setAttribute('stroke-dasharray', this._dashPattern);
    } else {
      this._path.removeAttribute('stroke-dasharray');
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
      return;
    }

    const dx = this._x2 - this._x1;
    const dy = this._y2 - this._y1;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    const unitX = dx / distance;
    const unitY = dy / distance;
    const perpX = -unitY;
    const perpY = unitX;

    const amplitudeBase = Math.min(distance * 0.35, 60);
    const amplitude = Math.max(10, amplitudeBase * (0.4 + this._strokeWidth * 0.04));

    const wobbleSeed = Math.sin((this._x1 + this._y1 + this._x2 + this._y2) * 0.05);
    const wobble = 1 + wobbleSeed * 0.15;

    const pattern = HeartbeatLinePeer._heartbeatPattern();
    const pathSegments: string[] = [];
    pathSegments.push(`M${HeartbeatLinePeer._pointToStr(this._x1, this._y1)}`);

    pattern.forEach((node) => {
      const baseX = this._x1 + dx * node.pos;
      const baseY = this._y1 + dy * node.pos;

      const offset = node.amp * amplitude * wobble;
      const x = baseX + perpX * offset;
      const y = baseY + perpY * offset;
      pathSegments.push(`L${HeartbeatLinePeer._pointToStr(x, y)}`);
    });

    pathSegments.push(`L${HeartbeatLinePeer._pointToStr(this._x2, this._y2)}`);
    this._path.setAttribute('d', pathSegments.join(' '));
  }

  private static _pointToStr(x: number, y: number): string {
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }

  private static _heartbeatPattern(): { pos: number; amp: number }[] {
    return [
      { pos: 0.1, amp: 0 },
      { pos: 0.18, amp: 0.15 },
      { pos: 0.24, amp: -0.25 },
      { pos: 0.3, amp: 0 },
      { pos: 0.36, amp: 0 },
      { pos: 0.44, amp: 1 },
      { pos: 0.48, amp: -0.6 },
      { pos: 0.52, amp: 0.2 },
      { pos: 0.56, amp: -0.1 },
      { pos: 0.6, amp: 0 },
      { pos: 0.66, amp: 0.12 },
      { pos: 0.72, amp: -0.18 },
      { pos: 0.78, amp: 0 },
      { pos: 0.84, amp: 0.08 },
      { pos: 0.9, amp: -0.08 },
      { pos: 0.96, amp: 0 },
    ];
  }
}

export default HeartbeatLinePeer;
