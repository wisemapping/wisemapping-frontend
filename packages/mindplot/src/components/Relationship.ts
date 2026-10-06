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
import { Arrow } from '@wisemapping/web2d';
import type { Line, StrokeStyle as LineStrokeStyle, CurvedLine } from '@wisemapping/web2d';
import BaseConnectionLine, { LineType } from './BaseConnectionLine';
import ArcLine from './model/ArcLine';
import RelationshipControlPoints, { PivotType } from './RelationshipControlPoints';
import type RelationshipModel from './model/RelationshipModel';
import { StrokeStyle } from './model/RelationshipModel';
import type PositionType from './PositionType';
import type Topic from './Topic';
import Shape from './util/Shape';
import RelationshipSnap from './RelationshipSnap';
import type Canvas from './Canvas';

/** The relationship's own events: it fires them, with itself as detail, on a focus change. */
export type RelationshipEventMap = { ontfocus: Relationship; ontblur: Relationship };

/**
 * Relationship represents arbitrary connections between topics (not hierarchical)
 */
class Relationship extends BaseConnectionLine<CurvedLine> {
  private _sourceTopic: Topic;

  private _targetTopic: Topic;

  private _focusShape: CurvedLine;

  private _onFocus: boolean;

  private _isInWorkspace: boolean;

  private _controlPointsController: RelationshipControlPoints;

  private _showStartArrow: boolean;

  private _showEndArrow: boolean;

  private _endArrow!: Arrow;

  private _startArrow: Arrow;

  private _focusStartArrow: Arrow;

  private _focusEndArrow: Arrow;

  private _onFocusHandler: (event: Event) => void;

  private _model: RelationshipModel;

  // The connection point each control point was released at in this session, as an offset from
  // the centre of its topic, by end and control point. A stored control point is relative to a
  // snap point, and it fits several of them (BL5-41): this places it again where the drag left it.
  private _releasedOffsets: [Map<string, PositionType>, Map<string, PositionType>];

  constructor(sourceNode: Topic, targetNode: Topic, model: RelationshipModel) {
    super(LineType.THIN_CURVED);
    this._sourceTopic = sourceNode;
    this._targetTopic = targetNode;
    this._model = model;
    this._releasedOffsets = [new Map(), new Map()];

    // Initialize line after setting topics
    this.initializeLine();

    const strokeColor = model.getStrokeColor() || Relationship.getStrokeColor();

    // Build line with thick stroke for event handling and dashed pattern
    this._line.setIsSrcControlPointCustom(false);
    this._line.setIsDestControlPointCustom(false);
    this._line.setCursor('pointer');
    // Set width to 0 to avoid closed path that creates double line effect
    this._line.setWidth(0);
    // Use stroke width (2px) for relationships
    this._line.setStroke(2, 'solid', strokeColor);
    this._line.setFill('none', 1);
    // Stroke style will be applied in redraw()
    this._line.setTestId(`${model.getFromNode()}-${model.getToNode()}-relationship`);

    // Build focus shape ...
    this._focusShape = BaseConnectionLine.createCurvedLine(10);
    this._focusShape.setIsSrcControlPointCustom(false);
    this._focusShape.setIsDestControlPointCustom(false);
    // Focus shape is barely visible but always present for event handling
    this.showHitShape();
    this._focusShape.setCursor('pointer');
    this._focusShape.setFill('none', 1);
    this._focusShape.setTestId(`${model.getFromNode()}-${model.getToNode()}-relationship`);

    // Ensure focus shape uses solid stroke rendering for continuous hit area
    this._focusShape.setWidth(0); // Force simple stroke rendering

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

    // Control points placed by the user are stored in the model. The others follow the topics ...
    this.applyModelControlPoints();

    // Reposition all nodes ...
    this.updatePositions();

    // Initialize handler ..

    this._onFocusHandler = (event) => {
      this.setOnFocus(true);
      event.stopPropagation();
      event.preventDefault();
    };
  }

