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
import { Arrow, CurvedLine } from '@wisemapping/web2d';
import type { Line } from '@wisemapping/web2d';
import ConnectionLine, { LineType } from './ConnectionLine';
import RelationshipControlPoints from './RelationshipControlPoints';
import RelationshipModel, { StrokeStyle } from './model/RelationshipModel';
import PositionType from './PositionType';
import Topic from './Topic';
import Shape from './util/Shape';
import Canvas from './Canvas';

class Relationship extends ConnectionLine {
  private _focusShape: Line;

  private _onFocus: boolean;

  private _isInWorkspace: boolean;

  private _controlPointsController: RelationshipControlPoints;

  private _showStartArrow: boolean;

  private _showEndArrow: boolean;

  private _endArrow!: Arrow;

  private _startArrow: Arrow;

  private _onFocusHandler: (event: MouseEvent) => void;

  private _model: RelationshipModel;

  constructor(sourceNode: Topic, targetNode: Topic, model: RelationshipModel) {
    super(sourceNode, targetNode, LineType.THIN_CURVED);
    this._model = model;

    const strokeColor = model.getStrokeColor() || Relationship.getStrokeColor();

    // Build line with thick stroke for event handling and dashed pattern
    this._line.setIsSrcControlPointCustom(false);
    this._line.setIsDestControlPointCustom(false);
    this._line.setCursor('pointer');
    // Set width to 0 to avoid closed path that creates double line effect
    (this._line as CurvedLine).setWidth(0);
    // Use stroke width (2px) for relationships
    this._line.setStroke(2, 'solid', strokeColor);
    this._line.setFill('none', 1);
    // Stroke style will be applied in redraw()
    this._line.setTestId(`${model.getFromNode()}-${model.getToNode()}-relationship`);

    // Build focus shape ...
    this._focusShape = this.createLine(LineType.THIN_CURVED);
    this._focusShape.setIsSrcControlPointCustom(false);
    this._focusShape.setIsDestControlPointCustom(false);
    // Focus shape is barely visible but always present for event handling
    this._focusShape.setVisibility(true);
    this._focusShape.setOpacity(0.01); // Barely visible so it gets rendered
    this._focusShape.setCursor('pointer');

    // Critical: Use thick stroke (12px) to ensure coverage of gaps in dotted line
    this._focusShape.setStroke(12, 'solid', '#3f96ff');
    this._focusShape.setFill('none', 1);

    // Ensure focus shape uses solid stroke rendering for continuous hit area
    (this._focusShape as CurvedLine).setWidth(0); // Force simple stroke rendering

    // Always create both arrows, but show them based on model
    this._startArrow = new Arrow();
    this._startArrow.setStrokeColor(strokeColor);
    this._startArrow.setStrokeWidth(2);

    this._endArrow = new Arrow();
    this._endArrow.setStrokeColor(strokeColor);
    this._endArrow.setStrokeWidth(2);

    // Set arrow visibility based on model
    this._showStartArrow = model.getStartArrow();
    this._showEndArrow = model.getEndArrow();
    this._onFocus = false;
    this._isInWorkspace = false;
    this._controlPointsController = new RelationshipControlPoints(this);

    // For all relationships, use default curved behavior to apply new pattern
    // This ensures both new and existing relationships follow the new control point pattern
    this._line.setIsSrcControlPointCustom(false);
    this._line.setIsDestControlPointCustom(false);

    // Reposition all nodes ...
    this.updatePositions();
    this._controlPointsController = new RelationshipControlPoints(this);

    // Initialize handler ..

    this._onFocusHandler = (event) => {
      this.setOnFocus(true);
      event.stopPropagation();
      event.preventDefault();
    };
  }

  setStroke(color: string, style: string, _opacity: number): void {
    this._line.setStroke(2, style, color);
    this._startArrow?.setStrokeColor(color);
    this._endArrow?.setStrokeColor(color);
    // Apply the stroke style from the model
    this._applyStrokeStyle(this._model.getStrokeStyle());
  }

  getModel(): RelationshipModel {
    return this._model;
  }

