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

import { CurvedLine, PolyLine } from '@wisemapping/web2d';
import type { Line } from '@wisemapping/web2d';
import { $assert } from './util/assert';
import PositionType from './PositionType';
import Topic from './Topic';
import TopicConfig from './TopicConfig';
import ArcLine from './model/ArcLine';
import BaseConnectionLine, { LineType } from './BaseConnectionLine';
import Canvas from './Canvas';

export { LineType };

/**
 * TopicConnection represents hierarchical parent-child connections in the mindmap
 */
class TopicConnection extends BaseConnectionLine {
  private _parentTopic: Topic; // The parent topic

  private _childTopic: Topic; // The child topic

  constructor(childTopic: Topic, parentTopic: Topic, type: LineType = LineType.THIN_CURVED) {
    super(type);
    $assert(childTopic !== parentTopic, 'Circular connection');

    // Child connects to parent
    this._parentTopic = parentTopic;
    this._childTopic = childTopic;

    // Initialize line after setting topics
    this.initializeLine();
    this._color = this.updateColor();
  }

  protected getLineWidth(): number {
    return this._parentTopic.isCentralTopic() ? 15 : 3;
  }

  protected getLineWidthOrganic(): number {
    return this._parentTopic.isCentralTopic() ? 20 : 5;
  }

  protected createArcLine(): Line {
    return new ArcLine(this._childTopic, this._parentTopic);
  }

  protected override initializeLine(): void {
    super.initializeLine();
    // Set orientation for polylines and arc lines based on parent topic
    const orientation = this._parentTopic.getOrientation();
    if (this._line instanceof PolyLine) {
      this._line.setOrientation(orientation);
    } else if (this._line instanceof ArcLine) {
      this._line.setOrientation(orientation);
    }
  }

  private _getCtrlPoints(childTopic: Topic, parentTopic: Topic): [PositionType, PositionType] {
    // Child's outgoing point connects to parent's incoming point
    const childPos = childTopic.workoutOutgoingConnectionPoint(parentTopic.getPosition());
    const parentPos = parentTopic.workoutIncomingConnectionPoint(childTopic.getPosition());

    // Get orientation from the parent topic
    const orientation = parentTopic.getOrientation();

    if (orientation === 'vertical') {
      // Tree layout: vertical connections (parent above, child below)
      const deltaY = (childPos.y - parentPos.y) / 3;

      // For organic curved lines in vertical layout
      if (this.getLineType() === LineType.THICK_CURVED_ORGANIC) {
        const deltaX = (childPos.x - parentPos.x) / 2;

        // Simple seed for consistent but unique curves
        const seed = Math.abs(childPos.x + childPos.y + parentPos.x + parentPos.y);
        const random1 = (Math.sin(seed * 0.1) + 1) / 2;
        const random2 = (Math.sin(seed * 0.15 + 1) + 1) / 2;

        // Create organic S-curve with subtle variations
        const curveIntensity = 1.2 + random1 * 0.6; // 1.2 to 1.8
        const asymmetry = (random2 - 0.5) * 0.4; // -0.2 to 0.2

        return [
          {
            x: -deltaX * 1.3 + asymmetry * 0.3,
            y: deltaY * curveIntensity + asymmetry * 0.5,
          },
          {
            x: deltaX * 0.8 - asymmetry * 0.3,
            y: deltaY * 0.4 * curveIntensity - asymmetry * 0.5,
          },
        ];
      }

      // Vertical control points for tree layout
      return [
        { x: 0, y: deltaY },
        { x: 0, y: -deltaY },
      ];
    }
    // Mindmap layout: horizontal connections
    const deltaX = (childPos.x - parentPos.x) / 3;

    // For organic curved lines, create simple hand-drawn style
    if (this.getLineType() === LineType.THICK_CURVED_ORGANIC) {
      const deltaY = (childPos.y - parentPos.y) / 2;

      // Simple seed for consistent but unique curves
      const seed = Math.abs(childPos.x + childPos.y + parentPos.x + parentPos.y);
      const random1 = (Math.sin(seed * 0.1) + 1) / 2;
      const random2 = (Math.sin(seed * 0.15 + 1) + 1) / 2;

      // Create organic S-curve with subtle variations
      const curveIntensity = 1.2 + random1 * 0.6; // 1.2 to 1.8
      const asymmetry = (random2 - 0.5) * 0.4; // -0.2 to 0.2

      return [
        {
          x: deltaX * curveIntensity + asymmetry * 0.5,
          y: -deltaY * 1.3 + asymmetry * 0.3,
        },
        {
          x: deltaX * 0.4 * curveIntensity - asymmetry * 0.5,
          y: deltaY * 0.8 - asymmetry * 0.3,
        },
      ];
    }

    return [
      { x: deltaX, y: 0 },
      { x: -deltaX, y: 0 },
    ];
  }

