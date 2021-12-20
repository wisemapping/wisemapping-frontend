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
import ElementPeer from './ElementPeer';

class TextPeer extends ElementPeer {
  constructor(Font) {
    const svgElement = window.document.createElementNS(ElementPeer.svgNamespace, 'text');
    super(svgElement);
    this.Font = Font;
    this._position = { x: 0, y: 0 };
    this._font = new Font('Arial', this);
  }

  append(element) {
    this._native.appendChild(element._native);
  }

  setTextAlignment(align) {
    this._textAlign = align;
  }

  getTextAlignment() {
    return $defined(this._textAlign) ? this._textAlign : 'left';
  }

  setText(text) {
    // Remove all previous nodes ...
    while (this._native.firstChild) {
      this._native.removeChild(this._native.firstChild);
    }

    this._text = text;
    if (text) {
      const lines = text.split('\n');
      const me = this;
      lines.forEach((line) => {
        const tspan = window.document.createElementNS(ElementPeer.svgNamespace, 'tspan');
        tspan.setAttribute('dy', '1em');
        tspan.setAttribute('x', me.getPosition().x);

        tspan.textContent = line.length === 0 ? ' ' : line;
        me._native.appendChild(tspan);
      });
    }
  }

  getText() {
    return this._text;
  }

  setPosition(x, y) {
    this._position = { x, y };
    this._native.setAttribute('y', y);
    this._native.setAttribute('x', x);

    // tspan must be positioned manually.
    Array.from(this._native.querySelectorAll('tspan')).forEach((element) => {
      element.setAttribute('x', x);
    });
  }

  getPosition() {
    return this._position;
  }

  getNativePosition() {
    const computedStyles = window.getComputedStyle(this._native);
    const marginTop = computedStyles.getPropertyValue('margin-top') || 0;
    const marginLeft = computedStyles.getPropertyValue('margin-left') || 0;
    return {
      top: this._native.offsetTop - parseFloat(marginTop),
      left: this._native.offsetLeft - parseFloat(marginLeft),
    };
  }

  setFont(font, size, style, weight) {
    if ($defined(font)) {
      this._font = new this.Font(font, this);
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
    this._native.setAttribute('font-family', this._font.getFontFamily());
    this._native.setAttribute('font-size', this._font.getGraphSize());
    this._native.setAttribute('font-style', this._font.getStyle());
    this._native.setAttribute('font-weight', this._font.getWeight());
  }

  setColor(color) {
    this._native.setAttribute('fill', color);
  }

  getColor() {
    return this._native.getAttribute('fill');
  }

  setTextSize(size) {
    this._font.setSize(size);
    this._updateFontStyle();
  }

  setContentSize(width, height) {
    this._native.xTextSize = `${width.toFixed(1)},${height.toFixed(1)}`;
  }

  setStyle(style) {
    this._font.setStyle(style);
    this._updateFontStyle();
  }

  setWeight(weight) {
    this._font.setWeight(weight);
    this._updateFontStyle();
  }

  setFontFamily(family) {
    const oldFont = this._font;
    this._font = new this.Font(family, this);
    this._font.setSize(oldFont.getSize());
    this._font.setStyle(oldFont.getStyle());
    this._font.setWeight(oldFont.getWeight());
    this._updateFontStyle();
  }

  getFont() {
    return {
      font: this._font.getFont(),
      size: parseInt(this._font.getSize(), 10),
      style: this._font.getStyle(),
      weight: this._font.getWeight(),
    };
  }

  setSize(size) {
    this._font.setSize(size);
    this._updateFontStyle();
  }

  getWidth() {
    let computedWidth;
    // Firefox hack for this issue:http://stackoverflow.com/questions/6390065/doing-ajax-updates-in-svg-breaks-getbbox-is-there-a-workaround
    try {
      computedWidth = this._native.getBBox().width;
      // Chrome bug is producing this error, oly during page loading.
      // Remove the hack if it works. The issue seems to be
      // caused when the element is hidden. I don't know why, but it works ...
      if (computedWidth === 0) {
        const bbox = this._native.getBBox();
        computedWidth = bbox.width;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      computedWidth = 10;
    }

    let width = parseInt(computedWidth, 10);
    width += this._font.getWidthMargin();
    return width;
  }

  getHeight() {
    // Firefox hack for this
    // issue:http://stackoverflow.com/questions/6390065/doing-ajax-updates-in-svg-breaks-getbbox-is-there-a-workaround
    let computedHeight;
    try {
      computedHeight = this._native.getBBox().height;
    } catch (e) {
      computedHeight = 10;
    }
    return parseInt(computedHeight, 10);
  }

  getHtmlFontSize() {
    return this._font.getHtmlSize();
  }
}

export default TextPeer;