  private updatePositions() {
    const line2d = this._line;
    const sourceTopic = this._sourceTopic;
    const targetTopic = this._targetTopic;
    let tPos = targetTopic.getPosition();
    // For relationships, calculate connection points that face toward the center
    tPos = this.calculateRelationshipConnectionPoint(targetTopic);
    const sPos = this.calculateRelationshipConnectionPoint(sourceTopic);

    // Only set stroke once - remove redundant stroke calls
    const strokeColor = this._model.getStrokeColor() || Relationship.getStrokeColor();
    this._line.setStroke(2, 'solid', strokeColor);
    let ctrlPoints: [PositionType, PositionType];

    // Position line ...
    if (!line2d.isDestControlPointCustom() && !line2d.isSrcControlPointCustom()) {
      // Use default control points and basic connection points
      ctrlPoints = Shape.calculateDefaultControlPoints(sPos, tPos) as [PositionType, PositionType];
      line2d.setFrom(sPos.x, sPos.y);
      line2d.setTo(tPos.x, tPos.y);
    } else {
      // Control points have been manually moved - recalculate best connection points
      ctrlPoints = line2d.getControlPoints();

      // Calculate control point absolute positions
      const srcCtrlAbsolute = {
        x: sPos.x + ctrlPoints[0].x,
        y: sPos.y + ctrlPoints[0].y,
      };
      const destCtrlAbsolute = {
        x: tPos.x + ctrlPoints[1].x,
        y: tPos.y + ctrlPoints[1].y,
      };

      // Find best connection points based on control point directions
      const bestSrcPos = this.calculateBestConnectionPoint(sourceTopic, srcCtrlAbsolute);
      const bestDestPos = this.calculateBestConnectionPoint(targetTopic, destCtrlAbsolute);

      line2d.setFrom(bestSrcPos.x, bestSrcPos.y);
      line2d.setTo(bestDestPos.x, bestDestPos.y);

      // Recalculate control points relative to new connection points
      ctrlPoints = [
        {
          x: srcCtrlAbsolute.x - bestSrcPos.x,
          y: srcCtrlAbsolute.y - bestSrcPos.y,
        },
        {
          x: destCtrlAbsolute.x - bestDestPos.x,
          y: destCtrlAbsolute.y - bestDestPos.y,
        },
      ];
    }

    // Apply control points to create curved line
    line2d.setSrcControlPoint(ctrlPoints[0]);
    line2d.setDestControlPoint(ctrlPoints[1]);

    // Positionate Arrows
    this.positionArrows();

    // Add connector ...
    this._positionLine(targetTopic);

    // Poisition refresh shape ...
    this.positionRefreshShape();
  }

  redraw(): void {
    this.updatePositions();

    // Apply stroke style only once at the end of redraw
    this._applyStrokeStyle(this._model.getStrokeStyle());

    this._line.moveToFront();
    this._startArrow.moveToBack();
    this._endArrow.moveToBack();

    this._endArrow.setVisibility(this.isVisible() && this._showEndArrow);
    this._startArrow.setVisibility(this.isVisible() && this._showStartArrow);

    this._focusShape.moveToFront();
    this._controlPointsController.redraw();
  }

  private positionArrows(): void {
    const spos = this._line.getFrom();

    // Fix arrow direction: arrows should point in the direction of the relationship flow
    // Both arrows should point from source toward target
    this._startArrow.setFrom(spos.x, spos.y);
    this._endArrow.setFrom(spos.x, spos.y);

    if (this._line.getType() === 'CurvedLine') {
      const controlPoints = this._line.getControlPoints();
      // Both arrows point from source toward first control point (direction of flow)
      this._startArrow.setControlPoint(controlPoints[0]);
      this._endArrow.setControlPoint(controlPoints[0]);
    } else {
      // Both arrows point from source toward target (direction of flow)
      this._startArrow.setControlPoint(this._line.getTo());
      this._endArrow.setControlPoint(this._line.getTo());
    }
  }

