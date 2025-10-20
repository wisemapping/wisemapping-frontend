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
import BaseConnectionLine, { LineType } from './BaseConnectionLine';
import ArcLine from './model/ArcLine';
import RelationshipControlPoints from './RelationshipControlPoints';
import RelationshipModel, { StrokeStyle } from './model/RelationshipModel';
import PositionType from './PositionType';
import Topic from './Topic';
import Shape from './util/Shape';
import Canvas from './Canvas';

/**
 * Relationship represents arbitrary connections between topics (not hierarchical)
 */
class Relationship extends BaseConnectionLine {
  private _sourceTopic: Topic;

  private _targetTopic: Topic;

  private _focusShape: Line;

  private _onFocus: boolean;

  private _isInWorkspace: boolean;

  private _controlPointsController: RelationshipControlPoints;

  private _showStartArrow: boolean;

  private _showEndArrow: boolean;

  private _endArrow!: Arrow;

  private _startArrow: Arrow;

  private _focusStartArrow: Arrow;

  private _focusEndArrow: Arrow;

  private _onFocusHandler: (event: Event, detail?: unknown) => void;

  private _model: RelationshipModel;

  constructor(sourceNode: Topic, targetNode: Topic, model: RelationshipModel) {
    super(LineType.THIN_CURVED);
    this._sourceTopic = sourceNode;
    this._targetTopic = targetNode;
    this._model = model;

    // Initialize line after setting topics
    this.initializeLine();

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

    // Create focus arrows (shown when relationship is focused)
    this._focusStartArrow = new Arrow();
    this._focusStartArrow.setStrokeColor('#3f96ff');
    this._focusStartArrow.setStrokeWidth(5);
    this._focusStartArrow.setVisibility(false);

    this._focusEndArrow = new Arrow();
    this._focusEndArrow.setStrokeColor('#3f96ff');
    this._focusEndArrow.setStrokeWidth(5);
    this._focusEndArrow.setVisibility(false);

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

  protected getLineWidth(): number {
    return 3; // Relationships always use thin lines
  }

  protected getLineWidthOrganic(): number {
    return 5; // Slightly thicker for organic style
  }

  protected createArcLine(): Line {
    return new ArcLine(this._sourceTopic, this._targetTopic);
  }

  getSourceTopic(): Topic {
    return this._sourceTopic;
  }

  getTargetTopic(): Topic {
    return this._targetTopic;
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
      ctrlPoints = this.recalculateCustomControlPoints(line2d, sourceTopic, targetTopic);
    }

    // Apply control points to create curved line
    line2d.setSrcControlPoint(ctrlPoints[0]);
    line2d.setDestControlPoint(ctrlPoints[1]);

    // Positionate Arrows
    this.positionArrows();

    // Position refresh shape ...
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
    const tpos = this._line.getTo();

    // Position arrows at their respective ends
    // Start arrow: at the source (from) position
    // End arrow: at the target (to) position
    this._startArrow.setFrom(spos.x, spos.y);
    this._endArrow.setFrom(tpos.x, tpos.y);

    if (this._line.getType() === 'CurvedLine') {
      const controlPoints = this._line.getControlPoints();
      // Start arrow points from source toward first control point (direction of flow)
      this._startArrow.setControlPoint(controlPoints[0]);
      // End arrow points from target back toward second control point (direction of flow)
      this._endArrow.setControlPoint(controlPoints[1]);
    } else {
      // For straight lines:
      // Start arrow points from source toward target
      this._startArrow.setControlPoint(tpos);
      // End arrow points from target back toward source
      this._endArrow.setControlPoint(spos);
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
    workspace.append(this._focusStartArrow);
    workspace.append(this._focusEndArrow);

    super.addToWorkspace(workspace);

    // Ensure all relationship components are rendered below topics
    this.moveToBack(); // Main relationship line
    this._focusShape.getElementClass().moveToBack();
    this._startArrow.moveToBack();
    this._endArrow.moveToBack();
    this._focusStartArrow.moveToBack();
    this._focusEndArrow.moveToBack();

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
    workspace.removeChild(this._focusStartArrow);
    workspace.removeChild(this._focusEndArrow);

    super.removeFromWorkspace(workspace);
  }

  getType() {
    return 'Relationship';
  }

  /**
   * Calculate the best snap point on a topic's border for a relationship connection
   * @param topic The topic to connect to
   * @param targetPosition The position we're connecting toward (other topic or control point)
   * @returns The optimal connection point on the topic's border
   */
  static calculateSnapPoint(topic: Topic, targetPosition: PositionType): PositionType {
    const pos = topic.getPosition();
    const size = topic.getSize();
    const centerOffset = 7; // 7px offset from topic border for visual spacing

    // Calculate direction to target to minimize connection distance
    const deltaX = targetPosition.x - pos.x;
    const deltaY = targetPosition.y - pos.y;

    // Determine which edge is closest by comparing angles
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Define 10 connection points per side evenly distributed along each edge
    const horizontalPoints = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
    const verticalPoints = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];

    if (absY > absX) {
      // Vertical connection is shorter (top or bottom)
      const edgeY =
        deltaY < 0
          ? pos.y - size.height / 2 - centerOffset // Top border (move up/away)
          : pos.y + size.height / 2 + centerOffset; // Bottom border (move down/away)

      // Calculate all 10 connection points along the horizontal edge
      const connectionPoints = horizontalPoints.map((ratio) => {
        const x = pos.x - size.width / 2 + size.width * ratio;
        return {
          x,
          y: edgeY,
          distance: Math.hypot(x - targetPosition.x, edgeY - targetPosition.y),
        };
      });

      // Find the closest point
      const closest = connectionPoints.reduce((min, point) =>
        point.distance < min.distance ? point : min,
      );

      return { x: closest.x, y: closest.y };
    }

    // Horizontal connection is shorter (left or right)
    const edgeX =
      deltaX < 0
        ? pos.x - size.width / 2 - centerOffset // Left border (move left/away)
        : pos.x + size.width / 2 + centerOffset; // Right border (move right/away)

    // Calculate all 10 connection points along the vertical edge
    const connectionPoints = verticalPoints.map((ratio) => {
      const y = pos.y - size.height / 2 + size.height * ratio;
      return { x: edgeX, y, distance: Math.hypot(edgeX - targetPosition.x, y - targetPosition.y) };
    });

    // Find the closest point
    const closest = connectionPoints.reduce((min, point) =>
      point.distance < min.distance ? point : min,
    );

    return { x: closest.x, y: closest.y };
  }

