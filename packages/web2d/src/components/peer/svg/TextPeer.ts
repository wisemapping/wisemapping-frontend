/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { $defined } from '@wisemapping/core-js';
import FontPeer, { FontStyle } from './FontPeer';
import ElementPeer from './ElementPeer';
import { getPosition } from '../utils/DomUtils';
import SizeType from '../../SizeType';

class TextPeer extends ElementPeer {
  private _position: { x: number; y: number };
  private _font: FontPeer;
  private _textAlign: any;
  private _text: string | undefined;

  constructor(fontPeer: FontPeer) {
    const svgElement = window.document.createElementNS('http://www.w3.org/2000/svg', 'text');
    super(svgElement);
    this._position = { x: 0, y: 0 };
    this._font = fontPeer;
  }

  append(element: ElementPeer) {
    this._native.appendChild(element._native);
  }

  setTextAlignment(align: string) {
    this._textAlign = align;
  }

  getTextAlignment() {
    return $defined(this._textAlign) ? this._textAlign : 'left';
  }

  setText(text: string) {
    // Remove all previous nodes ...
    while (this._native.firstChild) {
      this._native.removeChild(this._native.firstChild);
    }

    this._text = text;
    if (text) {
      const lines = text.split('\n');
      lines.forEach((line) => {
        const tspan = window.document.createElementNS(ElementPeer.svgNamespace, 'tspan');
        tspan.setAttribute('dy', '1em');
        tspan.setAttribute('x', String(this.getPosition().x));

        tspan.textContent = line.length === 0 ? ' ' : line;
        this._native.appendChild(tspan);
      });
    }
  }

  getText(): any {
    return this._text;
  }

  setPosition(x: number, y: number) {
    this._position = { x, y };
    this._native.setAttribute('y', String(y));
    this._native.setAttribute('x', String(x));

    // tspan must be positioned manually.
    Array.from(this._native.querySelectorAll('tspan')).forEach((element) => {
      (element as Element).setAttribute('x', String(x));
    });
  }

  getPosition() {
    return this._position;
  }

  getNativePosition() {
    return getPosition(this._native);
  }

  setFont(fontName: string, size: number, style: string, weight: string): void {
    if ($defined(fontName)) {
      this._font = new FontPeer(fontName);
    }

    if ($defined(style)) {
      this._font.setStyle(style);
    }
    if ($defined(weight)) {
      this._font.setWeight(weight);
    }
    if ($defined(size)) {
      this._font.setSize(size);
    }
    this._updateFontStyle();
  }

  _updateFontStyle() {
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
    this._updateFontStyle();
  }

  setStyle(style: string) {
    this._font.setStyle(style);
    this._updateFontStyle();
  }

  setWeight(weight: string) {
    this._font.setWeight(weight);
    this._updateFontStyle();
  }

  setFontName(fontName: string): void {
    const oldFont = this._font;
    this._font = new FontPeer(fontName);
    this._font.setSize(oldFont.getSize());
    this._font.setStyle(oldFont.getStyle());
    this._font.setWeight(oldFont.getWeight());
    this._updateFontStyle();
  }

  getFontStyle(): FontStyle {
    const color = this.getColor();
    const style = {
      fontFamily: this._font.getFontName(),
      size: String(this._font.getSize()),
      style: this._font.getStyle(),
      weight: this._font.getWeight(),
      color: color ? color : undefined,
    };
    return style;
  }

  setFontSize(size: number): void {
    this._font.setSize(size);
    this._updateFontStyle();
  }

  getShapeWidth(): number {
    let result = (this._native as SVGGraphicsElement).getBBox().width;
    return result;
  }

  getShapeHeight(): number {
    return (this._native as SVGGraphicsElement).getBBox().height;
  }

  getHtmlFontSize(scale: SizeType): string {
    return this._font.getHtmlSize(scale);
  }
}

export default TextPeer;
