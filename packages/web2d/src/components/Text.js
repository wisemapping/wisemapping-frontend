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

import { $assert } from '@wisemapping/core-js';
import Font from './Font';
import ElementClass from './ElementClass';
import Toolkit from './Toolkit';

class Text extends ElementClass {
  constructor(attributes) {
    const defaultFont = new Font('Arial');
    const peer = Toolkit.createText(defaultFont);
    super(peer, attributes);
  }

  // eslint-disable-next-line class-methods-use-this
  getType() {
    return 'Text';
  }

  setText(text) {
    this.peer.setText(text);
  }

  setTextAlignment(align) {
    $assert(align, 'align can not be null');
    this.peer.setTextAlignment(align);
  }

  setTextSize(width, height) {
    this.peer.setContentSize(width, height);
  }

  getText() {
    return this.peer.getText();
  }

  setFont(font, size, style, weight) {
    this.peer.setFont(font, size, style, weight);
  }

  setFontName(fontName) {
    this.peer.setFontName(fontName);
  }

  setColor(color) {
    this.peer.setColor(color);
  }

  getColor() {
    return this.peer.getColor();
  }

  setStyle(style) {
    this.peer.setStyle(style);
  }

  setWeight(weight) {
    this.peer.setWeight(weight);
  }

  getFont() {
    return this.peer.getFont();
  }

  setSize(size) {
    this.peer.setSize(size);
  }

  getHtmlFontSize(scale) {
    return this.peer.getHtmlFontSize(scale);
  }

  getWidth() {
    return this.peer.getWidth();
  }

  getHeight() {
    return Number.parseInt(this.peer.getHeight(), 10);
  }

  getFontHeight() {
    const lines = this.peer.getText().split('\n').length;
    return Math.round(this.getHeight() / lines);
  }
}

export default Text;
