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

import { $assert } from './peer/utils/assert';
import WorkspaceElement from './WorkspaceElement';
import Line from './Line';
import StyleAttributes from './StyleAttributes';
import Toolkit from './Toolkit';
import HeartbeatLinePeer from './peer/svg/HeartbeatLinePeer';
import PositionType from './PositionType';

class HeartbeatLine extends WorkspaceElement<HeartbeatLinePeer> implements Line {
  constructor(attributes?: StyleAttributes) {
    const peer = Toolkit.createHeartbeatLine();
    const defaultAttributes = {
      strokeColor: '#ff3366',
      strokeWidth: 3,
      strokeStyle: 'solid',
      strokeOpacity: 1,
      fill: 'none 0',
    };

    const mergedAttr = { ...defaultAttributes, ...attributes };
    super(peer, mergedAttr);
  }

  getType(): string {
    return 'HeartbeatLine';
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

  getFrom(): PositionType {
    return this.peer.getFrom();
  }

  getTo(): PositionType {
    return this.peer.getTo();
  }

  getElementClass(): HeartbeatLine {
    return this;
  }

  setIsSrcControlPointCustom(value: boolean): void {
    throw new Error(`Method not implemented. Received value: ${value}`);
  }

  setIsDestControlPointCustom(value: boolean): void {
    throw new Error(`Method not implemented. Received value: ${value}`);
  }

  setDashed(length: number, spacing: number): void {
    this.peer.setDashPattern(length, spacing);
  }

  setSrcControlPoint(value: PositionType): void {
    throw new Error(`Method not implemented. Received value: ${JSON.stringify(value)}`);
  }

  setDestControlPoint(value: PositionType): void {
    throw new Error(`Method not implemented. Received value: ${JSON.stringify(value)}`);
  }

  isDestControlPointCustom(): boolean {
    return false;
  }

  isSrcControlPointCustom(): boolean {
    return false;
  }

  getControlPoints(): [PositionType, PositionType] {
    throw new Error('Method not implemented.');
  }
}

export default HeartbeatLine;
