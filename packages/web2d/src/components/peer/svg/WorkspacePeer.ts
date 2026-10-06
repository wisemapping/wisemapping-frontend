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
import ElementPeer, { formatLength } from './ElementPeer';
import type SizeType from '../../SizeType';
import type PositionType from '../../PositionType';
import { viewBoxMatrix, type Matrix } from '../../geometry/matrix';

/** The viewBox numbers: <min-x> <min-y> <width> <height>. */
type ViewBox = readonly [x: number, y: number, width: number, height: number];

class WorkspacePeer extends ElementPeer<SVGSVGElement> {
  constructor() {
    super(ElementPeer.createNode('svg'));
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

  private _viewBox: ViewBox | null = null;

  /**
   * The coordinate size and origin are the SVG viewBox: <min-x> <min-y> <width> <height> in user
   * units, mapped onto the whole <svg> (preserveAspectRatio="none").
   *
   * Values are kept at full precision: mindplot maps the mouse with the exact origin and
   * scale, so rounding them here makes slow pans stall and the mouse mapping drift.
   */
  setCoordSize(width: number, height: number): void {
    const [x, y] = this.viewBox() ?? [0, 0, 0, 0];
    this.writeViewBox([x, y, width, height]);
  }

  getCoordSize(): SizeType {
    const [, , width, height] = this.viewBox() ?? [1, 1, 1, 1];
    return { width, height };
  }

  setCoordOrigin(x: number, y: number): void {
    // ViewBox min-x ,min-y by default initializated with 0 and 0.
    const [currentX, currentY, width, height] = this.viewBox() ?? [0, 0, 0, 0];
    this.writeViewBox([x ?? currentX, y ?? currentY, width, height]);
  }

  getCoordOrigin(): PositionType {
    const [x, y] = this.viewBox() ?? [0, 0, 0, 0];
    return { x, y };
  }

  /**
   * The viewBox numbers, or null without a viewBox. The string is parsed only when it is not the
   * one last seen, for example after a write around the peer. A missing number is NaN.
   */
  private viewBox(): ViewBox | null {
    const viewBox = this._native.getAttribute('viewBox');
    if (viewBox === null) {
      return null;
    }
    if (viewBox !== this._viewBoxSource || !this._viewBox) {
      const [x = NaN, y = NaN, width = NaN, height = NaN] = viewBox
        .split(/ /)
        .map((e: string) => Number.parseFloat(e));
      this._viewBoxSource = viewBox;
      this._viewBox = [x, y, width, height];
    }
    return this._viewBox;
  }

  private writeViewBox(viewBox: ViewBox): void {
    const value = viewBox.join(' ');
    this.attr('viewBox', value);
    this._viewBoxSource = value;
    this._viewBox = viewBox;
  }

  getPosition(): PositionType {
    return { x: 0, y: 0 };
  }

  /**
   * The matrix from workspace coordinates (user units) to client (viewport) pixels: the browser's
   * getScreenCTM(), which accounts for the zoom (viewBox size), the pan (viewBox origin) and the
   * position of the <svg> on the page. Where it is missing or null (an <svg> that is not
   * rendered, an environment without layout), it is computed from the viewBox and the <svg>
   * bounding box, or its size when the box is empty.
   */
  getScreenMatrix(): Matrix {
    const ctm =
      typeof this._native.getScreenCTM === 'function' ? this._native.getScreenCTM() : null;
    if (ctm) {
      return ctm;
    }
    const rect = this._native.getBoundingClientRect();
    const { width, height } = rect.width > 0 && rect.height > 0 ? rect : this.getSize();
    const [x, y, viewBoxWidth, viewBoxHeight] = this.viewBox() ?? [0, 0, width, height];
    return viewBoxMatrix(
      { x, y, width: viewBoxWidth, height: viewBoxHeight },
      { x: rect.left, y: rect.top, width, height },
    );
  }
}

export default WorkspacePeer;
