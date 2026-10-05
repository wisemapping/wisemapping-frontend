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
import { PathBuilder, fixed, type Vec } from './path';

/*
 * The ECG-like waveform of HeartbeatLine: a polyline along the chord with a signature spike,
 * offset along the chord's normal.
 */

/** One node of the pattern: `pos` along the chord (0 to 1), `amp` across it (share of the amplitude). */
export type HeartbeatNode = { readonly pos: number; readonly amp: number };

/** The waveform, from the source (0) to the target (1). */
export const HEARTBEAT_PATTERN: readonly HeartbeatNode[] = Object.freeze([
  { pos: 0.1, amp: 0 },
  { pos: 0.18, amp: 0.15 },
  { pos: 0.24, amp: -0.25 },
  { pos: 0.3, amp: 0 },
  { pos: 0.36, amp: 0 },
  { pos: 0.44, amp: 1 },
  { pos: 0.48, amp: -0.6 },
  { pos: 0.52, amp: 0.2 },
  { pos: 0.56, amp: -0.1 },
  { pos: 0.6, amp: 0 },
  { pos: 0.66, amp: 0.12 },
  { pos: 0.72, amp: -0.18 },
  { pos: 0.78, amp: 0 },
  { pos: 0.84, amp: 0.08 },
  { pos: 0.9, amp: -0.08 },
  { pos: 0.96, amp: 0 },
]);

/** Coordinates are written with 1 decimal (a negative zero is kept as `-0.0`). */
const format = fixed(1);

/**
 * The spike amplitude for a chord of `distance`: 35 % of the length up to 60, scaled by the
 * stroke width, with a floor of 10 that never exceeds the base amplitude (otherwise a 1 unit
 * line would draw a ±10 spike).
 */
export const heartbeatAmplitude = (distance: number, strokeWidth: number): number => {
  const amplitudeBase = Math.min(distance * 0.35, 60);
  return Math.max(Math.min(10, amplitudeBase), amplitudeBase * (0.4 + strokeWidth * 0.04));
};

/**
 * The points of the waveform, from `from` to `to` inclusive. The wobble is seeded from the
 * length, not the absolute ends, so the shape does not change when the whole line moves
 * (W-STALEPATH). `null` when the ends coincide: there is nothing to draw.
 */
export const heartbeatPoints = (from: Vec, to: Vec, strokeWidth: number): Vec[] | null => {
  if (from.x === to.x && from.y === to.y) {
    return null;
  }
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;

  const perpX = -(dy / distance);
  const perpY = dx / distance;

  const amplitude = heartbeatAmplitude(distance, strokeWidth);
  const wobble = 1 + Math.sin(distance * 0.05) * 0.15;

  const points: Vec[] = [from];
  HEARTBEAT_PATTERN.forEach((node) => {
    const offset = node.amp * amplitude * wobble;
    points.push({
      x: from.x + dx * node.pos + perpX * offset,
      y: from.y + dy * node.pos + perpY * offset,
    });
  });
  points.push(to);
  return points;
};

/** The `d` of the waveform (see heartbeatPoints), or `null` when the ends coincide. */
export const heartbeatPathData = (from: Vec, to: Vec, strokeWidth: number): string | null => {
  const points = heartbeatPoints(from, to, strokeWidth);
  if (!points) {
    return null;
  }
  const path = new PathBuilder(format);
  points.forEach((p, i) => (i === 0 ? path.moveTo(p) : path.lineTo(p)));
  return path.toString();
};
