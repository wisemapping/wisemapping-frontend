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
import SizeType from '../../SizeType';

export type FontStyle = {
  fontFamily?: string;
  style?: string;
  weight?: string;
  size?: string;
  color?: string | null;
};

class FontPeer {
  private _size: number;

  private _style: string;

  private _weight: string;

  private _fontName: string;

  constructor(fontName: string) {
    this._size = 10;
    this._style = 'normal';
    this._weight = 'normal';
    this._fontName = fontName;
  }

  init(args: { size?: number; style?: string; weight?: string }) {
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

  getHtmlSize(scale: SizeType): string {
    const result = (this._size * scale.height * 42) / 32;
    return result.toFixed();
  }

  getGraphSize(): string {
    return ((this._size * 43) / 32).toFixed(1);
  }

  getSize(): number {
    return this._size;
  }

  getStyle(): string {
    return this._style;
  }

  getWeight(): string {
    // Increase font weight by 50% for visualization only
    // Normal: 400 -> 600 (400 * 1.5)
    // Bold: 700 -> 1050 (700 * 1.5)
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

  setStyle(style: string) {
    this._style = style;
  }

  setWeight(weight: string) {
    // Use semantic weights; map to browser-supported numeric if needed at render time
    if (weight === 'normal' || weight === 'bold') {
      this._weight = weight;
    } else {
      this._weight = weight;
    }
  }

  getFontName(): string {
    return this._fontName;
  }
}

export default FontPeer;
