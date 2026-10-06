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
import { getPosition } from '../utils/DomUtils';
import { type FontStyle } from './FontPeer';
import type FontPeer from './FontPeer';
import ElementPeer from './ElementPeer';
import type SizeType from '../../SizeType';
import type PositionType from '../../PositionType';
import type { FontStyleType, FontWeightType } from '../../types';

// A no-break space: unlike a plain space it is never collapsed, so an empty line keeps its height.
const EMPTY_LINE = '\u00A0';

// Bumped whenever cached text measurements may be wrong: a web font that finishes loading changes
// the metrics of every text drawn with it.
let measurementGeneration = 0;
let watchingFonts = false;

const currentMeasurementGeneration = (): number => {
  if (!watchingFonts) {
    watchingFonts = true;
    const { fonts } = window.document as { fonts?: Pick<FontFaceSet, 'addEventListener'> };
    fonts?.addEventListener('loadingdone', () => {
      measurementGeneration += 1;
    });
  }
  return measurementGeneration;
};

/** Drops every cached text measurement (they are re-measured on the next read). */
export const invalidateTextMeasurements = (): void => {
  measurementGeneration += 1;
};

class TextPeer extends ElementPeer<SVGTextElement> {
  private _position: PositionType;

  private _font: FontPeer;

  private _text: string;

  // One tspan per line, in order. They are reused across setText calls.
  private _tspans: SVGTSpanElement[];

  // Whether the font attributes are written on the node. Until then it inherits them, so a cached
  // measurement could not tell when they change.
  private _fontApplied: boolean;

  private _measureKey: string | null;

  private _measured: SizeType;

  constructor(fontPeer: FontPeer) {
    super(ElementPeer.createNode('text'));
    this._position = { x: 0, y: 0 };
    this._font = fontPeer;
    this._text = '';
    this._tspans = [];
    this._fontApplied = false;
    this._measureKey = null;
    this._measured = { width: 0, height: 0 };
  }

  /**
   * Writes one tspan per line. The tspans are reused: a line that did not change costs no DOM
   * write, and only added or removed lines create or remove nodes.
   */
  setText(text: string): void {
    this._text = text;
    if (!this.ownsAllChildren()) {
      // Something else was added to the node: setText owns its content, so start again.
      while (this._native.firstChild) {
        this._native.removeChild(this._native.firstChild);
      }
      this._tspans = [];
    }

    const x = TextPeer.formatCoordinate(this._position.x);
    this.getTextLines().forEach((line, i) => {
      let tspan = this._tspans[i];
      if (!tspan) {
        tspan = ElementPeer.createNode('tspan');
        tspan.setAttribute('dy', '1em');
        this._native.appendChild(tspan);
        this._tspans.push(tspan);
      }
      ElementPeer.writeAttribute(tspan, 'x', x);

      // An empty line still needs a glyph to take its height: a plain space is collapsed when it
      // is leading or trailing (default xml:space), which dropped a trailing empty line.
      const content = line || EMPTY_LINE;
      if (tspan.textContent !== content) {
        tspan.textContent = content;
      }
    });

    const lineCount = this.getTextLines().length;
    this._tspans.splice(lineCount).forEach((tspan) => this._native.removeChild(tspan));
  }

  /** Whether the node holds exactly the line tspans, in order. */
  private ownsAllChildren(): boolean {
    const nodes = this._native.childNodes;
    if (nodes.length !== this._tspans.length) {
      return false;
    }
    return this._tspans.every((tspan, i) => nodes[i] === tspan);
  }

  /** The x and y attribute format, shared by the text and its tspans. */
  private static formatCoordinate(value: number): string {
    return value.toFixed(2);
  }

  /** The text split on LF, CRLF or CR. A trailing line break adds an empty last line. */
  getTextLines(): string[] {
    return this._text ? this._text.split(/\r\n|\r|\n/) : [];
  }

  getText(): string {
    return this._text;
  }

  setPosition(x: number, y: number): void {
    this._position = { x, y };
    const formattedX = TextPeer.formatCoordinate(x);
    this.attr('y', TextPeer.formatCoordinate(y));
    this.attr('x', formattedX);

    // tspan must be positioned manually.
    this._tspans.forEach((tspan) => ElementPeer.writeAttribute(tspan, 'x', formattedX));
  }

  getPosition(): PositionType {
    return { x: this._position.x, y: this._position.y };
  }

  /**
   * The text position in pixels, relative to `container` when given (the offset parent of an
   * absolutely positioned element placed over the text), else in document coordinates.
   */
  getNativePosition(container?: Element | null): { left: number; top: number } {
    return getPosition(this._native, container);
  }

  setFont(
    fontName: string,
    size?: number | null,
    style?: FontStyleType | null,
    weight?: FontWeightType | null,
  ): void {
    // Empty arguments keep the current value.
    if (fontName) {
      this.useFontName(fontName);
    }

    if (style) {
      this._font.setStyle(style);
    }
    if (weight) {
      this._font.setWeight(weight);
    }
    if (size != null) {
      this._font.setSize(size);
    }
    this.updateFontStyle();
  }

  /** Switches the font family. The font is kept when the family does not change. */
  private useFontName(fontName: string): void {
    if (fontName !== this._font.getFontName()) {
      this._font = this._font.withFontName(fontName);
    }
  }

  private updateFontStyle() {
    this._fontApplied = true;
    this.attr('font-family', this._font.getFontName());
    this.attr('font-size', this._font.getGraphSize());
    this.attr('font-style', this._font.getStyle());
    this.attr('font-weight', this._font.getWeight());
  }

  setColor(color: string): void {
    this.attr('fill', color);
  }

  getColor(): string | null {
    return this._native.getAttribute('fill');
  }

  setStyle(style: FontStyleType): void {
    this._font.setStyle(style);
    this.updateFontStyle();
  }

  setWeight(weight: FontWeightType): void {
    this._font.setWeight(weight);
    this.updateFontStyle();
  }

  setFontName(fontName: string): void {
    this.useFontName(fontName);
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
   * The text bounding box size. Measuring forces a synchronous layout, so the result is cached
   * for as long as the text and the font stay the same (and no web font finishes loading).
   *
   * Measuring a detached or undisplayed node throws in some browsers (older Firefox) and gives
   * zeros in others, so a failure counts as an empty box, and neither is cached.
   */
  measure(): SizeType {
    const key = [
      currentMeasurementGeneration(),
      this._font.getFontName(),
      this._font.getGraphSize(),
      this._font.getStyle(),
      this._font.getWeight(),
      this._text,
    ].join('\u0000');
    if (key === this._measureKey) {
      return { ...this._measured };
    }

    let box: SizeType;
    try {
      const { width, height } = this._native.getBBox();
      box = { width, height };
    } catch {
      return { width: 0, height: 0 };
    }

    const measured = box.width > 0 || box.height > 0 || this._text === '';
    if (this._fontApplied && this._native.isConnected && measured) {
      this._measureKey = key;
      this._measured = box;
    } else {
      this._measureKey = null;
    }
    return { ...box };
  }

  getHtmlFontSize(scale: SizeType): string {
    return this._font.getHtmlSize(scale);
  }
}

export default TextPeer;
