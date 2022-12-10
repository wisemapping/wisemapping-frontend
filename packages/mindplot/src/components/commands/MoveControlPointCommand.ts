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
import { PivotType } from '../RelationshipControlPoints';
import PositionType from '../PositionType';
import RelationshipModel from '../model/RelationshipModel';
import CommandContext from '../CommandContext';

class MoveControlPointCommand extends Command {
  private _ctrIndex: PivotType;

  private _controlPoint: PositionType | null;

  private _modelId: number;

  constructor(model: RelationshipModel, controlPoint: PositionType, ctrIndex: PivotType) {
    super();
    // New control points ...
    this._ctrIndex = ctrIndex;
    this._controlPoint = controlPoint;
    this._modelId = model.getId();
  }

  execute(commandContext: CommandContext): void {
    const relationship = commandContext.findRelationships([this._modelId])[0];
    const model = relationship.getModel();

    let oldCtlPoint: PositionType;
    switch (this._ctrIndex) {
      case PivotType.Start:
        oldCtlPoint = model.getSrcCtrlPoint();
        model.setSrcCtrlPoint(this._controlPoint);
        relationship.setIsSrcControlPointCustom(this._controlPoint != null);
        if (this._controlPoint) {
          relationship.setSrcControlPoint(this._controlPoint);
        }
        break;
      case PivotType.End:
        oldCtlPoint = model.getDestCtrlPoint();
        model.setDestCtrlPoint(this._controlPoint);
        relationship.setIsDestControlPointCustom(this._controlPoint != null);
        if (this._controlPoint) {
          relationship.setDestControlPoint(this._controlPoint);
        }
        break;
      default:
        throw new Error('Illegal state exception');
    }
    this._controlPoint = oldCtlPoint ? { ...oldCtlPoint } : null;

    relationship.redraw();
    relationship.setOnFocus(true);
  }

  undoExecute(commandContext: CommandContext): void {
    this.execute(commandContext);
  }
}

export default MoveControlPointCommand;
