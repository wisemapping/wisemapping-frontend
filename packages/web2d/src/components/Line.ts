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
import ElementPeer from './peer/svg/ElementPeer';
import PositionType from './PositionType';

interface Line {
  setFrom(x: number, y: number): void;

  setTo(x: number, y: number): void;

  setIsSrcControlPointCustom(value: boolean): void;

  setIsDestControlPointCustom(value: boolean): void;

  setCursor(value: string): void;

  setStroke(width: number, style?: string, color?: string, opacity?: number): void;

  setFill(color: string, opacity: number): void;

  setDashed(v: number, v2: number): void;

  setVisibility(value: boolean, fade?: number): void;

  isVisible(): boolean;

  setOpacity(value: number): void;

  moveToBack(): void;

  setTestId(value: string): void;

  setSrcControlPoint(value: PositionType): void;

  setDestControlPoint(value: PositionType): void;

  isDestControlPointCustom(): boolean;

  isSrcControlPointCustom(): boolean;

  getControlPoints(): [PositionType, PositionType];

  trigger(value, event): void;

  getTo(): PositionType;

  getFrom(): PositionType;

  moveToFront(): void;

  getType(): string;

  addEvent(value, listener): void;

  removeEvent(value, listener): void;

  updateLine(): void;

  getElementClass(): WorkspaceElement<ElementPeer>;
}
export default Line;
