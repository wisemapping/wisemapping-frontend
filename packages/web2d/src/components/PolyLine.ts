/* eslint-disable class-methods-use-this */
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
import Toolkit from './Toolkit';
import * as PolyLineUtils from './peer/utils/PolyLineUtils';
import Line from './Line';
import PositionType from './PositionType';
import StyleAttributes from './StyleAttributes';
import PolyLinePeer from './peer/svg/PolyLinePeer';

class PolyLine extends WorkspaceElement<PolyLinePeer> implements Line {
  constructor(attributes?: StyleAttributes) {
    const peer = Toolkit.createPolyLine();
    const defaultAttributes = {
      strokeColor: 'blue',
      strokeWidth: 1,
      strokeStyle: 'solid',
      strokeOpacity: 1,
    };

    const mergedAttr = { ...defaultAttributes, ...attributes };
    super(peer, mergedAttr);
  }

  getElementClass(): PolyLine {
    return this;
  }

  updateLine() {
    throw new Error('Method not implemented.');
  }
  getTo(): PositionType {
    throw new Error('Method not implemented.');
  }
  getFrom(): PositionType {
    throw new Error('Method not implemented.');
  }

  setIsSrcControlPointCustom(value: boolean): void {
    throw new Error('Method not implemented.');
  }
  setIsDestControlPointCustom(value: boolean): void {
    throw new Error('Method not implemented.');
  }
  setDashed(v: number, v2: number): void {
    throw new Error('Method not implemented.');
  }
  setSrcControlPoint(value: PositionType): void {
    throw new Error('Method not implemented.');
  }
  setDestControlPoint(value: PositionType): void {
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

  getType(): string {
    return 'PolyLine';
  }

  setFrom(x: number, y: number): void {
    this.peer.setFrom(x, y);
  }

  setTo(x: number, y: number): void {
    this.peer.setTo(x, y);
  }

  setStyle(style: string): void {
    this.peer.setStyle(style);
  }

  getStyle(): string {
    return this.peer.getStyle();
  }

  buildCurvedPath(dist: number, x1: number, y1: number, x2: number, y2: number) {
    return PolyLineUtils.buildCurvedPath(dist, x1, y1, x2, y2);
  }

  buildStraightPath(dist: number, x1: number, y1: number, x2: number, y2: number) {
    return PolyLineUtils.buildStraightPath(dist, x1, y1, x2, y2);
  }
}

export default PolyLine;