  override setStroke(color: string, style: LineStrokeStyle, _opacity: number): void {
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

  /** A relationship is always a thin curve (LineType.THIN_CURVED). */
  protected buildLine(): CurvedLine {
    return BaseConnectionLine.createCurvedLine(10);
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
    const srcCustom = line2d.isSrcControlPointCustom();
    const destCustom = line2d.isDestControlPointCustom();
    if (!destCustom && !srcCustom) {
      // Use default control points and basic connection points
      ctrlPoints = Shape.calculateDefaultControlPoints(sPos, tPos);
      line2d.setFrom(sPos.x, sPos.y);
      line2d.setTo(tPos.x, tPos.y);
    } else {
      // Control points have been manually moved - recalculate best connection points
      ctrlPoints = this.recalculateCustomControlPoints(line2d);

      // An end the user did not shape keeps following its topic, with a default control point ...
      if (!srcCustom || !destCustom) {
        const from = srcCustom ? line2d.getFrom() : sPos;
        const to = destCustom ? line2d.getTo() : tPos;
        line2d.setFrom(from.x, from.y);
        line2d.setTo(to.x, to.y);
        const defaults = Shape.calculateDefaultControlPoints(from, to);
        ctrlPoints = [
          srcCustom ? ctrlPoints[0] : defaults[0],
          destCustom ? ctrlPoints[1] : defaults[1],
        ];
      }
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

    // The stacking is set once, by addToWorkspace: moving a part here would make the order of
    // the relationships depend on the order they are redrawn in (BL5-145).

    this._endArrow.setVisibility(this.isVisible() && this._showEndArrow);
    this._startArrow.setVisibility(this.isVisible() && this._showStartArrow);

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

    // The line is always a curve (buildLine)
    const controlPoints = this._line.getControlPoints();
    // Start arrow points from source toward first control point (direction of flow)
    this._startArrow.setControlPoint(controlPoints[0]);
    // End arrow points from target back toward second control point (direction of flow)
    this._endArrow.setControlPoint(controlPoints[1]);
  }

  override addToWorkspace(workspace: Canvas): void {
    this.updatePositions();

    // Add focus shape for event handling (invisible but present)
    workspace.append(this._focusShape.getElementClass());
    workspace.append(this._controlPointsController);

    if (workspace.isReadOnly()) {
      this._line.setCursor('default');
      this._focusShape.setCursor('default');
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

    // Below the topics, so that a relationship crossing a topic does not take its clicks, and
    // below the relationships already there: the stacking follows the order relationships are
    // added in, not the order they are redrawn or focused in (BL5-145). From the top: the line,
    // its arrows, then the focus shape and arrows, which highlight them from behind.
    this.moveToBack(); // Main relationship line
    this._startArrow.moveToBack();
    this._endArrow.moveToBack();
    this._focusShape.getElementClass().moveToBack();
    this._focusStartArrow.moveToBack();
    this._focusEndArrow.moveToBack();

    this.positionArrows();
    this.redraw();
  }

  override removeFromWorkspace(workspace: Canvas): void {
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
   * Applies the control points stored in the model, and marks them as custom. A stored point is
   * relative to the connection point it was placed from, the snap point facing it.
   */
  private applyModelControlPoints(): void {
    this.applyModelControlPoint(PivotType.Start);
    this.applyModelControlPoint(PivotType.End);
  }

  /**
   * Applies the control point stored in the model for one end: custom if there is one, default
   * otherwise. Call redraw afterwards.
   */
  applyModelControlPoint(pivot: PivotType): void {
    const line = this._line;
    if (pivot === PivotType.Start) {
      const srcCtrlPoint = this._model.getSrcCtrlPoint();
      if (srcCtrlPoint) {
        const from = this.connectionPointFor(PivotType.Start, srcCtrlPoint);
        line.setFrom(from.x, from.y);
        line.setSrcControlPoint({ ...srcCtrlPoint });
      }
      line.setIsSrcControlPointCustom(Boolean(srcCtrlPoint));
    } else {
      const destCtrlPoint = this._model.getDestCtrlPoint();
      if (destCtrlPoint) {
        const to = this.connectionPointFor(PivotType.End, destCtrlPoint);
        line.setTo(to.x, to.y);
        line.setDestControlPoint({ ...destCtrlPoint });
      }
      line.setIsDestControlPointCustom(Boolean(destCtrlPoint));
    }
  }

  /**
   * Finds the snap point a control point is relative to: the one facing the control point
   * placed from it. The search starts from a point, the centre of the topic by default.
   */
  private static calculateConnectionPointFor(
    topic: Topic,
    ctrlPoint: PositionType,
    start: PositionType = topic.getPosition(),
  ): PositionType {
    let result = start;
    // The snap point depends on where the control point lands, which depends on the snap point.
    // Starting from the center of the topic, it settles in a step or two ...
    for (let i = 0; i < 3; i++) {
      const next = RelationshipSnap.calculateSnapPoint(topic, {
        x: result.x + ctrlPoint.x,
        y: result.y + ctrlPoint.y,
      });
      if (next.x === result.x && next.y === result.y) {
        break;
      }
      result = next;
    }
    return result;
  }

  /**
   * Remembers where the end of a released control point is: the snap point the drag placed it
   * from. Placing the control point again (redraw, undo, redo) then keeps that end, rather than
   * another snap point of the edge the control point also fits.
   */
  rememberReleasedControlPoint(pivot: PivotType): void {
    const line = this._line;
    const topic = pivot === PivotType.Start ? this._sourceTopic : this._targetTopic;
    const end = pivot === PivotType.Start ? line.getFrom() : line.getTo();
    const ctrlPoint = line.getControlPoints()[pivot];
    const pos = topic.getPosition();
    this._releasedOffsets[pivot].set(Relationship.keyOf(ctrlPoint), {
      x: end.x - pos.x,
      y: end.y - pos.y,
    });
  }

  /**
   * The connection point a custom control point of an end is placed from: where it was released,
   * if that is still a snap point the control point fits. Otherwise (the topic was resized, so its
   * snap points moved) the snap point the search reaches from there, and as on load if it was
   * never released.
   */
  private connectionPointFor(pivot: PivotType, ctrlPoint: PositionType): PositionType {
    const topic = pivot === PivotType.Start ? this._sourceTopic : this._targetTopic;
    const offset = this._releasedOffsets[pivot].get(Relationship.keyOf(ctrlPoint));
    if (offset) {
      const pos = topic.getPosition();
      const released = { x: pos.x + offset.x, y: pos.y + offset.y };
      const snap = RelationshipSnap.calculateSnapPoint(topic, {
        x: released.x + ctrlPoint.x,
        y: released.y + ctrlPoint.y,
      });
      // The offset went through a subtraction: compare with a tolerance ...
      if (Math.abs(snap.x - released.x) < 0.01 && Math.abs(snap.y - released.y) < 0.01) {
        return snap;
      }
      return Relationship.calculateConnectionPointFor(topic, ctrlPoint, released);
    }
    return Relationship.calculateConnectionPointFor(topic, ctrlPoint);
  }

  private static keyOf(point: PositionType): string {
    return `${point.x},${point.y}`;
  }

  private calculateRelationshipConnectionPoint(topic: Topic): PositionType {
    // Determine which topic we're calculating for
    const isSourceTopic = topic === this._sourceTopic;
    const otherTopic = isSourceTopic ? this._targetTopic : this._sourceTopic;
    const otherPos = otherTopic.getPosition();

    // Use the shared snap point calculation
    return RelationshipSnap.calculateSnapPoint(topic, otherPos);
  }

  /**
   * Places the ends of a line whose control points have been customized. A custom control point is
   * relative to the connection point it was placed from, as the model stores it: the end is placed
   * as by applyModelControlPoint (where it was released, or as on load), so the curve keeps its
   * shape relative to its topics when they move. The end being dragged stays where the drag put
   * it, on the snap point under the cursor.
   *
   * @param line2d The line to update
   * @returns The control points, relative to the connection points
   */
  private recalculateCustomControlPoints(line2d: CurvedLine): [PositionType, PositionType] {
    const [srcCtrlPoint, destCtrlPoint] = line2d.getControlPoints();
    const controlPoints = this._controlPointsController;

    const from = controlPoints.isDragging(PivotType.Start)
      ? line2d.getFrom()
      : this.connectionPointFor(PivotType.Start, srcCtrlPoint);
    const to = controlPoints.isDragging(PivotType.End)
      ? line2d.getTo()
      : this.connectionPointFor(PivotType.End, destCtrlPoint);

    line2d.setFrom(from.x, from.y);
    line2d.setTo(to.x, to.y);

    return [{ ...srcCtrlPoint }, { ...destCtrlPoint }];
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
        // The focus shape and arrows are below the line and its arrows (see addToWorkspace),
        // so that style changes stay visible.
        this._focusShape.setStroke(5, 'solid', '#3f96ff');

        // Show focus arrows if corresponding arrows are enabled
        this._focusStartArrow.setVisibility(this._showStartArrow);
        this._focusEndArrow.setVisibility(this._showEndArrow);
      } else {
        // Back to the barely visible hit shape: hiding it would leave only the 2px
        // line clickable.
        this.showHitShape();

        // Hide focus arrows
        this._focusStartArrow.setVisibility(false);
        this._focusEndArrow.setVisibility(false);
      }

      this._controlPointsController.setVisibility(focus);
      this._onFocus = focus;
      this._sourceTopic.getDesigner()?.getModel().setRelationshipSelected(this, focus);
      this.fireEvent(focus ? 'ontfocus' : 'ontblur', this);
    }
  }

  /**
   * Puts the focus shape in its unfocused state: a 12px stroke, barely visible but
   * rendered, so that clicks near the line (or in the gaps of a dashed or dotted
   * stroke) still reach the relationship.
   */
  private showHitShape(): void {
    this._focusShape.setVisibility(true);
    this._focusShape.setOpacity(0.01); // Barely visible so it gets rendered
    // Critical: Use thick stroke (12px) to ensure coverage of gaps in dotted line
    this._focusShape.setStroke(12, 'solid', '#3f96ff');
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

    // Start arrow points from source toward first control point
    this._focusStartArrow.setControlPoint(ctrlPoints[0]);
    // End arrow points from target back toward second control point
    this._focusEndArrow.setControlPoint(ctrlPoints[1]);
  }

  /** Listens to the relationship's own events (see RelationshipEventMap). */
  addEvent(type: keyof RelationshipEventMap, listener: (event: Event) => void) {
    const line = this._line;
    line.addEvent(type, listener);
  }

  isOnFocus(): boolean {
    return this._onFocus;
  }

  isInWorkspace(): boolean {
    return this._isInWorkspace;
  }

  override setVisibility(value: boolean, fade = 0) {
    super.setVisibility(value, fade);

    // If visibility change, remove the on focus.
    this.setOnFocus(false);

    // Hide on focus shade when relationship is hidden
    this._endArrow.setVisibility(this._showEndArrow && value);
    this._startArrow.setVisibility(this._showStartArrow && value, fade);
    // The focus shape is the hit area of the relationship: present whenever the
    // relationship is visible.
    this._focusShape.setVisibility(value);
  }

  override setOpacity(opacity: number): void {
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
    this._focusShape.setDestControlPoint(control);
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

  fireEvent<K extends keyof RelationshipEventMap>(type: K, detail: RelationshipEventMap[K]): void {
    const elem = this._line;
    elem.trigger(type, detail);
  }

  private _applyStrokeStyle(strokeStyle: StrokeStyle): void {
    switch (strokeStyle) {
      case StrokeStyle.SOLID:
        // Removes the dash array (a '0,0' one would be a dash of zero length)
        this._line.setDashed();
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
