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
import { LineType } from '../ConnectionLine';
import { FONT_WEIGHT_TYPES, FontWeightType } from '../FontWeightType';
import { FONT_STYLE_TYPES, FontStyleType } from '../FontStyleType';
import { TOPIC_SHAPE_TYPES, TopicShapeType } from '../model/INodeModel';
import ThemeType, { THEME_TYPES } from '../model/ThemeType';
import { BACKGROUND_PATTERN_TYPES, BackgroundPatternType } from '../model/CanvasStyleType';
import { StrokeStyle } from '../model/RelationshipModel';
import { LAYOUT_ORIENTATION, type LayoutType } from '../layout/LayoutType';

// Type guards for the attributes read from the map XML, which can hold any value. Each union is
// derived from its `as const` list, so a value can not be added to one and not the other.
const isOneOf = <T extends string>(values: readonly T[], value: string): value is T =>
  (values as readonly string[]).includes(value);

export const isFontWeightType = (value: string): value is FontWeightType =>
  isOneOf(FONT_WEIGHT_TYPES, value);

export const isFontStyleType = (value: string): value is FontStyleType =>
  isOneOf(FONT_STYLE_TYPES, value);

export const isTopicShapeType = (value: string): value is TopicShapeType =>
  isOneOf(TOPIC_SHAPE_TYPES, value);

export const isThemeType = (value: string): value is ThemeType => isOneOf(THEME_TYPES, value);

export const isBackgroundPatternType = (value: string): value is BackgroundPatternType =>
  isOneOf(BACKGROUND_PATTERN_TYPES, value);

// Keyed by the union, so the compiler reports a layout without orientation.
export const isLayoutType = (value: string): value is LayoutType =>
  Object.prototype.hasOwnProperty.call(LAYOUT_ORIENTATION, value);

export const isStrokeStyle = (value: string): value is StrokeStyle =>
  isOneOf(Object.values(StrokeStyle), value);

// LineType is a numeric enum: its object also maps each number back to its name.
export const isLineType = (value: number): value is LineType =>
  Number.isInteger(value) && typeof LineType[value] === 'string';
