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
import type WorkspaceElement from './WorkspaceElement';
import type ElementPeer from './peer/svg/ElementPeer';
import type PositionType from './PositionType';
import type { ElementType, StrokeStyle } from './types';

/**
 * A line between two points, as mindplot draws connections: its ends, stroke, fill, visibility,
 * opacity, z-order and events. Every line class implements all of it.
 */
interface Line {
  setFrom(x: number, y: number): void;

  setTo(x: number, y: number): void;

  getFrom(): PositionType;

  getTo(): PositionType;

  setCursor(value: string): void;

  setStroke(width: number, style?: StrokeStyle | null, color?: string, opacity?: number): void;

  setFill(color: string, opacity: number): void;

  setVisibility(value: boolean, fade?: number): void;

  isVisible(): boolean;

  setOpacity(value: number): void;

  moveToFront(): void;

  moveToBack(): void;

  setTestId(value: string): void;

  trigger(value: string, event: unknown): void;

  getType(): ElementType;

  addEvent(value: string, listener: (event: Event, detail?: unknown) => void): void;

  removeEvent(value: string, listener: (event: Event, detail?: unknown) => void): void;

  getElementClass(): WorkspaceElement<ElementPeer>;
}

/** A line whose curve is shaped by two control points, and that can be dashed (CurvedLine). */
export interface ControlPointLine extends Line {
  setSrcControlPoint(value: PositionType): void;

  setDestControlPoint(value: PositionType): void;

  getControlPoints(): [PositionType, PositionType];

  isSrcControlPointCustom(): boolean;

  isDestControlPointCustom(): boolean;

  setIsSrcControlPointCustom(value: boolean): void;

  setIsDestControlPointCustom(value: boolean): void;

  /** Dashes the line; no length or spacing makes it solid again. */
  setDashed(length?: number, spacing?: number): void;
}

// A type cannot be `export default`ed by name under verbatimModuleSyntax.
// eslint-disable-next-line no-restricted-exports
export type { Line as default };
