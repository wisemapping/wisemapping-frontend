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
import type SizeType from '../../SizeType';
import type { FontStyleType, FontWeightType } from '../../types';

export type FontStyle = {
  fontFamily?: string;
  style?: string;
  weight?: string;
  size?: string;
  color?: string | null;
};

/**
 * Pixels per font point, shared by the SVG text and the HTML inline editor so both render the
 * same size. It is 43/32 (about 1.344), not the CSS 4/3: every stored map is laid out with it, so
 * changing it would resize every topic.
 */
export const FONT_PT_TO_PX = 43 / 32;

class FontPeer {
  private _size: number;

  private _style: FontStyleType;

  private _weight: FontWeightType;

  private _fontName: string;

  constructor(fontName: string) {
    this._size = 10;
    this._style = 'normal';
    this._weight = 'normal';
    this._fontName = fontName;
  }

  init(args: { size?: number; style?: FontStyleType; weight?: FontWeightType }): void {
    if (args.size !== undefined) {
      this._size = args.size;
    }
    if (args.style) {
      this._style = args.style;
    }
    if (args.weight) {
      this._weight = args.weight;
    }
  }

  /** A copy of this font with another family; size, style and (semantic) weight are kept. */
  withFontName(fontName: string): FontPeer {
    const result = new FontPeer(fontName);
    result._size = this._size;
    result._style = this._style;
    result._weight = this._weight;
    return result;
  }

  /** The CSS pixel size of the HTML inline editor: the rendered SVG size times the screen scale. */
  getHtmlSize(scale: SizeType): string {
    return (Number(this.getGraphSize()) * scale.height).toFixed(1);
  }

  getGraphSize(): string {
    return (this._size * FONT_PT_TO_PX).toFixed(1);
  }

  getSize(): number {
    return this._size;
  }

  getStyle(): FontStyleType {
    return this._style;
  }

  /**
   * The rendered weight. Text is drawn heavier on purpose (e4e0602b): normal renders as 600 and
   * bold as 900, about 1.5 times the CSS 400/700. The semantic value is kept internally.
   */
  getWeight(): string {
    if (this._weight === 'normal') {
      return '600';
    }
    if (this._weight === 'bold') {
      return '900';
    }
    return this._weight;
  }

  setSize(value: number) {
    this._size = value;
  }

  setStyle(style: FontStyleType): void {
    this._style = style;
  }

  setWeight(weight: FontWeightType): void {
    this._weight = weight;
  }

  getFontName(): string {
    return this._fontName;
  }
}

export default FontPeer;
