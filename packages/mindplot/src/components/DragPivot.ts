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
import { Point, CurvedLine, Rect } from '@wisemapping/web2d';
import { $assert, $defined } from './util/assert';
import PositionType from './PositionType';

import SizeType from './SizeType';
import Topic from './Topic';
import Shape from './util/Shape';
import Canvas from './Canvas';
import CanvasElement from './CanvasElement';

class DragPivot implements CanvasElement {
  private _position: PositionType;

  private _isVisible: boolean;

  private _targetTopic: Topic | null;

  private _connectRect: Rect;

  private _dragPivot: Rect;

  private _curvedLine: CurvedLine;

  private _straightLine: CurvedLine;

  private _size: SizeType;

  constructor() {
    this._position = { x: 0, y: 0 };
    this._size = DragPivot.DEFAULT_PIVOT_SIZE;

    this._straightLine = this._buildStraightLine();
    this._curvedLine = this._buildCurvedLine();
    this._dragPivot = this._buildRect();
    this._connectRect = this._buildRect();
    this._targetTopic = null;
    this._isVisible = false;
  }

  isVisible(): boolean {
    return this._isVisible;
  }

  getTargetTopic(): Topic | null {
    return this._targetTopic;
  }

  private _buildStraightLine(): CurvedLine {
    const line = new CurvedLine();
    line.setStroke(1, 'solid', '#CC0033');
    line.setOpacity(0.4);
    line.setVisibility(false);
    return line;
  }

  private _buildCurvedLine(): CurvedLine {
    const line = new CurvedLine();
    line.setStroke(1, 'solid', '#CC0033');
    line.setOpacity(0.4);
    line.setVisibility(false);
    return line;
  }

  private _redrawLine(): void {
    // Update line position.
    $assert(this.getTargetTopic(), 'Illegal invocation. Target node can not be null');

    const pivotRect = this._getPivotRect();

    // Pivot position has not changed. In this case, position change is not required.
    const targetTopic = this.getTargetTopic();
    const position = this._position;

    // Calculate pivot connection point ...
    const size = this._size;
    const targetPosition = targetTopic!.getPosition();
    const line = this._getConnectionLine();

    // Update Line position based on orientation
    const orientation = targetTopic!.getOrientation();
    let pivotPoint: PositionType;

    if (orientation === 'vertical') {
      // Tree layout: connect from top center of pivot (going up to parent)
      pivotPoint = {
        x: position.x,
        y: position.y - size.height / 2,
      };
    } else {
      // Mindmap layout: connect from left or right side
      const isAtRight = Shape.isAtRight(targetPosition, position);
      pivotPoint = Shape.calculateRectConnectionPoint(position, size, isAtRight);
    }

    line?.setFrom(pivotPoint.x, pivotPoint.y);

    // Update rect position
    const cx = position.x - size.width / 2;
    const cy = position.y - size.height / 2;
    pivotRect.setPosition(cx, cy);

    // Make line visible only when the position has been already changed.
    // This solve several strange effects ;)
    const targetPoint = targetTopic!.workoutIncomingConnectionPoint(pivotPoint);
    line?.setTo(targetPoint.x, targetPoint.y);

    // Set control points based on orientation
    if (line) {
      if (orientation === 'vertical') {
        // Vertical orientation: control points based on Y distance
        const deltaY = (targetPoint.y - pivotPoint.y) / 3;
        line.setSrcControlPoint(new Point(0, deltaY));
        line.setDestControlPoint(new Point(0, -deltaY));
      } else {
        // Horizontal orientation: control points based on X distance
        const deltaX = (targetPoint.x - pivotPoint.x) / 3;
        line.setSrcControlPoint(new Point(deltaX, 0));
        line.setDestControlPoint(new Point(-deltaX, 0));
      }
    }
  }

  setPosition(point: Point): void {
    this._position = point;
    this._redrawLine();
  }

  getPosition(): PositionType {
    return this._position;
  }

  private _buildRect(): Rect {
    const size = this._size;
    const rectAttributes = {
      fillColor: '#CC0033',
      opacity: 0.4,
      width: size.width,
      height: size.height,
      strokeColor: '#FF9933',
    };
    const rect = new Rect(0, rectAttributes);
    rect.setVisibility(false);
    return rect;
  }

  private _getPivotRect(): Rect {
    return this._dragPivot;
  }

  getSize(): SizeType {
    const elem2d = this._getPivotRect();
    return elem2d.getSize();
  }

  setVisibility(value: boolean) {
    if (this.isVisible() !== value) {
      const pivotRect = this._getPivotRect();
      pivotRect.setVisibility(value);

      const connectRect = this._connectRect;
      connectRect.setVisibility(value);

      const line = this._getConnectionLine();
      if (line) {
        line.setVisibility(value);
      }
      this._isVisible = value;
    }
  }

  // If the node is connected, validate that there is a line connecting both...
  _getConnectionLine(): CurvedLine | null {
    // Always use straight line for drag preview
    return this._targetTopic ? this._straightLine : null;
  }

  addToWorkspace(workspace: Canvas) {
    const pivotRect = this._getPivotRect();
    workspace.append(pivotRect);

    const connectToRect = this._connectRect;
    workspace.append(connectToRect);

    // Add a hidden straight line ...
    const straighLine = this._straightLine;
    straighLine.setVisibility(false);
    workspace.append(straighLine);
    straighLine.moveToBack();

    // Add a hidden curved line ...
    const curvedLine = this._curvedLine;
    curvedLine.setVisibility(false);
    workspace.append(curvedLine);
    curvedLine.moveToBack();

    // Add a connect rect ...
    const connectRect = this._connectRect;
    connectRect.setVisibility(false);
    workspace.append(connectRect);
    connectRect.moveToBack();
  }

  removeFromWorkspace(workspace: Canvas) {
    const shape = this._getPivotRect();
    workspace.removeChild(shape);

    const connectToRect = this._connectRect;
    workspace.removeChild(connectToRect);

    if ($defined(this._straightLine)) {
      workspace.removeChild(this._straightLine);
    }

    if ($defined(this._curvedLine)) {
      workspace.removeChild(this._curvedLine);
    }
  }

  connectTo(targetTopic: Topic, position: PositionType) {
    $assert(position, 'position can not be null');
    $assert(targetTopic, 'parent can not be null');

    this._position = position;
    this._targetTopic = targetTopic;

    // Connected to Rect ...
    const connectRect = this._connectRect;
    const targetSize = targetTopic.getSize();

    // Add 4 pixel in order to keep create a rect bigger than the topic.
    const width = targetSize.width + 4;
    const height = targetSize.height + 4;

    connectRect.setSize(width, height);

    const targetPosition = targetTopic.getPosition();
    const cx = Math.ceil(targetPosition.x - width / 2);
    const cy = Math.ceil(targetPosition.y - height / 2);
    connectRect.setPosition(cx, cy);

    // Change elements position ...
    const pivotRect = this._getPivotRect();
    pivotRect.moveToFront();

    // Position the pivot rect centered at the given position
    const size = this._size;
    const pivotX = position.x - size.width / 2;
    const pivotY = position.y - size.height / 2;
    pivotRect.setPosition(pivotX, pivotY);

    this._redrawLine();
  }

  disconnect(workspace: Canvas): void {
    $assert(workspace, 'workspace can not be null.');
    $assert(this._targetTopic, 'There are not connected topic.');

    this.setVisibility(false);
    this._targetTopic = null;
  }

  static DEFAULT_PIVOT_SIZE = { width: 50, height: 6 };
}

export default DragPivot;