  addToWorkspace(workspace: Canvas): void {
    this.updatePositions();

    // Add focus shape for event handling (invisible but present)
    workspace.append(this._focusShape.getElementClass());
    workspace.append(this._controlPointsController);

    if (workspace.isReadOnly()) {
      this._line.setCursor('default');
    } else {
      this._line.addEvent('click', this._onFocusHandler);
      this._focusShape.addEvent('click', this._onFocusHandler);
    }
    this._isInWorkspace = true;

    workspace.append(this._startArrow);
    workspace.append(this._endArrow);

    super.addToWorkspace(workspace);

    // Ensure all relationship components are rendered below topics
    this.moveToBack(); // Main relationship line
    this._focusShape.getElementClass().moveToBack();
    this._startArrow.moveToBack();
    this._endArrow.moveToBack();

    this.positionArrows();
    this.redraw();
  }

  removeFromWorkspace(workspace: Canvas): void {
    workspace.removeChild(this._controlPointsController);

    this._line.removeEvent('click', this._onFocusHandler);
    this._focusShape.removeEvent('click', this._onFocusHandler);
    this._isInWorkspace = false;

    // Remove all relationship components from workspace
    workspace.removeChild(this._focusShape.getElementClass());
    workspace.removeChild(this._startArrow);
    workspace.removeChild(this._endArrow);

    super.removeFromWorkspace(workspace);
  }

  getType() {
    return 'Relationship';
  }

  private calculateRelationshipConnectionPoint(topic: Topic): PositionType {
    const pos = topic.getPosition();
    const size = topic.getSize();
    const centerOffset = 2; // Small offset from edge

    // For relationships, connect from the side facing toward center (0,0)
    if (Math.abs(pos.x) > Math.abs(pos.y)) {
      // Horizontal positioning: connect from left/right side
      if (pos.x > 0) {
        // Right side topic: connect from left edge (toward center)
        return {
          x: pos.x - size.width / 2 + centerOffset,
          y: pos.y,
        };
      }
      // Left side topic: connect from right edge (toward center)
      return {
        x: pos.x + size.width / 2 - centerOffset,
        y: pos.y,
      };
    }
    // Vertical positioning: connect from top/bottom side
    if (pos.y > 0) {
      // Bottom topic: connect from top edge (toward center)
      return {
        x: pos.x,
        y: pos.y - size.height / 2 + centerOffset,
      };
    }
    // Top topic: connect from bottom edge (toward center)
    return {
      x: pos.x,
      y: pos.y + size.height / 2 - centerOffset,
    };
  }

