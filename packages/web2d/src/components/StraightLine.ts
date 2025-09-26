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

import WorkspaceElement from './WorkspaceElement';
import Line from './Line';
import StraightLinePeer from './peer/svg/StraightPeer';
import PositionType from './PositionType';
import StyleAttributes from './StyleAttributes';
import Toolkit from './Toolkit';

class StraightLine extends WorkspaceElement<StraightLinePeer> implements Line {
  constructor(attributes?: StyleAttributes) {
    const peer = Toolkit.createStraightLine();
    const defaultAttributes = { strokeColor: '#495879', strokeWidth: 1, strokeOpacity: 1 };

    const mergedAttr = { ...defaultAttributes, ...attributes };
    super(peer, mergedAttr);
  }

  getElementClass(): StraightLine {
    return this;
  }

  setIsSrcControlPointCustom(): void {
    throw new Error('Method not implemented.');
  }

  setIsDestControlPointCustom(): void {
    throw new Error('Method not implemented.');
  }

  setDashed(): void {
    throw new Error('Method not implemented.');
  }

  setSrcControlPoint(): void {
    throw new Error('Method not implemented.');
  }

  setDestControlPoint(): void {
    throw new Error('Method not implemented.');
  }

  isDestControlPointCustom(): boolean {
    throw new Error('Method not implemented.');
  }

  isSrcControlPointCustom(): boolean {
    throw new Error('Method not implemented.');
  }

  getControlPoints(): [PositionType, PositionType] {
    throw new Error('Method not implemented.');
  }

  getType() {
    return 'Line';
  }

  setFrom(x: number, y: number) {
    this.peer.setFrom(x, y);
  }

  setTo(x: number, y: number) {
    this.peer.setTo(x, y);
  }

  getFrom(): PositionType {
    return this.peer.getFrom();
  }

  getTo(): PositionType {
    return this.peer.getTo();
  }

  static setPosition() {
    throw new Error('Unsupported operation');
  }

  static setSize() {
    throw new Error('Unsupported operation');
  }

  static setFill() {
    throw new Error('Unsupported operation');
  }
}

export default StraightLine;
