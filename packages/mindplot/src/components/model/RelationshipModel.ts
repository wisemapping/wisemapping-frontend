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
import { $assert, $defined } from '@wisemapping/core-js';
import { LineType } from '../ConnectionLine';
import PositionType from '../PositionType';

export enum StrokeStyle {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
}

class RelationshipModel {
  static _nextUuid = 0;

  private _id: number;

  private _sourceTargetId: number;

  private _targetTopicId: number;

  private _lineType: LineType;

  private _srcCtrlPoint: PositionType | null;

  private _destCtrlPoint: PositionType | null;

  private _endArrow: boolean;

  private _startArrow: boolean;

  private _strokeColor: string | undefined;

  private _strokeStyle: StrokeStyle;

  constructor(sourceTopicId: number, targetTopicId: number) {
    $assert($defined(sourceTopicId), 'from node type can not be null');
    $assert($defined(targetTopicId), 'to node type can not be null');
    $assert(Number.isFinite(sourceTopicId), 'sourceTopicId is not a number');
    $assert(Number.isFinite(targetTopicId), 'targetTopicId is not a number');

    this._id = RelationshipModel._nextUUID();
    this._sourceTargetId = sourceTopicId;
    this._targetTopicId = targetTopicId;
    this._lineType = LineType.THIN_CURVED;
    this._srcCtrlPoint = null;
    this._destCtrlPoint = null;
    this._endArrow = true;
    this._startArrow = false;
    this._strokeColor = undefined;
    this._strokeStyle = StrokeStyle.DASHED;
  }

  getFromNode(): number {
    return this._sourceTargetId;
  }

  getToNode(): number {
    return this._targetTopicId;
  }

  getId(): number {
    $assert(this._id, 'id is null');
    return this._id;
  }

  getLineType(): LineType {
    return this._lineType;
  }

  setLineType(lineType: LineType) {
    this._lineType = lineType;
  }

  getSrcCtrlPoint(): PositionType | null {
    return this._srcCtrlPoint;
  }

  setSrcCtrlPoint(srcCtrlPoint: PositionType): void {
    this._srcCtrlPoint = srcCtrlPoint;
  }

  getDestCtrlPoint(): PositionType | null {
    return this._destCtrlPoint;
  }

  setDestCtrlPoint(destCtrlPoint: PositionType): void {
    this._destCtrlPoint = destCtrlPoint;
  }

  getEndArrow(): boolean {
    return this._endArrow;
  }

  setEndArrow(endArrow: boolean) {
    this._endArrow = endArrow;
  }

  getStartArrow(): boolean {
    return this._startArrow;
  }

  setStartArrow(startArrow: boolean): void {
    this._startArrow = startArrow;
  }

  getStrokeColor(): string | undefined {
    return this._strokeColor;
  }

  setStrokeColor(strokeColor: string | undefined): void {
    this._strokeColor = strokeColor;
  }

  getStrokeStyle(): StrokeStyle {
    return this._strokeStyle;
  }

  setStrokeStyle(strokeStyle: StrokeStyle): void {
    this._strokeStyle = strokeStyle;
  }

  /**
   * @return a clone of the relationship model
   */
  clone() {
    const result = new RelationshipModel(this._sourceTargetId, this._targetTopicId);
    result._id = this._id;
    result._lineType = this._lineType;
    result._srcCtrlPoint = this._srcCtrlPoint;
    result._destCtrlPoint = this._destCtrlPoint;
    result._endArrow = this._endArrow;
    result._startArrow = this._startArrow;
    result._strokeColor = this._strokeColor;
    result._strokeStyle = this._strokeStyle;
    return result;
  }

  /**
   * @return {String} textual information about the relationship's source and target node
   */
  inspect(): string {
    return `(fromNode:${this.getFromNode()} , toNode: ${this.getToNode()})`;
  }

  static _nextUUID() {
    RelationshipModel._nextUuid += 1;
    return RelationshipModel._nextUuid;
  }
}

export default RelationshipModel;
