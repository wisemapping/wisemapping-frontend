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

import { CurvedLine, PolyLine, HeartbeatLine, NeuronLine } from '@wisemapping/web2d';
import type { Line, StrokeStyle } from '@wisemapping/web2d';
import type Canvas from './Canvas';

/**
 * The values are persisted (a topic's connStyle="N"), so each one is pinned: reordering the
 * members, or inserting one, must not renumber them.
 */
export enum LineType {
  THIN_CURVED = 0,
  POLYLINE_MIDDLE = 1,
  POLYLINE_CURVED = 2,
  POLYLINE_STRAIGHT = 3,
  THICK_CURVED = 4,
  THICK_CURVED_ORGANIC = 5,
  ARC = 6,
  HEARTBEAT = 7,
  NEURON = 8,
}

/**
 * Base class for all connection lines (both hierarchical and relationship). `L` is the type of
 * the web2d line it draws: any Line for a topic connection, a CurvedLine for a relationship.
 */
abstract class BaseConnectionLine<L extends Line = Line> {
  protected _line!: L;

  private _type: LineType;

  protected _color: string;

  constructor(type: LineType = LineType.THIN_CURVED) {
    this._type = type;
    this._color = '';
  }

  protected initializeLine(): void {
    this._line = this.buildLine();
  }

  /** Builds the web2d line of this connection. */
  protected abstract buildLine(): L;

  protected getLineTypeValue(): LineType {
    return this._type;
  }

  protected createLine(lineType: LineType): Line {
    let line: Line;
    switch (lineType) {
      case LineType.POLYLINE_MIDDLE:
        line = new PolyLine();
        (line as PolyLine).setStyle('MiddleStraight');
        break;
      case LineType.POLYLINE_CURVED:
        line = new PolyLine();
        (line as PolyLine).setStyle('Curved');
        break;
      case LineType.POLYLINE_STRAIGHT:
        line = new PolyLine();
        (line as PolyLine).setStyle('Straight');
        break;
      case LineType.THIN_CURVED:
        line = BaseConnectionLine.createCurvedLine(10);
        break;
      case LineType.THICK_CURVED:
        line = BaseConnectionLine.createCurvedLine(this.getLineWidth());
        break;
      case LineType.THICK_CURVED_ORGANIC:
        line = BaseConnectionLine.createCurvedLine(this.getLineWidthOrganic());
        break;
      case LineType.ARC:
        line = this.createArcLine();
        break;
      case LineType.HEARTBEAT:
        line = new HeartbeatLine();
        break;
      case LineType.NEURON:
        line = new NeuronLine();
        break;
      default: {
        const exhaustiveCheck: never = lineType;
        throw new Error(exhaustiveCheck);
      }
    }
    return line;
  }

  /** A curved line of `width` (the thin curve is 10). */
  protected static createCurvedLine(width: number): CurvedLine {
    const line = new CurvedLine();
    line.setWidth(width);
    return line;
  }

  protected abstract getLineWidth(): number;

  protected abstract getLineWidthOrganic(): number;

  protected abstract createArcLine(): Line;

  setVisibility(value: boolean, fade = 0): void {
    this._line.setVisibility(value, fade);
  }

  isVisible(): boolean {
    return this._line.isVisible();
  }

  setOpacity(opacity: number): void {
    this._line.setOpacity(opacity);
  }

  abstract redraw(): void;

  setStroke(color: string, style: StrokeStyle, opacity: number): void {
    this._line.setStroke(1, style, color, opacity);
    this._color = color;
  }

  addToWorkspace(workspace: Canvas): void {
    workspace.append(this._line.getElementClass());
  }

  removeFromWorkspace(workspace: Canvas): void {
    workspace.removeChild(this._line.getElementClass());
  }

  getLineType(): number {
    return this._type;
  }

  getLine(): L {
    return this._line;
  }

  moveToBack(): void {
    this._line.moveToBack();
  }

  moveToFront(): void {
    this._line.moveToFront();
  }
}

export default BaseConnectionLine;
