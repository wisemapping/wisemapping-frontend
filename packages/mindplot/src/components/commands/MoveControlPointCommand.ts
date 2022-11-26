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
import RelationshipControlPoints from '../RelationshipControlPoints';
import PositionType from '../PositionType';

class MoveControlPointCommand extends Command {
  private _controlPoints: RelationshipControlPoints;

  private _ctrPointPosition: PositionType;

  private _endPosition: PositionType;

  private _controlPointIndex: number;

  /**
   * @classdesc This command handles do/undo of changing the control points of a relationship
   * arrow. These are the two points that appear when the relationship is on focus. They
   * influence how the arrow is drawn (not the source or the destination topic nor the arrow
   * direction)
   */
  constructor(controlPoints: RelationshipControlPoints, controlPointIndex: number) {
    super();
    this._ctrPointPosition = controlPoints.getControlPointPosition(controlPointIndex);
    this._controlPointIndex = controlPointIndex;
    this._controlPoints = controlPoints;

    const relLine = controlPoints.getRelationship().getLine();
    this._endPosition = controlPointIndex === 0 ? relLine.getFrom() : relLine.getTo();
  }

  execute() {
    const relationship = this._controlPoints.getRelationship();
    const model = relationship.getModel();
    switch (this._controlPointIndex) {
      case 0:
        model.setSrcCtrlPoint(this._ctrPointPosition);
        relationship.setIsSrcControlPointCustom(true);

        relationship.setFrom(this._endPosition.x, this._endPosition.y);
        relationship.setSrcControlPoint(this._ctrPointPosition);
        break;
      case 1:
        model.setDestCtrlPoint(this._ctrPointPosition);
        relationship.setIsDestControlPointCustom(true);

        relationship.setTo(this._endPosition.x, this._endPosition.y);
        relationship.setDestControlPoint(this._ctrPointPosition);
        break;
      default:
        throw new Error('Illegal state exception');
    }

    if (relationship.isOnFocus()) {
      relationship.refreshShape();
    }
    // this.relationship.getLine().updateLine(this._point);
  }

  undoExecute() {
    // const line = this._line;
    // const model = line.getModel();
    // switch (this._controlPointIndex) {
    //   case 0:
    //     if ($defined(this._oldControlPoint)) {
    //       line.setFrom(this._oldRelEndpoint.x, this._oldRelEndpoint.y);
    //       model.setSrcCtrlPoint({ ...this._oldControlPoint });
    //       line.setSrcControlPoint({ ...this._oldControlPoint });
    //       line.setIsSrcControlPointCustom(this._isControlPointDefined);
    //     }
    //     break;
    //   case 1:
    //     if ($defined(this._oldControlPoint)) {
    //       line.setTo(this._oldRelEndpoint.x, this._oldRelEndpoint.y);
    //       model.setDestCtrlPoint({ ...this._oldControlPoint });
    //       line.setDestControlPoint({ ...this._oldControlPoint });
    //       line.setIsDestControlPointCustom(this._isControlPointDefined);
    //     }
    //     break;
    //   default:
    //     break;
    // }
    // // this._line.getLine().updateLine(this._point);
    // // if (this._line.isOnFocus()) {
    // //   this._ctrlPointControler.setRelationshipLine(line);
    // //   line._refreshShape();
    // // }
  }
}

export default MoveControlPointCommand;
