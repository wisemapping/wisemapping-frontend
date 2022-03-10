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
import { Line } from '@wisemapping/web2d';
import Command from '../Command';
import ControlPoint from '../ControlPoint';
import PositionType from '../PositionType';

class MoveControlPointCommand extends Command {
  private _ctrlPointControler: ControlPoint;

  private _line: Line;

  private _controlPoint: Line;

  private _oldControlPoint: Line;

  private _originalEndPoint: PositionType;

  private _wasCustom: boolean;

  private _endPoint: any;

  private _point: number;

  /**
   * @classdesc This command handles do/undo of changing the control points of a relationship
   * arrow. These are the two points that appear when the relationship is on focus. They
   * influence how the arrow is drawn (not the source or the destination topic nor the arrow
     * direction)
     */
  constructor(ctrlPointController: ControlPoint, point: number) {
    $assert(ctrlPointController, 'line can not be null');
    $assert($defined(point), 'point can not be null');

    super();
    this._ctrlPointControler = ctrlPointController;
    this._line = ctrlPointController._line;
    this._controlPoint = { ...this._ctrlPointControler.getControlPoint(point) };
    this._oldControlPoint = { ...this._ctrlPointControler.getOriginalCtrlPoint(point) };
    this._originalEndPoint = this._ctrlPointControler.getOriginalEndPoint(point);
    switch (point) {
      case 0:
        this._wasCustom = this._line.getLine().isSrcControlPointCustom();
        this._endPoint = { ...this._line.getLine().getFrom() };
        break;
      case 1:
        this._wasCustom = this._line.getLine().isDestControlPointCustom();
        this._endPoint = { ...this._line.getLine().getTo() };
        break;
      default:
        break;
    }
    this._point = point;
  }

  execute() {
    const model = this._line.getModel();
    switch (this._point) {
      case 0:
        model.setSrcCtrlPoint({ ...this._controlPoint });
        this._line.setFrom(this._endPoint.x, this._endPoint.y);
        this._line.setIsSrcControlPointCustom(true);
        this._line.setSrcControlPoint({ ...this._controlPoint });
        break;
      case 1:
        model.setDestCtrlPoint({ ...this._controlPoint });
        this._wasCustom = this._line.getLine().isDestControlPointCustom();
        this._line.setTo(this._endPoint.x, this._endPoint.y);
        this._line.setIsDestControlPointCustom(true);
        this._line.setDestControlPoint({ ...this._controlPoint });
        break;
      default:
        break;
    }
    if (this._line.isOnFocus()) {
      this._line._refreshShape();
      this._ctrlPointControler.setLine(this._line);
    }
    this._line.getLine().updateLine(this._point);
  }

  undoExecute() {
    const line = this._line;
    const model = line.getModel();
    switch (this._point) {
      case 0:
        if ($defined(this._oldControlPoint)) {
          line.setFrom(this._originalEndPoint.x, this._originalEndPoint.y);
          model.setSrcCtrlPoint({ ...this._oldControlPoint });
          line.setSrcControlPoint({ ...this._oldControlPoint });
          line.setIsSrcControlPointCustom(this._wasCustom);
        }
        break;
      case 1:
        if ($defined(this._oldControlPoint)) {
          line.setTo(this._originalEndPoint.x, this._originalEndPoint.y);
          model.setDestCtrlPoint({ ...this._oldControlPoint });
          line.setDestControlPoint({ ...this._oldControlPoint });
          line.setIsDestControlPointCustom(this._wasCustom);
        }
        break;
      default:
        break;
    }
    this._line.getLine().updateLine(this._point);
    if (this._line.isOnFocus()) {
      this._ctrlPointControler.setLine(line);
      line._refreshShape();
    }
  }
}

export default MoveControlPointCommand;
