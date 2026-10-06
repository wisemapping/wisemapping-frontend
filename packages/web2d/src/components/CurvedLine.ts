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
import type { ControlPointLine } from './Line';
import CurvedLinePeer from './peer/svg/CurvedLinePeer';
import type PositionType from './PositionType';
import type { ElementAttributes } from './StyleAttributes';
import type { ElementType } from './types';

class CurvedLine extends WorkspaceElement<CurvedLinePeer> implements ControlPointLine {
  constructor(attributes?: ElementAttributes) {
    const peer = new CurvedLinePeer();
    const defaultAttributes: ElementAttributes = {
      strokeColor: 'blue',
      strokeWidth: 1,
      strokeStyle: 'solid',
      strokeOpacity: 1,
    };

    const mergedAttr = { ...defaultAttributes, ...attributes };
    super(peer, mergedAttr);
  }

  getType(): ElementType {
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

  getFrom(): PositionType {
    return this.peer.getFrom();
  }

  getTo(): PositionType {
    return this.peer.getTo();
  }

  getElementClass(): CurvedLine {
    return this;
  }

  /**
   * Sets the control point, relative to the start of the line. Whether it is a custom (user
   * placed) or a default point is set apart, with setIsSrcControlPointCustom.
   */
  setSrcControlPoint(control: PositionType): void {
    this.peer.setSrcControlPoint(control);
  }

  /**
   * Sets the control point, relative to the end of the line. Whether it is a custom (user placed)
   * or a default point is set apart, with setIsDestControlPointCustom.
   */
  setDestControlPoint(control: PositionType): void {
    this.peer.setDestControlPoint(control);
  }

  getControlPoints(): [PositionType, PositionType] {
    return this.peer.getControlPoints();
  }

  isSrcControlPointCustom(): boolean {
    return this.peer.isSrcControlPointCustom();
  }

  isDestControlPointCustom(): boolean {
    return this.peer.isDestControlPointCustom();
  }

  setIsSrcControlPointCustom(isCustom: boolean): void {
    this.peer.setIsSrcControlPointCustom(isCustom);
  }

  setIsDestControlPointCustom(isCustom: boolean): void {
    this.peer.setIsDestControlPointCustom(isCustom);
  }

  updateLine(avoidControlPointFix?: boolean): void {
    return this.peer.updateLine(Boolean(avoidControlPointFix));
  }

  /** Dashes the line; called without a length and a spacing, it draws it solid again. */
  setDashed(length?: number, spacing?: number): void {
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