  private updateColor(): string {
    // In case that the main topic has changed the color, overwrite the main topic definiton.
    const color = this._childTopic.getConnectionColor(this._childTopic.getThemeVariant());

    this._color = color;
    switch (this.getLineType()) {
      case LineType.POLYLINE_MIDDLE:
        this._line.setStroke(2, 'solid', color, 1);
        break;
      case LineType.POLYLINE_CURVED:
        this._line.setStroke(2, 'solid', color, 1);
        break;
      case LineType.POLYLINE_STRAIGHT:
        this._line.setStroke(2, 'solid', color, 1);
        break;
      case LineType.THIN_CURVED:
        this._line.setStroke(2, 'solid', color, 1);
        this._line.setFill(color, 1);
        break;
      case LineType.THICK_CURVED:
        this._line.setStroke(2, 'solid', color, 1);
        this._line.setFill(color, 1);
        break;
      case LineType.THICK_CURVED_ORGANIC:
        this._line.setStroke(2, 'solid', color, 1);
        this._line.setFill(color, 1);
        break;
      case LineType.ARC:
        this._line.setStroke(2, 'solid', color, 1);
        break;
      case LineType.HEARTBEAT:
        this._line.setStroke(this._parentTopic.isCentralTopic() ? 4.5 : 3, 'solid', color, 1);
        this._line.setFill('none', 1);
        break;
      case LineType.NEURON:
        this._line.setStroke(this._parentTopic.isCentralTopic() ? 4 : 3, 'solid', color, 1);
        this._line.setFill('none', 1);
        break;
      default:
        throw new Error(`Unhandled line type: ${this.getLineType()}`);
    }
    return color;
  }

  redraw(): void {
    const line2d = this._line;
    const childTopic = this._childTopic;
    const childPosition = childTopic.getPosition();

    const parentTopic = this._parentTopic;
    const parentPosition = parentTopic.getPosition();

    const childConnectionPos = childTopic.workoutOutgoingConnectionPoint(parentPosition);
    const parentConnectionPos = parentTopic.workoutIncomingConnectionPoint(childPosition);

    line2d.setFrom(parentConnectionPos.x, parentConnectionPos.y);
    line2d.setTo(childConnectionPos.x, childConnectionPos.y);

    // Update orientation for polylines and arc lines
    const orientation = parentTopic.getOrientation();
    if (line2d instanceof PolyLine) {
      line2d.setOrientation(orientation);
    } else if (line2d instanceof ArcLine) {
      line2d.setOrientation(orientation);
    }

    if (
      this.getLineType() === LineType.THICK_CURVED ||
      this.getLineType() === LineType.THIN_CURVED ||
      this.getLineType() === LineType.THICK_CURVED_ORGANIC
    ) {
      const ctrlPoints = this._getCtrlPoints(this._childTopic, this._parentTopic);
      (line2d as CurvedLine).setSrcControlPoint(ctrlPoints[0]);
      (line2d as CurvedLine).setDestControlPoint(ctrlPoints[1]);
    }

    // Add connector ...
    this._positionLine(parentTopic);

    // Update color ...
    this.updateColor();
  }

  protected _positionLine(parentTopic: Topic): void {
    const parentPosition = parentTopic.getPosition();
    const offset = TopicConfig.CONNECTOR_WIDTH / 2;
    const parentTopicSize = parentTopic.getSize();

    const connector = parentTopic.getShrinkConnector();
    if (!connector) {
      return;
    }

    // Get orientation from the parent topic
    const orientation = parentTopic.getOrientation();

    let y: number;
    let x: number;

    if (orientation === 'vertical') {
      // Tree layout: connector at bottom center of parent
      x = parentTopicSize.width / 2 - offset; // centered horizontally (accounting for connector width)
      y = parentTopicSize.height; // at bottom
      connector.setPosition(x, y);
    } else {
      // Mindmap layout: connector on left or right side
      if (parentTopic.getShapeType() === 'line') {
        y = parentTopicSize.height;
      } else {
        y = parentTopicSize.height / 2;
      }
      y -= offset;

      if (Math.sign(parentPosition.x) > 0) {
        x = parentTopicSize.width;
      } else {
        x = -TopicConfig.CONNECTOR_WIDTH;
      }
      connector.setPosition(x, y);
    }
  }

  setStroke(color: string, style: string, opacity: number): void {
    this._line.setStroke(1, style, color, opacity);
    this._color = color;
  }

  getStrokeColor(): string {
    return this._color;
  }

  addToWorkspace(workspace: Canvas): void {
    super.addToWorkspace(workspace);
    // Ensure connection lines are rendered below topics
    this._line.moveToBack();
  }

  getParentTopic(): Topic {
    return this._parentTopic;
  }

  getChildTopic(): Topic {
    return this._childTopic;
  }

  getType(): string {
    return 'TopicConnection';
  }
}

export default TopicConnection;
