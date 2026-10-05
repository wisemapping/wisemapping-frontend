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

/*
 * The closed sets of values web2d accepts, each derived from an `as const` list so that the type
 * and its runtime guard cannot drift apart.
 */

const isOneOf =
  <T extends string>(values: readonly T[]) =>
  (value: unknown): value is T =>
    (values as readonly unknown[]).includes(value);

/** Stroke dash styles (see ElementPeer.DASH_ARRAYS). */
export const STROKE_STYLES = ['solid', 'dot', 'dash', 'dashdot', 'longdash'] as const;
export type StrokeStyle = (typeof STROKE_STYLES)[number];
export const isStrokeStyle = isOneOf(STROKE_STYLES);

/** PolyLine path styles. */
export const POLYLINE_STYLES = ['Straight', 'MiddleStraight', 'MiddleCurved', 'Curved'] as const;
export type PolyLineStyle = (typeof POLYLINE_STYLES)[number];
export const isPolyLineStyle = isOneOf(POLYLINE_STYLES);

/** The axis a connection line leaves its source along. */
export const ORIENTATIONS = ['horizontal', 'vertical'] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

/** Font styles. */
export const FONT_STYLES = ['normal', 'italic'] as const;
export type FontStyleType = (typeof FONT_STYLES)[number];

/** Font weights. */
export const FONT_WEIGHTS = ['normal', 'bold'] as const;
export type FontWeightType = (typeof FONT_WEIGHTS)[number];

/** What getType() returns, one per element class (StraightLine is 'Line'). */
export const ELEMENT_TYPES = [
  'Workspace',
  'Group',
  'Rect',
  'Ellipse',
  'Image',
  'Text',
  'Arrow',
  'Line',
  'PolyLine',
  'CurvedLine',
  'ArcLine',
  'HeartbeatLine',
  'NeuronLine',
] as const;
export type ElementType = (typeof ELEMENT_TYPES)[number];
export const isElementType = isOneOf(ELEMENT_TYPES);
