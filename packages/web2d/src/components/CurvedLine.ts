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
import WorkspaceElement from './WorkspaceElement';
import Line from './Line';
import CurvedLinePeer from './peer/svg/CurvedLinePeer';
import PositionType from './PositionType';
import StyleAttributes from './StyleAttributes';
import Toolkit from './Toolkit';

class CurvedLine extends WorkspaceElement<CurvedLinePeer> implements Line {
  constructor(attributes?: StyleAttributes) {
    const peer = Toolkit.createCurvedLine();
    const defaultAttributes = {
      strokeColor: 'blue',
      strokeWidth: 1,
      strokeStyle: 'solid',
      strokeOpacity: 1,
    };

    const mergedAttr = { ...defaultAttributes, ...attributes };
    super(peer, mergedAttr);
  }

  // eslint-disable-next-line class-methods-use-this
  getType() {
    return 'CurvedLine';
  }

  setFrom(x: number, y: number): void {
    $assert(!Number.isNaN(x), 'x must be defined');
    $assert(!Number.isNaN(y), 'y must be defined');

    this.peer.setFrom(x, y);
  }

  setTo(x: number, y: number): void {
    $assert(!Number.isNaN(x), 'x must be defined');
    $assert(!Number.isNaN(y), 'y must be defined');

    this.peer.setTo(x, y);
  }

  getFrom() {
    return this.peer.getFrom();
  }

  getTo() {
    return this.peer.getTo();
  }

  setShowEndArrow(visible) {
    this.peer.setShowEndArrow(visible);
  }

  getElementClass(): CurvedLine {
    return this;
  }

  isShowEndArrow() {
    return this.peer.isShowEndArrow();
  }

  setShowStartArrow(visible) {
    this.peer.setShowStartArrow(visible);
  }

  isShowStartArrow() {
    return this.peer.isShowStartArrow();
  }

  setSrcControlPoint(control: PositionType) {
    this.peer.setSrcControlPoint(control);
  }

  setDestControlPoint(control: PositionType) {
    this.peer.setDestControlPoint(control);
  }

  getControlPoints(): [PositionType, PositionType] {
    // @ts-ignore
    return this.peer.getControlPoints();
  }

  isSrcControlPointCustom() {
    return this.peer.isSrcControlPointCustom();
  }

  isDestControlPointCustom(): boolean {
    return this.peer.isDestControlPointCustom();
  }

  setIsSrcControlPointCustom(isCustom: boolean) {
    this.peer.setIsSrcControlPointCustom(isCustom);
  }

  setIsDestControlPointCustom(isCustom: boolean) {
    this.peer.setIsDestControlPointCustom(isCustom);
  }

  updateLine(avoidControlPointFix?: boolean) {
    return this.peer.updateLine(Boolean(avoidControlPointFix));
  }

  setDashed(length: number, spacing: number) {
    this.peer.setDashed(length, spacing);
  }

  getWidth(): number {
    return this.peer.getWidth();
  }

  setWidth(value: number): void {
    this.peer.setWidth(value);
  }
}

export default CurvedLine;
