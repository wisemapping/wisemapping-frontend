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

  /**
   * The coordinate size and origin are the SVG viewBox: <min-x> <min-y> <width> <height> in user
   * units, mapped onto the whole <svg> (preserveAspectRatio="none").
   *
   * Values are kept at full precision: mindplot maps the mouse with the exact origin and
   * scale, so rounding them here makes slow pans stall and the mouse mapping drift.
   */
  setCoordSize(width: number, height: number) {
    const viewBox = this._native.getAttribute('viewBox');
    let coords = [0, 0, 0, 0];
    if (viewBox != null) {
      coords = viewBox.split(/ /).map((e: string) => Number.parseFloat(e));
    }
    coords[2] = width;
    coords[3] = height;
    this.attr('viewBox', coords.join(' '));
  }

  getCoordSize(): SizeType {
    const viewBox = this._native.getAttribute('viewBox');
    let coords = [1, 1, 1, 1];
    if (viewBox != null) {
      coords = viewBox.split(/ /).map((e) => Number.parseFloat(e));
    }
    return { width: coords[2]!, height: coords[3]! };
  }

  setCoordOrigin(x: number, y: number): void {
    const viewBox = this._native.getAttribute('viewBox');

    // ViewBox min-x ,min-y by default initializated with 0 and 0.
    let coords = [0, 0, 0, 0];
    if (viewBox != null) {
      coords = viewBox.split(/ /).map((e: string) => Number.parseFloat(e));
    }

    if ($defined(x)) {
      coords[0] = x;
    }

    if ($defined(y)) {
      coords[1] = y;
    }

    this.attr('viewBox', coords.join(' '));
  }

  getCoordOrigin(): PositionType {
    const viewBox = this._native.getAttribute('viewBox');
    let coords = [0, 0, 0, 0];
    if (viewBox != null) {
      coords = viewBox.split(/ /).map((e) => Number.parseFloat(e));
    }
    return { x: coords[0]!, y: coords[1]! };
  }

  getPosition() {
    return { x: 0, y: 0 };
  }
}

export default WorkspacePeer;
