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
 * The organic spline of NeuronLine: a chain of cubic segments along the chord, with a
 * deterministic jitter driven by a seed in [0, 1].
 */

/** One cubic segment: its two control points and its end, all absolute. */
export type NeuronSegment = { readonly c1: Vec; readonly c2: Vec; readonly to: Vec };

/** Coordinates are written with 1 decimal (a negative zero is kept as `-0.0`). */
const format = fixed(1);

/** The seed for a line of `length`, in [0, 1]. */
export const neuronSeed = (length: number): number => (Math.sin(length * 0.37) + 1) / 2;

/** A pseudo-random value in [-amplitude, amplitude), fixed by the seed and the iteration. */
export const neuronRand = (seed: number, iteration: number, amplitude: number): number => {
  const value = Math.sin(seed * 100 + iteration * 7.13) * 43758.5453;
  return (value - Math.floor(value)) * 2 * amplitude - amplitude;
};

/**
 * The cubic segments from `from` to `to`: between 6 and 18 of them (one per 35 units). The last
 * one ends exactly at `to` (W-NEURONEND). `null` when the ends coincide: there is nothing to draw.
 */
export const neuronSegments = (from: Vec, to: Vec, seed: number): NeuronSegment[] | null => {
  if (from.x === to.x && from.y === to.y) {
    return null;
  }
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const unitX = dx / distance;
  const unitY = dy / distance;
  const perpX = -unitY;
  const perpY = unitX;

  const steps = Math.min(18, Math.max(6, Math.round(distance / 35)));
  const amplitude = Math.min(60, distance * 0.35);
  const rand = (iteration: number, amp: number) => neuronRand(seed, iteration, amp);
  const segments: NeuronSegment[] = [];

  let prevPoint = from;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const baseX = from.x + dx * t;
    const baseY = from.y + dy * t;

    const lateral =
      Math.sin(t * Math.PI * (1.5 + seed * 0.5) + seed * 6) *
      amplitude *
      (0.2 + rand(i, 0.6) * 0.6);
    const forward = (Math.cos(t * Math.PI * 2 + rand(i, 1) * 2) - 0.5) * amplitude * 0.08;

    const spikePhase = (Math.sin(t * Math.PI * 4 + seed * 10) + 1) / 2;
    const spike = spikePhase > 0.8 ? (spikePhase - 0.8) * 5 : 0;

    const last = i === steps;
    const targetX = last ? to.x : baseX + perpX * lateral + unitX * forward;
    const targetY = last ? to.y : baseY + perpY * lateral + unitY * forward;

    const ctrlOffset = distance / steps / 3;
    const c1 = {
      x: prevPoint.x + unitX * ctrlOffset + perpX * rand(i * 2, 0.4) * ctrlOffset,
      y: prevPoint.y + unitY * ctrlOffset + perpY * rand(i * 2 + 1, 0.4) * ctrlOffset,
    };
    const c2 = {
      x: targetX - unitX * ctrlOffset + perpX * rand(i * 3, 0.4) * ctrlOffset,
      y: targetY - unitY * ctrlOffset + perpY * rand(i * 3 + 1, 0.4) * ctrlOffset,
    };

    const end = {
      x: last ? targetX : targetX + perpX * spike,
      y: last ? targetY : targetY + perpY * spike,
    };
    segments.push({ c1, c2, to: end });
    prevPoint = end;
  }
  return segments;
};

/** The `d` of the spline (see neuronSegments), or `null` when the ends coincide. */
export const neuronPathData = (from: Vec, to: Vec, seed: number): string | null => {
  const segments = neuronSegments(from, to, seed);
  if (!segments) {
    return null;
  }
  const path = new PathBuilder(format).moveTo(from);
  segments.forEach((s) => path.curveTo(s.c1, s.c2, s.to));
  return path.toString();
};
