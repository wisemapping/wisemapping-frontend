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
import { getPosition } from '../utils/DomUtils';
import FontPeer, { FontStyle } from './FontPeer';
import ElementPeer from './ElementPeer';
import SizeType from '../../SizeType';
import PositionType from '../../PositionType';

// A no-break space: unlike a plain space it is never collapsed, so an empty line keeps its height.
const EMPTY_LINE = '\u00A0';

class TextPeer extends ElementPeer {
  private _position: { x: number; y: number };

  private _font: FontPeer;

  private _text: string;

  constructor(fontPeer: FontPeer) {
    const svgElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'text');
    super(svgElement);
    this._position = { x: 0, y: 0 };
    this._font = fontPeer;
    this._text = '';
  }

  append(element: ElementPeer): void {
    this._native.appendChild(element._native);
  }

  setText(text: string) {
    this._text = text;

    // Remove all previous nodes ...
    while (this._native.firstChild) {
      this._native.removeChild(this._native.firstChild);
    }

    // Add nodes ...
    this.getTextLines().forEach((l) => {
      // Append a new line ...
      const tspan = window.document.createElementNS(ElementPeer.svgNamespace, 'tspan');
      tspan.setAttribute('dy', '1em');
      tspan.setAttribute('x', this.getPosition().x.toFixed(1));

      // An empty line still needs a glyph to take its height: a plain space is collapsed when it
      // is leading or trailing (default xml:space), which dropped a trailing empty line.
      tspan.textContent = l || EMPTY_LINE;
      this._native.appendChild(tspan);
    });
  }

  /** The text split on LF, CRLF or CR. A trailing line break adds an empty last line. */
  getTextLines(): string[] {
    return this._text ? this._text.split(/\r\n|\r|\n/) : [];
  }

  getText(): string {
    return this._text;
  }

  setPosition(x: number, y: number) {
    this._position = { x, y };
    this._native.setAttribute('y', y.toFixed(2));
    this._native.setAttribute('x', x.toFixed(2));

    // tspan must be positioned manually.
    Array.from(this._native.querySelectorAll('tspan')).forEach((element) => {
      (element as Element).setAttribute('x', x.toFixed(2));
    });
  }

  getPosition(): PositionType {
    return this._position;
  }

  getNativePosition(): { left: number; top: number } {
    return getPosition(this._native);
  }

  setFont(fontName: string, size: number, style: string, weight: string): void {
    // Empty arguments keep the current value.
    if (fontName) {
      this._font = this._font.withFontName(fontName);
    }

    if (style) {
      this._font.setStyle(style);
    }
    if (weight) {
      this._font.setWeight(weight);
    }
    if ($defined(size)) {
      this._font.setSize(size);
    }
    this.updateFontStyle();
  }

  private updateFontStyle() {
    this._native.setAttribute('font-family', this._font.getFontName());
    this._native.setAttribute('font-size', this._font.getGraphSize());
    this._native.setAttribute('font-style', this._font.getStyle());
    this._native.setAttribute('font-weight', this._font.getWeight());
  }

  setColor(color: string) {
    this._native.setAttribute('fill', color);
  }

  getColor(): string | null {
    return this._native.getAttribute('fill');
  }

  setTextSize(size: number) {
    this._font.setSize(size);
    this.updateFontStyle();
  }

  setStyle(style: string) {
    this._font.setStyle(style);
    this.updateFontStyle();
  }

  setWeight(weight: string) {
    this._font.setWeight(weight);
    this.updateFontStyle();
  }

  setFontName(fontName: string): void {
    this._font = this._font.withFontName(fontName);
    this.updateFontStyle();
  }

  getFontStyle(): FontStyle {
    const color = this.getColor();
    const style: FontStyle = {
      fontFamily: this._font.getFontName(),
      size: String(this._font.getSize()),
      style: this._font.getStyle(),
      weight: this._font.getWeight(),
      color,
    };
    return style;
  }

  setFontSize(size: number): void {
    this._font.setSize(size);
    this.updateFontStyle();
  }

  getShapeWidth(): number {
    return this.measure().width;
  }

  getShapeHeight(): number {
    return this.measure().height;
  }

  /**
   * The text bounding box. Measuring a detached or undisplayed node throws in some browsers (older
   * Firefox) and gives zeros in others, so a failure counts as an empty box.
   */
  private measure(): { width: number; height: number } {
    try {
      return (this._native as SVGGraphicsElement).getBBox();
    } catch {
      return { width: 0, height: 0 };
    }
  }

  getHtmlFontSize(scale: SizeType): string {
    return this._font.getHtmlSize(scale);
  }
}

export default TextPeer;
