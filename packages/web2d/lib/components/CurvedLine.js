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
const Toolkit = require('./Toolkit').default;

const CurvedLine = new Class({
  Extends: Element,
  initialize(attributes) {
    const peer = Toolkit.createCurvedLine();
    const defaultAttributes = {
      strokeColor: 'blue', strokeWidth: 1, strokeStyle: 'solid', strokeOpacity: 1,
    };
    for (const key in attributes) {
      defaultAttributes[key] = attributes[key];
    }
    this.parent(peer, defaultAttributes);
  },

  getType() {
    return 'CurvedLine';
  },

  setFrom(x, y) {
    $assert(!isNaN(x), 'x must be defined');
    $assert(!isNaN(y), 'y must be defined');

    this._peer.setFrom(x, y);
  },

  setTo(x, y) {
    $assert(!isNaN(x), 'x must be defined');
    $assert(!isNaN(y), 'y must be defined');

    this._peer.setTo(x, y);
  },

  getFrom() {
    return this._peer.getFrom();
  },

  getTo() {
    return this._peer.getTo();
  },

  setShowEndArrow(visible) {
    this._peer.setShowEndArrow(visible);
  },

  isShowEndArrow() {
    return this._peer.isShowEndArrow();
  },

  setShowStartArrow(visible) {
    this._peer.setShowStartArrow(visible);
  },

  isShowStartArrow() {
    return this._peer.isShowStartArrow();
  },

  setSrcControlPoint(control) {
    this._peer.setSrcControlPoint(control);
  },

  setDestControlPoint(control) {
    this._peer.setDestControlPoint(control);
  },

  getControlPoints() {
    return this._peer.getControlPoints();
  },

  isSrcControlPointCustom() {
    return this._peer.isSrcControlPointCustom();
  },

  isDestControlPointCustom() {
    return this._peer.isDestControlPointCustom();
  },

  setIsSrcControlPointCustom(isCustom) {
    this._peer.setIsSrcControlPointCustom(isCustom);
  },

  setIsDestControlPointCustom(isCustom) {
    this._peer.setIsDestControlPointCustom(isCustom);
  },

  updateLine(avoidControlPointFix) {
    return this._peer.updateLine(avoidControlPointFix);
  },

  setStyle(style) {
    this._peer.setLineStyle(style);
  },

  getStyle() {
    return this._peer.getLineStyle();
  },

  setDashed(length, spacing) {
    this._peer.setDashed(length, spacing);
  },
});

CurvedLine.SIMPLE_LINE = false;
CurvedLine.NICE_LINE = true;

export default CurvedLine;
