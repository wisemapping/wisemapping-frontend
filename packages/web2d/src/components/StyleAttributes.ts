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

import type PositionType from './PositionType';
import type SizeType from './SizeType';

/*
 * The attribute bag an element constructor takes. Each key sets one argument of a setter
 * (width and height are the two arguments of setSize), and a combined key sets all of them from
 * one string ('1 solid black' for setStroke). The bag is applied with explicit code, in the order
 * of the first key of each setter: there is no reflection on method names.
 */

/** The attributes every element takes: its size, stroke, fill, visibility and opacity. */
export type ElementAttributes = {
  width?: number;
  height?: number;
  /** Combined `<width> <height>`. */
  size?: string;
  /** Combined `<width> <style> <color> <opacity>`, for example '1 solid black'. */
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: string;
  strokeColor?: string;
  strokeOpacity?: number;
  /** Combined `<color> <opacity>`, for example 'none 0'. */
  fill?: string;
  fillColor?: string;
  fillOpacity?: number;
  visibility?: boolean;
  opacity?: number;
};

/** The attributes of an element with a position (Rect, Ellipse, Image, Text, Group). */
export type PositionAttributes = {
  x?: number;
  y?: number;
  /** Combined `<x> <y>`. */
  position?: string;
};

/** The attributes of an element with its own coordinate system (Group, Workspace). */
export type CoordAttributes = {
  coordSizeWidth?: number;
  coordSizeHeight?: number;
  /** Combined `<width> <height>`. */
  coordSize?: string;
  coordOriginX?: number;
  coordOriginY?: number;
  /** Combined `<x> <y>`. */
  coordOrigin?: string;
};

export type ShapeAttributes = ElementAttributes & PositionAttributes;

export type GroupAttributes = ShapeAttributes & CoordAttributes;

/** A workspace is sized in CSS lengths ('400px') as well as in pixels. */
export type WorkspaceAttributes = Omit<ElementAttributes, 'width' | 'height'> &
  CoordAttributes & {
    width?: number | string;
    height?: number | string;
  };

/** Every attribute key. An element rejects the keys it has no setter for. */
type StyleAttributes = Omit<GroupAttributes, 'width' | 'height'> & WorkspaceAttributes;

/** The setters the attribute bag calls. */
export type AttributeSetter =
  'size' | 'position' | 'stroke' | 'fill' | 'coordSize' | 'coordOrigin' | 'visibility' | 'opacity';

export type AttributeValue = string | number | boolean;

/** The arguments collected for one setter, by position. A missing one is undefined. */
export type AttributeArguments = readonly (AttributeValue | undefined)[];

type AttributeName = keyof StyleAttributes;

/** A combined key: its string holds every argument of the setter. */
const COMBINED = -1;

/** For each key, its setter and its argument position (or COMBINED). */
const ATTRIBUTE_SLOTS: { readonly [K in AttributeName]-?: readonly [AttributeSetter, number] } = {
  size: ['size', COMBINED],
  width: ['size', 0],
  height: ['size', 1],

  position: ['position', COMBINED],
  x: ['position', 0],
  y: ['position', 1],

  stroke: ['stroke', COMBINED],
  strokeWidth: ['stroke', 0],
  strokeStyle: ['stroke', 1],
  strokeColor: ['stroke', 2],
  strokeOpacity: ['stroke', 3],

  fill: ['fill', COMBINED],
  fillColor: ['fill', 0],
  fillOpacity: ['fill', 1],

  coordSize: ['coordSize', COMBINED],
  coordSizeWidth: ['coordSize', 0],
  coordSizeHeight: ['coordSize', 1],

  coordOrigin: ['coordOrigin', COMBINED],
  coordOriginX: ['coordOrigin', 0],
  coordOriginY: ['coordOrigin', 1],

  visibility: ['visibility', 0],
  opacity: ['opacity', 0],
};

const isAttributeName = (key: string): key is AttributeName =>
  Object.prototype.hasOwnProperty.call(ATTRIBUTE_SLOTS, key);

/** Splits a combined attribute ('1 solid black'): numeric parts become numbers. */
const parseCombined = (value: string): AttributeValue[] =>
  value
    .split(' ')
    .filter((arg) => arg !== '')
    .map((arg) => (Number.isFinite(Number(arg)) ? Number(arg) : arg));

/**
 * The setter calls of an attribute bag, in the order of the first key of each setter. A key set
 * to undefined is skipped. A later key wins over an earlier one for the same argument, and a
 * combined key keeps the positions it does not cover. An unknown key throws.
 */
export const collectAttributeCalls = (
  attributes: StyleAttributes,
): Map<AttributeSetter, AttributeArguments> => {
  const calls = new Map<AttributeSetter, Array<AttributeValue | undefined>>();
  Object.keys(attributes).forEach((key) => {
    if (!isAttributeName(key)) {
      throw new Error(`Unsupported attribute: ${key}`);
    }
    const [setter, position] = ATTRIBUTE_SLOTS[key];
    const value = attributes[key];
    if (position === COMBINED) {
      if (typeof value === 'string') {
        const args = calls.get(setter) ?? [];
        parseCombined(value).forEach((arg, i) => {
          args[i] = arg;
        });
        calls.set(setter, args);
      }
    } else if (value !== undefined) {
      const args = calls.get(setter) ?? [];
      args[position] = value;
      calls.set(setter, args);
    }
  });
  return calls;
};

/** A numeric argument: a number, or a string or boolean converted with Number(). */
export const toNumber = (value: AttributeValue | undefined): number | undefined =>
  value === undefined ? undefined : Number(value);

/** A text argument (a color or a style). */
export const toText = (value: AttributeValue | undefined): string | undefined =>
  value === undefined ? undefined : String(value);

/** A length that may be a number or a CSS length ('400px'), kept as given. */
export const toLength = (value: AttributeValue | undefined): number | string | undefined =>
  typeof value === 'boolean' ? String(value) : value;

/** The x and y of setPosition or setCoordOrigin: a missing one keeps the current value. */
export const pointArguments = (
  args: AttributeArguments,
  current: PositionType,
): [x: number, y: number] => [toNumber(args[0]) ?? current.x, toNumber(args[1]) ?? current.y];

/** The width and height of setCoordSize: a missing one keeps the current value. */
export const sizeArguments = (
  args: AttributeArguments,
  current: SizeType,
): [width: number, height: number] => [
  toNumber(args[0]) ?? current.width,
  toNumber(args[1]) ?? current.height,
];

export default StyleAttributes;
