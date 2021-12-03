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
import Element from './Element';
import Toolkit from './Toolkit';

const CurvedLine = new Class({
  Extends: Element,
  initialize(attributes) {
    const peer = Toolkit.createCurvedLine();
    const defaultAttributes = {
      strokeColor: 'blue',
      strokeWidth: 1,
      strokeStyle: 'solid',
      strokeOpacity: 1,
    };

    for (const key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        defaultAttributes[key] = attributes[key];
      }
    }
    this.parent(peer, defaultAttributes);
  },

  getType() {
    return 'CurvedLine';
  },

  setFrom(x, y) {
    $assert(!Number.isNaN(x), 'x must be defined');
    $assert(!Number.isNaN(y), 'y must be defined');

    this.peer.setFrom(x, y);
  },

  setTo(x, y) {
    $assert(!Number.isNaN(x), 'x must be defined');
    $assert(!Number.isNaN(y), 'y must be defined');

    this.peer.setTo(x, y);
  },

  getFrom() {
    return this.peer.getFrom();
  },

  getTo() {
    return this.peer.getTo();
  },

  setShowEndArrow(visible) {
    this.peer.setShowEndArrow(visible);
  },

  isShowEndArrow() {
    return this.peer.isShowEndArrow();
  },

  setShowStartArrow(visible) {
    this.peer.setShowStartArrow(visible);
  },

  isShowStartArrow() {
    return this.peer.isShowStartArrow();
  },

  setSrcControlPoint(control) {
    this.peer.setSrcControlPoint(control);
  },

  setDestControlPoint(control) {
    this.peer.setDestControlPoint(control);
  },

  getControlPoints() {
    return this.peer.getControlPoints();
  },

  isSrcControlPointCustom() {
    return this.peer.isSrcControlPointCustom();
  },

  isDestControlPointCustom() {
    return this.peer.isDestControlPointCustom();
  },

  setIsSrcControlPointCustom(isCustom) {
    this.peer.setIsSrcControlPointCustom(isCustom);
  },

  setIsDestControlPointCustom(isCustom) {
    this.peer.setIsDestControlPointCustom(isCustom);
  },

  updateLine(avoidControlPointFix) {
    return this.peer.updateLine(avoidControlPointFix);
  },

  setStyle(style) {
    this.peer.setLineStyle(style);
  },

  getStyle() {
    return this.peer.getLineStyle();
  },

  setDashed(length, spacing) {
    this.peer.setDashed(length, spacing);
  },
});

CurvedLine.SIMPLE_LINE = false;
CurvedLine.NICE_LINE = true;

export default CurvedLine;
