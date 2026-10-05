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
import ElementPeer, { formatLength } from './ElementPeer';
import SizeType from '../../SizeType';
import PositionType from '../../PositionType';

class WorkspacePeer extends ElementPeer {
  constructor() {
    const svgElement: SVGElement = window.document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    super(svgElement);
    // The viewBox (the coordinate size and origin) stretches to the SVG size on both axes.
    this.attr('preserveAspectRatio', 'none');
  }

  /** The root <svg> is sized with its width and height attributes. */
  protected override hasSizeAttributes(): boolean {
    return true;
  }

  /**
   * The <svg> width and height attributes are the source of truth: a consumer may resize the SVG
   * around the peer (W-HTMLFONT, BL5-64). While an attribute still matches the kept size, the kept
   * value is returned, so its precision is not lost to the attribute format.
   */
  override getSize(): SizeType {
    const { width, height } = super.getSize();
    return {
      width: this.sizeAttribute('width', width),
      height: this.sizeAttribute('height', height),
    };
  }

  private sizeAttribute(name: 'width' | 'height', kept: number): number {
    const value = this._native.getAttribute(name);
    if (value === null || value === formatLength(kept)) {
      return kept;
    }
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? kept : parsed;
  }

  // The viewBox as numbers, and the attribute value they were parsed from or written as. A pan
  // reads and writes the origin, so it should not parse the string each time.
  private _viewBoxSource: string | null = null;

  private _viewBoxCoords: number[] | null = null;

  /**
   * The coordinate size and origin are the SVG viewBox: <min-x> <min-y> <width> <height> in user
   * units, mapped onto the whole <svg> (preserveAspectRatio="none").
   *
   * Values are kept at full precision: mindplot maps the mouse with the exact origin and
   * scale, so rounding them here makes slow pans stall and the mouse mapping drift.
   */
  setCoordSize(width: number, height: number) {
    const coords = this.viewBoxCoords() ?? [0, 0, 0, 0];
    coords[2] = width;
    coords[3] = height;
    this.writeViewBox(coords);
  }

  getCoordSize(): SizeType {
    const coords = this.viewBoxCoords() ?? [1, 1, 1, 1];
    return { width: coords[2]!, height: coords[3]! };
  }

  setCoordOrigin(x: number, y: number): void {
    // ViewBox min-x ,min-y by default initializated with 0 and 0.
    const coords = this.viewBoxCoords() ?? [0, 0, 0, 0];

    if ($defined(x)) {
      coords[0] = x;
    }

    if ($defined(y)) {
      coords[1] = y;
    }

    this.writeViewBox(coords);
  }

  getCoordOrigin(): PositionType {
    const coords = this.viewBoxCoords() ?? [0, 0, 0, 0];
    return { x: coords[0]!, y: coords[1]! };
  }

  /**
   * A copy of the viewBox numbers, or null without a viewBox. The string is parsed only when it
   * is not the one last seen, for example after a write around the peer.
   */
  private viewBoxCoords(): number[] | null {
    const viewBox = this._native.getAttribute('viewBox');
    if (viewBox === null) {
      return null;
    }
    if (viewBox !== this._viewBoxSource || !this._viewBoxCoords) {
      this._viewBoxSource = viewBox;
      this._viewBoxCoords = viewBox.split(/ /).map((e: string) => Number.parseFloat(e));
    }
    return [...this._viewBoxCoords];
  }

  private writeViewBox(coords: number[]): void {
    const viewBox = coords.join(' ');
    this.attr('viewBox', viewBox);
    this._viewBoxSource = viewBox;
    this._viewBoxCoords = [...coords];
  }

  getPosition() {
    return { x: 0, y: 0 };
  }
}

export default WorkspacePeer;