  private calculateBestConnectionPoint(topic: Topic, controlPoint: PositionType): PositionType {
    const pos = topic.getPosition();
    const size = topic.getSize();
    const centerOffset = 2;

    // Calculate direction from node center to control point
    const deltaX = controlPoint.x - pos.x;
    const deltaY = controlPoint.y - pos.y;

    // Find which edge of the rectangle the control point direction points to
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      // Control point is more horizontal - connect from left or right edge
      if (deltaX > 0) {
        // Control point is to the right - connect from right edge
        return {
          x: pos.x + size.width / 2 - centerOffset,
          y: pos.y,
        };
      }
      // Control point is to the left - connect from left edge
      return {
        x: pos.x - size.width / 2 + centerOffset,
        y: pos.y,
      };
    }
    // Control point is more vertical - connect from top or bottom edge
    if (deltaY > 0) {
      // Control point is below - connect from bottom edge
      return {
        x: pos.x,
        y: pos.y + size.height / 2 - centerOffset,
      };
    }
    // Control point is above - connect from top edge
    return {
      x: pos.x,
      y: pos.y - size.height / 2 + centerOffset,
    };
  }

  setOnFocus(focus: boolean): void {
    if (focus) {
      this.positionRefreshShape();
    }
    // Change focus shape
    if (this.isOnFocus() !== focus) {
      if (focus) {
        // Show focus shape when focusing
        this._focusShape.setVisibility(true);
        this._focusShape.setOpacity(1);
        this._focusShape.setStroke(5, 'solid', '#3f96ff');
        // Move focus shape below the main line so style changes are visible
        this._focusShape.moveToBack();
      } else {
        // Completely hide focus shape when unfocusing
        this._focusShape.setVisibility(false);
        this._focusShape.setOpacity(0);
      }

      this._controlPointsController.setVisibility(focus);
      this._onFocus = focus;
      this.fireEvent(focus ? 'ontfocus' : 'ontblur', this);
    }
  }

  private positionRefreshShape(): void {
    const sPos = this._line.getFrom();
    const tPos = this._line.getTo();

    const ctrlPoints = this._line.getControlPoints();
    this._focusShape.setFrom(sPos.x, sPos.y);
    this._focusShape.setTo(tPos.x, tPos.y);

    this._focusShape.setSrcControlPoint(ctrlPoints[0]);
    this._focusShape.setDestControlPoint(ctrlPoints[1]);
  }

  addEvent(eventType: string, listener: () => void) {
    let type = eventType;
    // Translate to web 2d events ...
    if (type === 'onfocus') {
      type = 'mousedown';
    }

    const line = this._line;
    line.addEvent(type, listener);
  }

  isOnFocus(): boolean {
    return this._onFocus;
  }

  isInWorkspace(): boolean {
    return this._isInWorkspace;
  }

  setVisibility(value: boolean, fade = 0) {
    super.setVisibility(value, fade);

    // If visibility change, remove the on focus.
    this.setOnFocus(false);

    // Hide on focus shade when relationship is hidden
    this._endArrow.setVisibility(this._showEndArrow && value);
    this._startArrow.setVisibility(this._showStartArrow && value, fade);
    // Focus shape should only be visible when focused AND relationship is visible
    this._focusShape.setVisibility(false);
  }

  setOpacity(opacity: number): void {
    super.setOpacity(opacity);
    this._endArrow.setOpacity(opacity);
    this._startArrow.setOpacity(opacity);
  }

  setShowEndArrow(visible: boolean) {
    this._showEndArrow = visible;
    if (this._isInWorkspace) {
      this.redraw();
    }
  }

  setShowStartArrow(visible: boolean): void {
    this._showStartArrow = visible;
    if (this._isInWorkspace) this.redraw();
  }

  setFrom(x: number, y: number): void {
    this._line.setFrom(x, y);
    this._startArrow?.setFrom(x, y);
  }

  setTo(x: number, y: number) {
    this._line.setTo(x, y);
    this._endArrow.setFrom(x, y);
  }

  setSrcControlPoint(control: PositionType): void {
    this._line.setSrcControlPoint(control);
    this._focusShape.setSrcControlPoint(control);
    this._startArrow?.setControlPoint(control);
  }

  setDestControlPoint(control: PositionType) {
    this._line.setDestControlPoint(control);
    this._focusShape.setSrcControlPoint(control);
    this._endArrow?.setControlPoint(control);
  }

  getControlPoints(): [PositionType, PositionType] {
    return this._line.getControlPoints();
  }

  isSrcControlPointCustom(): boolean {
    return this._line.isSrcControlPointCustom();
  }

  isDestControlPointCustom(): boolean {
    return this._line.isDestControlPointCustom();
  }

  setIsSrcControlPointCustom(isCustom: boolean) {
    this._line.setIsSrcControlPointCustom(isCustom);
  }

  setIsDestControlPointCustom(isCustom: boolean) {
    this._line.setIsDestControlPointCustom(isCustom);
  }

  getId(): number {
    return this._model.getId();
  }

  fireEvent(type: string, event: unknown): void {
    const elem = this._line;
    elem.trigger(type, event);
  }

  private _applyStrokeStyle(strokeStyle: StrokeStyle): void {
    console.log(`Relationship ${this.getId()}: Applying stroke style: ${strokeStyle}`);
    switch (strokeStyle) {
      case StrokeStyle.SOLID:
        // Remove any dashed pattern for solid lines
        this._line.setDashed(0, 0);
        break;
      case StrokeStyle.DASHED:
        // 8px dashes, 4px gaps
        this._line.setDashed(8, 4);
        break;
      case StrokeStyle.DOTTED:
        // 1px dots, 3px gaps for proper dotted appearance
        this._line.setDashed(1, 3);
        break;
      default:
        // Default to dashed
        this._line.setDashed(8, 4);
        break;
    }
  }

  static getStrokeColor() {
    return '#9b74e6';
  }
}

export default Relationship;
