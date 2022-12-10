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
import Point from '@wisemapping/web2d';
import { LineType } from '../ConnectionLine';

class RelationshipModel {
  static _nextUuid = 0;

  private _id: number;

  private _sourceTargetId: number;

  private _targetTopicId: number;

  private _lineType: number;

  private _srcCtrlPoint: Point;

  private _destCtrlPoint: Point;

  private _endArrow: boolean;

  private _startArrow: boolean;

  constructor(sourceTopicId: number, targetTopicId: number) {
    $assert($defined(sourceTopicId), 'from node type can not be null');
    $assert($defined(targetTopicId), 'to node type can not be null');
    $assert(Number.isFinite(sourceTopicId), 'sourceTopicId is not a number');
    $assert(Number.isFinite(targetTopicId), 'targetTopicId is not a number');

    this._id = RelationshipModel._nextUUID();
    this._sourceTargetId = sourceTopicId;
    this._targetTopicId = targetTopicId;
    this._lineType = LineType.SIMPLE_CURVED;
    this._srcCtrlPoint = null;
    this._destCtrlPoint = null;
    this._endArrow = true;
    this._startArrow = false;
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

  getLineType(): number {
    return this._lineType;
  }

  setLineType(lineType: number) {
    this._lineType = lineType;
  }

  getSrcCtrlPoint(): Point {
    return this._srcCtrlPoint;
  }

  setSrcCtrlPoint(srcCtrlPoint: Point) {
    this._srcCtrlPoint = srcCtrlPoint;
  }

  getDestCtrlPoint(): Point {
    return this._destCtrlPoint;
  }

  setDestCtrlPoint(destCtrlPoint: Point): void {
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