  private calculateRelationshipConnectionPoint(topic: Topic): PositionType {
    // Determine which topic we're calculating for
    const isSourceTopic = topic === this._sourceTopic;
    const otherTopic = isSourceTopic ? this._targetTopic : this._sourceTopic;
    const otherPos = otherTopic.getPosition();

    // Use the shared snap point calculation
    return Relationship.calculateSnapPoint(topic, otherPos);
  }

  private calculateBestConnectionPoint(topic: Topic, controlPoint: PositionType): PositionType {
    // Use the shared snap point calculation
    return Relationship.calculateSnapPoint(topic, controlPoint);
  }

  /**
   * Recalculates connection points and control points when control points have been customized.
   * This ensures control points maintain their absolute positions while connection points
   * are optimized based on the control point directions.
   *
   * @param line2d The line to update
   * @param sourceTopic Source topic
   * @param targetTopic Target topic
   * @returns Updated control points relative to new connection points
   */
  private recalculateCustomControlPoints(
    line2d: Line,
    sourceTopic: Topic,
    targetTopic: Topic,
  ): [PositionType, PositionType] {
    // Get current control points (relative to current line positions)
    const ctrlPoints = line2d.getControlPoints();

    // Use CURRENT line positions (what the control points are actually relative to)
    // NOT freshly calculated positions which may be different
    const currentFrom = line2d.getFrom();
    const currentTo = line2d.getTo();

    // Calculate control point absolute positions based on current line positions
    const srcCtrlAbsolute = {
      x: currentFrom.x + ctrlPoints[0].x,
      y: currentFrom.y + ctrlPoints[0].y,
    };
    const destCtrlAbsolute = {
      x: currentTo.x + ctrlPoints[1].x,
      y: currentTo.y + ctrlPoints[1].y,
    };

    // Find best connection points based on control point directions
    const bestSrcPos = this.calculateBestConnectionPoint(sourceTopic, srcCtrlAbsolute);
    const bestDestPos = this.calculateBestConnectionPoint(targetTopic, destCtrlAbsolute);

    // Update line positions to new connection points
    line2d.setFrom(bestSrcPos.x, bestSrcPos.y);
    line2d.setTo(bestDestPos.x, bestDestPos.y);

    // Recalculate control points relative to new connection points
    return [
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

        // Show focus arrows if corresponding arrows are enabled
        this._focusStartArrow.setVisibility(this._showStartArrow);
        this._focusEndArrow.setVisibility(this._showEndArrow);
        this._focusStartArrow.moveToBack();
        this._focusEndArrow.moveToBack();
      } else {
        // Completely hide focus shape when unfocusing
        this._focusShape.setVisibility(false);
        this._focusShape.setOpacity(0);

        // Hide focus arrows
        this._focusStartArrow.setVisibility(false);
        this._focusEndArrow.setVisibility(false);
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

    // Position focus arrows
    this.positionFocusArrows(sPos, tPos, ctrlPoints);
  }

  private positionFocusArrows(
    sPos: PositionType,
    tPos: PositionType,
    ctrlPoints: [PositionType, PositionType],
  ): void {
    // Position focus arrows at their respective ends (same as regular arrows)
    this._focusStartArrow.setFrom(sPos.x, sPos.y);
    this._focusEndArrow.setFrom(tPos.x, tPos.y);

    if (this._line.getType() === 'CurvedLine') {
      // Start arrow points from source toward first control point
      this._focusStartArrow.setControlPoint(ctrlPoints[0]);
      // End arrow points from target back toward second control point
      this._focusEndArrow.setControlPoint(ctrlPoints[1]);
    } else {
      // For straight lines
      this._focusStartArrow.setControlPoint(tPos);
      this._focusEndArrow.setControlPoint(sPos);
    }
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
      // Update focus arrow visibility if currently focused
      if (this._onFocus) {
        this._focusEndArrow.setVisibility(visible);
      }
    }
  }

  setShowStartArrow(visible: boolean): void {
    this._showStartArrow = visible;
    if (this._isInWorkspace) {
      this.redraw();
      // Update focus arrow visibility if currently focused
      if (this._onFocus) {
        this._focusStartArrow.setVisibility(visible);
      }
    }
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
