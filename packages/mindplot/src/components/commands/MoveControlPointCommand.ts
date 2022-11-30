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
import Command from '../Command';
import RelationshipControlPoints, { PivotType } from '../RelationshipControlPoints';
import PositionType from '../PositionType';

class MoveControlPointCommand extends Command {
  private _controlPoints: RelationshipControlPoints;

  private _ctrIndex: PivotType;

  private _oldCtrPoint: PositionType;

  private _newCtrPoint: PositionType;

  /**
   * @classdesc This command handles do/undo of changing the control points of a relationship
   * arrow. These are the two points that appear when the relationship is on focus. They
   * influence how the arrow is drawn (not the source or the destination topic nor the arrow
   * direction)
   */
  constructor(controlPoints: RelationshipControlPoints, ctrIndex: PivotType) {
    super();
    // New control points ...
    this._controlPoints = controlPoints;
    this._ctrIndex = ctrIndex;
    this._newCtrPoint = controlPoints.getControlPointPosition(ctrIndex);

    // Backup previous control points ...
    const relationship = controlPoints.getRelationship();
    const model = relationship.getModel();
    this._oldCtrPoint =
      PivotType.Start === ctrIndex ? model.getSrcCtrlPoint() : model.getDestCtrlPoint();
    this._oldCtrPoint = { ...this._oldCtrPoint };

    // New relationship ...
    this._newCtrPoint = { ...controlPoints.getControlPointPosition(ctrIndex) };
  }

  execute() {
    const relationship = this._controlPoints.getRelationship();
    const model = relationship.getModel();
    switch (this._ctrIndex) {
      case PivotType.Start:
        model.setSrcCtrlPoint(this._newCtrPoint);
        relationship.setIsSrcControlPointCustom(true);
        relationship.setSrcControlPoint(this._newCtrPoint);
        break;
      case PivotType.End:
        model.setDestCtrlPoint(this._newCtrPoint);
        relationship.setIsDestControlPointCustom(true);
        relationship.setDestControlPoint(this._newCtrPoint);
        break;
      default:
        throw new Error('Illegal state exception');
    }

    relationship.redraw();
  }

  undoExecute() {
    const relationship = this._controlPoints.getRelationship();
    const model = relationship.getModel();

    const isCustom = this._oldCtrPoint != null;
    relationship.setIsDestControlPointCustom(isCustom);

    switch (this._ctrIndex) {
      case PivotType.Start:
        model.setSrcCtrlPoint(this._oldCtrPoint);
        relationship.setSrcControlPoint(this._oldCtrPoint);
        break;
      case PivotType.End:
        model.setDestCtrlPoint(this._oldCtrPoint);
        relationship.setDestControlPoint(this._oldCtrPoint);
        break;
      default:
        throw new Error('Illegal state exception');
    }

    console.log('undo ...');
    relationship.redraw();
  }
}

export default MoveControlPointCommand;
