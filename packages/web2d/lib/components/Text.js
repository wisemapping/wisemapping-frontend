/*
 *    Copyright [2015] [wisemapping]
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
const Element = require('./Element').default;
const Toolkit = require('./Toolkit');

const Text = new Class({
  Extends: Element,
  initialize(attributes) {
    const peer = Toolkit.default.createText();
    this.parent(peer, attributes);
  },

  getType() {
    return 'Text';
  },

  setText(text) {
    this._peer.setText(text);
  },

  setTextAlignment(align) {
    $assert(align, 'align can not be null');
    this._peer.setTextAlignment(align);
  },

  setTextSize(width, height) {
    this._peer.setContentSize(width, height);
  },

  getText() {
    return this._peer.getText();
  },

  setFont(font, size, style, weight) {
    this._peer.setFont(font, size, style, weight);
  },

  setColor(color) {
    this._peer.setColor(color);
  },

  getColor() {
    return this._peer.getColor();
  },

  setStyle(style) {
    this._peer.setStyle(style);
  },

  setWeight(weight) {
    this._peer.setWeight(weight);
  },

  setFontFamily(family) {
    this._peer.setFontFamily(family);
  },

  getFont() {
    return this._peer.getFont();
  },

  setSize(size) {
    this._peer.setSize(size);
  },

  getHtmlFontSize() {
    return this._peer.getHtmlFontSize();
  },

  getWidth() {
    return this._peer.getWidth();
  },

  getHeight() {
    return parseInt(this._peer.getHeight());
  },

  getFontHeight() {
    const lines = this._peer.getText().split('\n').length;
    return Math.round(this.getHeight() / lines);
  },
});

export default Text;
